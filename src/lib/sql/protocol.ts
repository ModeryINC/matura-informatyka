/** Wiadomości między stroną a workerem z bazą SQLite. */
import type { SqlTable } from '../../types';
import type { QueryOutcome } from './engine';
import type { SqlType } from './tables';

/** Opis tabeli do panelu „Tabele” i podpowiedzi w edytorze. */
export interface TableInfo {
  name: string;
  columns: string[];
  types: SqlType[];
  rows: number;
}

export type SqlWorkerRequest =
  | { type: 'init'; tables: { spec: SqlTable; content: string }[]; wasmUrl?: string }
  | { type: 'exec'; id: number; sql: string };

export type SqlWorkerResponse =
  | { type: 'ready'; schema: TableInfo[] }
  | { type: 'init-error'; message: string }
  | { type: 'result'; id: number; outcome: QueryOutcome };
