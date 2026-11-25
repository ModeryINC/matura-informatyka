import type { FunctionTask, ProgramTask } from '../types';
import type { WorkerRequest, WorkerResponse } from './protocol';
import { PythonRunner, TIMEOUT_MESSAGE, type WorkerLike } from './runner';

/** Sztuczny worker: odpowiada według podanej funkcji, bez prawdziwego Pythona. */
class FakeWorker implements WorkerLike {
  private messageListeners: ((event: MessageEvent<WorkerResponse>) => void)[] = [];
  terminated = false;
  received: WorkerRequest[] = [];

  private respond: (request: WorkerRequest) => WorkerResponse | null;

  constructor(respond: (request: WorkerRequest) => WorkerResponse | null) {
    this.respond = respond;
  }

  postMessage(message: WorkerRequest) {
    this.received.push(message);
    const response = message.type === 'init' ? ({ type: 'ready' } as const) : this.respond(message);
    if (response) queueMicrotask(() => this.emit(response));
  }

  addEventListener(type: string, listener: (event: never) => void) {
    if (type === 'message') this.messageListeners.push(listener as never);
  }

  emit(data: WorkerResponse) {
    for (const listener of this.messageListeners)
      listener({ data } as MessageEvent<WorkerResponse>);
  }

  terminate() {
    this.terminated = true;
  }
}

const programTask: ProgramTask = {
  id: 't',
  sessionId: '2024/maj',
  number: '1',
  title: 'T',
  part: 2,
  points: 1,
  topics: ['napisy'],
  summary: '',
  starterCode: '',
  kind: 'program',
  checks: [
    { label: 'Przykład', files: { 'dane.txt': 'arkusze/przyklad.txt' }, expected: '3' },
    { label: 'Dane', files: { 'dane.txt': 'arkusze/dane.txt' }, expected: '10\n20' },
  ],
};

const functionTask: FunctionTask = {
  ...programTask,
  kind: 'function',
  functionName: 'dodaj',
  tests: [
    { args: [1, 2], expected: 3 },
    { args: [2, 2], expected: 4 },
  ],
};

const makeRunner = (
  respond: (request: WorkerRequest) => WorkerResponse | null,
  timeoutMs = 1000,
) => {
  const workers: FakeWorker[] = [];
  const runner = new PythonRunner({
    createWorker: () => {
      const worker = new FakeWorker(respond);
      workers.push(worker);
      return worker;
    },
    resolveUrl: (path) => `/base/${path}`,
    timeoutMs,
  });
  return { runner, workers };
};

