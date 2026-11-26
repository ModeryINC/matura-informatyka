/**
 * Baza danych zadania w przeglądarce: pobiera pliki z danymi, uruchamia workera
 * z SQLite, wykonuje zapytania z limitem czasu (po jego przekroczeniu kończy
 * workera i przy następnym zapytaniu tworzy bazę od nowa).
 */
import type { SqlTable } from '../../types';
import type { QueryOutcome } from './engine';
import type { SqlWorkerRequest, SqlWorkerResponse, TableInfo } from './protocol';
import { decodeText } from './tables';

/** Minimalny interfejs workera – pozwala podmienić go w testach. */
export interface SqlWorkerLike {
  postMessage(message: SqlWorkerRequest): void;
  addEventListener(
    type: 'message',
    listener: (event: MessageEvent<SqlWorkerResponse>) => void,
  ): void;
  addEventListener(type: 'error', listener: (event: ErrorEvent) => void): void;
  terminate(): void;
}

export interface SqlClientOptions {
  createWorker?: () => SqlWorkerLike;
  fetchImpl?: typeof fetch;
  /** Limit czasu jednego wykonania, w ms. */
  timeoutMs?: number;
}

export const SQL_TIMEOUT_MESSAGE =
  'Przekroczono limit czasu – zapytanie działa zbyt długo (może brakuje warunku złączenia tabel?). Baza zostanie wczytana od nowa.';

const defaultWorker = (): SqlWorkerLike =>
  new Worker(new URL('./worker.ts', import.meta.url), {
    type: 'module',
  }) as unknown as SqlWorkerLike;

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${encodeURI(path)}`;

export class SqlClient {
  private worker: SqlWorkerLike | null = null;
  private ready: Promise<TableInfo[]> | null = null;
  private contents: Promise<{ spec: SqlTable; content: string }[]> | null = null;
  private pending = new Map<number, (outcome: QueryOutcome) => void>();
  private nextId = 1;
  private readonly createWorker: () => SqlWorkerLike;
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;
  private readonly tables: SqlTable[];

  constructor(tables: SqlTable[], options: SqlClientOptions = {}) {
    this.tables = tables;
    this.createWorker = options.createWorker ?? defaultWorker;
    this.fetchImpl = options.fetchImpl ?? ((...args) => fetch(...args));
    this.timeoutMs = options.timeoutMs ?? 10_000;
  }

  /** Treść plików (pobierana raz; przy wczytaniu bazy od nowa nie pobieramy jej ponownie). */
  private loadContents() {
    this.contents ??= Promise.all(
      this.tables.map(async (spec) => {
        const response = await this.fetchImpl(assetUrl(spec.path));
        if (!response.ok) throw new Error(`Nie udało się pobrać pliku ${spec.path}.`);
        return { spec, content: decodeText(new Uint8Array(await response.arrayBuffer())) };
      }),
    );
    this.contents.catch(() => {
      this.contents = null;
    });
    return this.contents;
  }

  /** Wczytuje dane do nowej bazy; zwraca opis tabel. */
  init(): Promise<TableInfo[]> {
    if (this.ready) return this.ready;
    const ready = this.loadContents().then(
      (tables) =>
        new Promise<TableInfo[]>((resolve, reject) => {
          const worker = this.createWorker();
          this.worker = worker;
          worker.addEventListener('message', (event) => {
            const message = event.data;
            if (message.type === 'ready') resolve(message.schema);
            else if (message.type === 'init-error') {
              this.reset();
              reject(new Error(`Nie udało się utworzyć bazy danych: ${message.message}`));
            } else {
              this.pending.get(message.id)?.(message.outcome);
              this.pending.delete(message.id);
            }
          });
          worker.addEventListener('error', (event) => {
            const error = event.message || 'Błąd bazy danych';
            for (const resolvePending of this.pending.values())
              resolvePending({ results: [], error, changes: 0 });
            this.reset();
            reject(new Error(error));
          });
          worker.postMessage({ type: 'init', tables });
        }),
    );
    this.ready = ready;
    ready.catch(() => {
      if (this.ready === ready) this.ready = null;
    });
    return ready;
  }

  /** Wykonuje zapytanie (lub kilka poleceń rozdzielonych średnikami). */
  async run(sql: string): Promise<QueryOutcome> {
    await this.init();
    const worker = this.worker!;
    const id = this.nextId++;
    return new Promise<QueryOutcome>((resolve) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        this.reset();
        resolve({ results: [], error: SQL_TIMEOUT_MESSAGE, changes: 0 });
      }, this.timeoutMs);
      this.pending.set(id, (outcome) => {
        clearTimeout(timer);
        resolve(outcome);
      });
      worker.postMessage({ type: 'exec', id, sql });
    });
  }

  /** Kończy workera; następne zapytanie utworzy bazę z oryginalnymi danymi. */
  reset(): void {
    this.worker?.terminate();
    this.worker = null;
    this.ready = null;
    this.pending.clear();
  }

  dispose(): void {
    this.reset();
  }
}
