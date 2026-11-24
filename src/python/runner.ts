import { outputMatches } from '../lib/compare';
import type { CheckResult, FunctionTask, ProgramTask, SubmissionResult, Task } from '../types';
import type { FileMap, FunctionRun, ProgramRun, WorkerRequest, WorkerResponse } from './protocol';

/** Minimalny interfejs workera – pozwala podmienić go w testach. */
export interface WorkerLike {
  postMessage(message: WorkerRequest): void;
  addEventListener(type: 'message', listener: (event: MessageEvent<WorkerResponse>) => void): void;
  addEventListener(type: 'error', listener: (event: ErrorEvent) => void): void;
  terminate(): void;
}

export type RunnerStatus = 'off' | 'loading' | 'ready' | 'running' | 'error';

export interface RunnerOptions {
  /** Fabryka workera (domyślnie prawdziwy worker z Pyodide). */
  createWorker?: () => WorkerLike;
  /** Zamiana ścieżki z `public/` na adres URL. */
  resolveUrl?: (path: string) => string;
  /** Limit czasu jednego sprawdzenia (bez ładowania Pyodide), w ms. */
  timeoutMs?: number;
}

/** Wynik zwykłego uruchomienia (bez porównywania z kluczem). */
export interface ExecutionOutput {
  stdout: string;
  error: string | null;
}

const defaultWorker = (): WorkerLike =>
  new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }) as unknown as WorkerLike;

export const TIMEOUT_MESSAGE =
  'Przekroczono limit czasu – sprawdź, czy program nie ma nieskończonej pętli.';

type Pending = {
  resolve: (response: WorkerResponse) => void;
  reject: (error: Error) => void;
};

/**
 * Zarządza workerem z Pyodide: leniwie go uruchamia, wysyła rozwiązania,
 * pilnuje limitu czasu (restartując workera) i porównuje wyniki z kluczem.
 */
export class PythonRunner {
  private worker: WorkerLike | null = null;
  private ready: Promise<void> | null = null;
  private pending = new Map<number, Pending>();
  private nextId = 1;
  private listeners = new Set<(status: RunnerStatus) => void>();
  private currentStatus: RunnerStatus = 'off';

  private readonly createWorker: () => WorkerLike;
  private readonly resolveUrl: (path: string) => string;
  private readonly timeoutMs: number;

  constructor(options: RunnerOptions = {}) {
    this.createWorker = options.createWorker ?? defaultWorker;
    this.resolveUrl =
      options.resolveUrl ?? ((path) => `${import.meta.env.BASE_URL}${encodeURI(path)}`);
    this.timeoutMs = options.timeoutMs ?? 20_000;
  }

  get status(): RunnerStatus {
    return this.currentStatus;
  }