describe('PythonRunner', () => {
  it('sprawdza program na wszystkich zestawach danych', async () => {
    const { runner, workers } = makeRunner((request) =>
      request.type === 'program'
        ? {
            type: 'program-result',
            id: request.id,
            runs: [
              { stdout: 'Wynik: 3\n', error: null },
              { stdout: '10\n21\n', error: null },
            ],
          }
        : null,
    );
    const result = await runner.submit(programTask, 'print(3)');
    expect(result.passed).toBe(false);
    expect(result.results.map((r) => r.passed)).toEqual([true, false]);
    const request = workers[0]!.received[1] as Extract<WorkerRequest, { type: 'program' }>;
    expect(request.runs).toEqual([
      { 'dane.txt': '/base/arkusze/przyklad.txt' },
      { 'dane.txt': '/base/arkusze/dane.txt' },
    ]);
  });

  it('oznacza błąd Pythona jako niezaliczony test', async () => {
    const { runner } = makeRunner((request) =>
      request.type === 'program'
        ? {
            type: 'program-result',
            id: request.id,
            runs: [
              { stdout: '3', error: 'NameError' },
              { stdout: '10\n20', error: null },
            ],
          }
        : null,
    );
    const result = await runner.submit(programTask, 'x');
    expect(result.results[0]).toMatchObject({ passed: false, error: 'NameError' });
    expect(result.results[1]!.passed).toBe(true);
  });

  it('sprawdza funkcję zestawem testów', async () => {
    const { runner } = makeRunner((request) =>
      request.type === 'function'
        ? {
            type: 'function-result',
            id: request.id,
            result: {
              error: null,
              stdout: '',
              results: [
                { passed: true, actual: '3' },
                { passed: false, actual: '5' },
              ],
            },
          }
        : null,
    );
    const result = await runner.submit(functionTask, 'def dodaj(a, b): ...');
    expect(result.passed).toBe(false);
    expect(result.results).toEqual([
      { label: 'dodaj(1, 2)', expected: '3', actual: '3', passed: true },
      { label: 'dodaj(2, 2)', expected: '4', actual: '5', passed: false },
    ]);
  });

  it('zgłasza błąd definicji funkcji', async () => {
    const { runner } = makeRunner((request) =>
      request.type === 'function'
        ? {
            type: 'function-result',
            id: request.id,
            result: { error: 'SyntaxError', stdout: '', results: [] },
          }
        : null,
    );
    const result = await runner.submit(functionTask, 'def');
    expect(result.passed).toBe(false);
    expect(result.results).toHaveLength(1);
    expect(result.results[0]!.error).toBe('SyntaxError');
  });

  it('po przekroczeniu limitu czasu kończy workera i uruchamia nowy', async () => {
    let hang = true;
    const { runner, workers } = makeRunner(
      (request) =>
        request.type === 'program' && !hang
          ? {
              type: 'program-result',
              id: request.id,
              runs: [
                { stdout: '3', error: null },
                { stdout: '10 20', error: null },
              ],
            }
          : null,
      20,
    );
    const result = await runner.submit(programTask, 'while True: pass');
    expect(result.passed).toBe(false);
    expect(result.results[0]!.error).toBe(TIMEOUT_MESSAGE);
    expect(workers[0]!.terminated).toBe(true);

    hang = false;
    const second = await runner.execute(programTask, 'print(3)');
    expect(second).toEqual({ stdout: '3', error: null });
    expect(workers).toHaveLength(2);
  });

  it('przekazuje dane wejściowe i wyjście na bieżąco (konsola)', async () => {
    const { runner, workers } = makeRunner(() => null);
    const chunks: string[] = [];
    const pending = runner.execute(programTask, 'print(input())', {
      stdin: '7\n',
      onOutput: (text) => chunks.push(text),
    });
    await vi.waitFor(() => expect(workers[0]!.received).toHaveLength(2));
    const request = workers[0]!.received[1] as Extract<WorkerRequest, { type: 'program' }>;
    expect(request).toMatchObject({ stdin: '7\n', stream: true });

    workers[0]!.emit({ type: 'output', id: request.id, text: '7\n' });
    expect(chunks).toEqual(['7\n']);
    workers[0]!.emit({
      type: 'program-result',
      id: request.id,
      runs: [{ stdout: '7\n', error: null }],
    });
    expect(await pending).toEqual({ stdout: '7\n', error: null });
  });

  it('po przekroczeniu czasu zachowuje wyjście zebrane w konsoli', async () => {
    const { runner, workers } = makeRunner(() => null, 300);
    const pending = runner.execute(programTask, 'while True: print(1)');
    await vi.waitFor(() => expect(workers[0]!.received).toHaveLength(2), { interval: 5 });
    const { id } = workers[0]!.received[1] as Extract<WorkerRequest, { type: 'program' }>;
    workers[0]!.emit({ type: 'output', id, text: '1\n1\n' });
    expect(await pending).toEqual({ stdout: '1\n1\n', error: TIMEOUT_MESSAGE });
  });

  it('nie wysyła wyjścia na bieżąco przy sprawdzaniu', async () => {
    const { runner, workers } = makeRunner((request) =>
      request.type === 'program'
        ? {
            type: 'program-result',
            id: request.id,
            runs: [
              { stdout: '3', error: null },
              { stdout: '10 20', error: null },
            ],
          }
        : null,
    );
    await runner.submit(programTask, 'print(3)');
    expect(workers[0]!.received[1]).toMatchObject({ stream: false });
  });

  it('uruchamia przykład bez plików z danymi', async () => {
    const { runner, workers } = makeRunner((request) =>
      request.type === 'program'
        ? { type: 'program-result', id: request.id, runs: [{ stdout: 'ok', error: null }] }
        : null,
    );
    expect(await runner.executeSnippet('print("ok")', { stdin: '1' })).toEqual({
      stdout: 'ok',
      error: null,
    });
    expect(workers[0]!.received[1]).toMatchObject({ runs: [{}], stdin: '1' });
  });

  it('informuje o zmianach stanu', async () => {
    const { runner } = makeRunner((request) =>
      request.type === 'program'
        ? { type: 'program-result', id: request.id, runs: [{ stdout: '', error: null }] }
        : null,
    );
    const statuses: string[] = [];
    runner.onStatus((s) => statuses.push(s));
    await runner.execute(programTask, '');
    expect(statuses).toEqual(['loading', 'ready', 'running', 'ready']);
  });

  it('zgłasza błąd ładowania Pyodide', async () => {
    const runner = new PythonRunner({
      createWorker: () => {
        const worker = new FakeWorker(() => null);
        worker.postMessage = (message) => {
          if (message.type === 'init')
            queueMicrotask(() => worker.emit({ type: 'init-error', message: 'offline' }));
        };
        return worker;
      },
    });
    const output = await runner.execute(programTask, '');
    expect(output.error).toContain('offline');
    expect(runner.status).toBe('error');
  });
});
