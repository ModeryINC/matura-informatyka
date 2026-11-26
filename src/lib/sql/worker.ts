/// <reference lib="webworker" />
/**
 * Web Worker z bazą SQLite (sql.js). Zapytania wykonują się poza wątkiem strony,
 * więc np. iloczyn kartezjański dużych tabel nie zamraża interfejsu – po limicie
 * czasu strona po prostu kończy workera.
 */
import initSqlJs, { type Database } from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm-browser.wasm?url';
import { createDatabase, execute, SQL_JS_CONFIG } from './engine';
import type { SqlWorkerRequest, SqlWorkerResponse } from './protocol';
import { parseTable } from './tables';

declare const self: DedicatedWorkerGlobalScope;

let db: Database | null = null;
const reply = (message: SqlWorkerResponse) => self.postMessage(message);

self.addEventListener('message', async (event: MessageEvent<SqlWorkerRequest>) => {
  const message = event.data;
  if (message.type === 'init') {
    try {
      const SQL = await initSqlJs({
        ...SQL_JS_CONFIG,
        locateFile: () => message.wasmUrl ?? wasmUrl,
      });
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
