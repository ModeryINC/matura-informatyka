/// <reference lib="webworker" />
/**
 * Web Worker z bazą SQLite (sql.js). Zapytania wykonują się poza wątkiem strony,
 * więc np. iloczyn kartezjański dużych tabel nie zamraża interfejsu – po limicie
 * czasu strona po prostu kończy workera.
 */
import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm-browser.wasm?url';
import { createDatabase, execute, SQL_JS_CONFIG } from './engine';
import type { SqlWorkerRequest, SqlWorkerResponse } from './protocol';
import { parseTable } from './tables';

declare const self: DedicatedWorkerGlobalScope;

let db: Database | null = null;
let sqlJs: Promise<SqlJsStatic> | null = null;
const reply = (message: SqlWorkerResponse) => self.postMessage(message);

/** SQLite (WASM) ładowany raz – także z wyprzedzeniem, zanim przyjdą dane. */
function loadSqlJs(url?: string): Promise<SqlJsStatic> {
  sqlJs ??= initSqlJs({ ...SQL_JS_CONFIG, locateFile: () => url ?? wasmUrl });
  sqlJs.catch(() => {
    sqlJs = null;
  });
  return sqlJs;
}

self.addEventListener('message', async (event: MessageEvent<SqlWorkerRequest>) => {
  const message = event.data;
  if (message.type === 'warm') {
    void loadSqlJs(message.wasmUrl).catch(() => undefined);
  } else if (message.type === 'init') {
    try {
      const SQL = await loadSqlJs(message.wasmUrl);
      const tables = message.tables.map(({ spec, content }) => parseTable(spec, content));
      db?.close();
      db = createDatabase(SQL, tables);
      reply({
        type: 'ready',
        schema: tables.map((t) => ({
          name: t.name,
          columns: t.columns,
          types: t.types,
          rows: t.rows.length,
        })),
      });
    } catch (error) {
      reply({
        type: 'init-error',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  } else if (message.type === 'exec') {
    const outcome = db
      ? execute(db, message.sql)
      : { results: [], error: 'Baza danych nie jest gotowa.', changes: 0 };
    reply({ type: 'result', id: message.id, outcome });
  }
});
