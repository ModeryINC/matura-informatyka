import type { QueryOutcome } from './engine';
import { SQL_TIMEOUT_MESSAGE, SqlClient, type SqlWorkerLike } from './client';
import type { SqlWorkerRequest, SqlWorkerResponse } from './protocol';

/** Atrapa workera: odpowiada według podanej funkcji. */
class FakeWorker implements SqlWorkerLike {
  messages: SqlWorkerRequest[] = [];
  terminated = false;
  private listeners: ((event: MessageEvent<SqlWorkerResponse>) => void)[] = [];
  private errorListeners: ((event: ErrorEvent) => void)[] = [];
  private respond: (message: SqlWorkerRequest) => SqlWorkerResponse | null;
  constructor(respond: (message: SqlWorkerRequest) => SqlWorkerResponse | null) {
    this.respond = respond;
  }
  postMessage(message: SqlWorkerRequest) {
    this.messages.push(message);
    const response = this.respond(message);
    if (response) queueMicrotask(() => this.emit(response));
  }
  emit(response: SqlWorkerResponse) {
    for (const listener of this.listeners) listener({ data: response } as MessageEvent);
  }
  fail(message: string) {
    for (const listener of this.errorListeners) listener({ message } as ErrorEvent);
  }
  addEventListener(type: 'message' | 'error', listener: never) {
    if (type === 'message') this.listeners.push(listener);
    else this.errorListeners.push(listener);
  }
  terminate() {
    this.terminated = true;
  }
}

const outcome: QueryOutcome = {
  results: [{ columns: ['x'], rows: [[1]], truncated: false }],
  error: null,
  changes: 0,
};
const schema = [{ name: 'a', columns: ['x'], types: ['INTEGER' as const], rows: 1 }];

const okFetch = vi.fn(async () => new Response('x\n1\n'));
const tables = [{ name: 'a', path: 'arkusze/a.txt' }];

function setup(respond?: (m: SqlWorkerRequest) => SqlWorkerResponse | null, timeoutMs = 1000) {
  const workers: FakeWorker[] = [];
  const client = new SqlClient(tables, {
    fetchImpl: okFetch,
    timeoutMs,
    createWorker: () => {
      const worker = new FakeWorker(
        respond ??
          ((m) =>
            m.type === 'init'
              ? { type: 'ready', schema }
              : m.type === 'exec'
                ? { type: 'result', id: m.id, outcome }
                : null),
      );
      workers.push(worker);
      return worker;
    },
  });
  return { client, workers };
}

describe('SqlClient', () => {
  it('pobiera pliki, tworzy bazę i wykonuje zapytania', async () => {
    const { client, workers } = setup();
    await expect(client.init()).resolves.toEqual(schema);
    expect(workers[0]!.messages[0]).toEqual({
      type: 'init',
      tables: [{ spec: tables[0], content: 'x\n1\n' }],
    });
    await expect(client.run('SELECT 1')).resolves.toEqual(outcome);
    expect(workers).toHaveLength(1);
  });

  it('po przekroczeniu czasu kończy workera i przy kolejnym zapytaniu tworzy bazę od nowa', async () => {
    vi.useFakeTimers();
    try {
      const { client, workers } = setup(
        (m) => (m.type === 'init' ? { type: 'ready', schema } : null),
        50,
      );
      const pending = client.run('SELECT 1');
      await vi.advanceTimersByTimeAsync(60);
      await expect(pending).resolves.toEqual({
        results: [],
        error: SQL_TIMEOUT_MESSAGE,
        changes: 0,
      });
      expect(workers[0]!.terminated).toBe(true);
      void client.run('SELECT 2');
      await vi.advanceTimersByTimeAsync(0);
      expect(workers).toHaveLength(2);
      // Pliki pobieramy tylko raz.
      expect(okFetch).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
      okFetch.mockClear();
    }
  });

  it('zgłasza błąd tworzenia bazy i pobierania plików', async () => {
    const { client } = setup(() => ({ type: 'init-error', message: 'zepsute' }));
    await expect(client.init()).rejects.toThrow('Nie udało się utworzyć bazy danych: zepsute');
    const broken = new SqlClient(tables, {
      fetchImpl: async () => new Response('', { status: 404 }),
    });
    await expect(broken.init()).rejects.toThrow('Nie udało się pobrać pliku arkusze/a.txt.');
  });

  it('błąd workera kończy oczekujące zapytania', async () => {
    const { client, workers } = setup((m) =>
      m.type === 'init' ? { type: 'ready', schema } : null,
    );
    await client.init();
    const pending = client.run('SELECT 1');
    await Promise.resolve();
    workers[0]!.fail('awaria');
    await expect(pending).resolves.toMatchObject({ error: 'awaria' });
    client.dispose();
  });
});