  /** Subskrypcja zmian stanu (np. do pokazania „Ładowanie Pythona…”). */
  onStatus(listener: (status: RunnerStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setStatus(status: RunnerStatus) {
    this.currentStatus = status;
    for (const listener of this.listeners) listener(status);
  }

  /** Uruchamia workera i ładuje Pyodide (wywoływane automatycznie). */
  init(): Promise<void> {
    if (this.ready) return this.ready;
    this.setStatus('loading');
    const worker = this.createWorker();
    this.worker = worker;
    this.ready = new Promise<void>((resolve, reject) => {
      worker.addEventListener('message', (event) => {
        const message = event.data;
        if (message.type === 'ready') {
          this.setStatus('ready');
          resolve();
        } else if (message.type === 'init-error') {
          this.reset('error');
          reject(new Error(`Nie udało się załadować Pythona: ${message.message}`));
        } else {
          const pending = this.pending.get(message.id);
          this.pending.delete(message.id);
          pending?.resolve(message);
        }
      });
      worker.addEventListener('error', (event) => {
        const error = new Error(event.message || 'Błąd workera Pythona');
        for (const pending of this.pending.values()) pending.reject(error);
        this.reset('error');
        reject(error);
      });
    });
    worker.postMessage({ type: 'init' });
    return this.ready;
  }

  /** Kończy workera (np. po przekroczeniu czasu); kolejne wywołanie uruchomi nowy. */
  private reset(status: RunnerStatus = 'off') {
    this.worker?.terminate();
    this.worker = null;
    this.ready = null;
    this.pending.clear();
    this.setStatus(status);
  }

  dispose(): void {
    this.reset('off');
  }

  private async request(build: (id: number) => WorkerRequest): Promise<WorkerResponse> {
    await this.init();
    const id = this.nextId++;
    this.setStatus('running');
    try {
      return await new Promise<WorkerResponse>((resolve, reject) => {
        const timer = setTimeout(() => {
          this.reset('off');
          reject(new Error(TIMEOUT_MESSAGE));
        }, this.timeoutMs);
        this.pending.set(id, {
          resolve: (response) => {
            clearTimeout(timer);
            resolve(response);
          },
          reject: (error) => {
            clearTimeout(timer);
            reject(error);
          },
        });
        this.worker!.postMessage(build(id));
      });
    } finally {
      if (this.currentStatus === 'running') this.setStatus('ready');
    }
  }

  private resolveFiles(files: Record<string, string>): FileMap {
    return Object.fromEntries(
      Object.entries(files).map(([name, path]) => [name, this.resolveUrl(path)]),
    );
  }

  private async runProgram(code: string, runs: FileMap[]): Promise<ProgramRun[]> {
    const response = await this.request((id) => ({ type: 'program', id, code, runs }));
    if (response.type === 'program-result') return response.runs;
    throw new Error(response.type === 'error' ? response.message : 'Nieoczekiwana odpowiedź');
  }

  private async runFunction(task: FunctionTask, code: string): Promise<FunctionRun> {
    const testsJson = JSON.stringify(task.tests);
    const response = await this.request((id) => ({
      type: 'function',
      id,
      code,
      functionName: task.functionName,
      testsJson,
    }));
    if (response.type === 'function-result') return response.result;
    throw new Error(response.type === 'error' ? response.message : 'Nieoczekiwana odpowiedź');
  }

  /**
   * Uruchamia kod bez sprawdzania. Dla zadań typu `program` używa plików
   * z pierwszego testu (zwykle dane przykładowe).
   */
  async execute(task: Task, code: string): Promise<ExecutionOutput> {
    const files = task.kind === 'program' && task.checks[0] ? task.checks[0].files : {};
    try {
      const [run] = await this.runProgram(code, [this.resolveFiles(files)]);
      return run ?? { stdout: '', error: null };
    } catch (error) {
      return { stdout: '', error: (error as Error).message };
    }
  }

  /** Sprawdza rozwiązanie na wszystkich testach zadania. */
  async submit(task: Task, code: string): Promise<SubmissionResult> {
    const started = performance.now();
    let results: CheckResult[];
    try {
      results =
        task.kind === 'program'
          ? await this.checkProgram(task, code)
          : await this.checkFunction(task, code);
    } catch (error) {
      results = [
        {
          label: 'Uruchomienie',
          passed: false,
          expected: '',
          actual: '',
          error: (error as Error).message,
        },
      ];
    }
    return {
      passed: results.length > 0 && results.every((r) => r.passed),
      results,
      durationMs: Math.round(performance.now() - started),
    };
  }

  private async checkProgram(task: ProgramTask, code: string): Promise<CheckResult[]> {
    const runs = await this.runProgram(
      code,
      task.checks.map((check) => this.resolveFiles(check.files)),
    );
    return task.checks.map((check, i) => {
      const run = runs[i] ?? { stdout: '', error: 'Brak wyniku' };
      return {
        label: check.label,
        expected: check.expected,
        actual: run.stdout,
        passed: run.error === null && outputMatches(run.stdout, check.expected),
        ...(run.error ? { error: run.error } : {}),
      };
    });
  }

  private async checkFunction(task: FunctionTask, code: string): Promise<CheckResult[]> {
    const run = await this.runFunction(task, code);
    if (run.error) {
      return [
        {
          label: 'Definicja funkcji',
          passed: false,
          expected: '',
          actual: run.stdout,
          error: run.error,
        },
      ];
    }
    return task.tests.map((test, i) => {
      const outcome = run.results[i] ?? { passed: false, actual: '', error: 'Brak wyniku' };
      return {
        label: `${task.functionName}(${test.args.map((a) => JSON.stringify(a)).join(', ')})`,
        expected: JSON.stringify(test.expected),
        actual: outcome.actual,
        passed: outcome.passed,
        ...(outcome.error ? { error: outcome.error } : {}),
      };
    });
  }
}

/** Wspólna instancja dla całej aplikacji (Pyodide ładujemy tylko raz). */
let shared: PythonRunner | null = null;
export const getRunner = (): PythonRunner => (shared ??= new PythonRunner());
