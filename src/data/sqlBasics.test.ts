// @vitest-environment node
/** Każde zapytanie z „Podstaw SQL” działa na przykładowej bazie i coś zwraca. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import initSqlJs, { type Database } from 'sql.js';
import { createDatabase, execute, SQL_JS_CONFIG } from '../lib/sql/engine';
import { decodeText, parseTable } from '../lib/sql/tables';
import { SQL_BASICS, SQL_BASICS_TABLES } from './sqlBasics';

let db: Database;

beforeAll(async () => {
  const SQL = await initSqlJs(SQL_JS_CONFIG);
  const root = join(import.meta.dirname, '..', '..', 'public');
  db = createDatabase(
    SQL,
    SQL_BASICS_TABLES.map((spec) =>
      parseTable(spec, decodeText(new Uint8Array(readFileSync(join(root, spec.path))))),
    ),
  );
});

const examples = SQL_BASICS.flatMap((section) =>
  section.examples.map((example, i) => [`${section.id} #${i + 1}`, example.sql] as const),
);

test.each(examples)('%s', (_, sql) => {
  const outcome = execute(db, sql);
  expect(outcome.error).toBeNull();
  expect(outcome.results.at(-1)!.rows.length).toBeGreaterThan(0);
});

test('identyfikatory sekcji są unikalne', () => {
  const ids = SQL_BASICS.map((s) => s.id);
  expect(new Set(ids).size).toBe(ids.length);
});
