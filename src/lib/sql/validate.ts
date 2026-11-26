/**
 * Walidacja opisu zadania z bazy danych wczytanego z JSON (pusta lista = poprawne).
 * Uruchamiana w testach, więc literówka zatrzyma CI.
 */
import { validateParts } from '../spreadsheet/validate';

const isText = (v: unknown) => typeof v === 'string' && v !== '';
/** Nazwa tabeli, którą da się wpisać w zapytaniu bez cudzysłowów. */
const TABLE_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function validateSqlTask(value: unknown, sessionIds: ReadonlySet<string>): string[] {
  const errors: string[] = [];
  if (typeof value !== 'object' || value === null) return ['zadanie nie jest obiektem'];
  const task = value as Record<string, unknown>;
  const where = typeof task.id === 'string' ? task.id : '(bez id)';
  const fail = (message: string) => errors.push(`${where}: ${message}`);

  for (const field of ['id', 'sessionId', 'number', 'title', 'summary'] as const) {
    if (!isText(task[field])) fail(`pole "${field}" musi być niepustym tekstem`);
  }
  if (typeof task.sessionId === 'string' && !sessionIds.has(task.sessionId))
    fail(`nieznana sesja "${task.sessionId}"`);

  if (!Array.isArray(task.tables) || task.tables.length === 0) {
    fail('zadanie wymaga listy "tables"');
  } else {
    const names = new Set<string>();
    for (const table of task.tables as Record<string, unknown>[]) {
      if (!isText(table.name) || !isText(table.path)) fail('tabela wymaga pól "name" i "path"');
      else if (!TABLE_NAME.test(table.name as string))
        fail(`nazwa tabeli "${String(table.name)}" może zawierać tylko litery, cyfry i _`);
      const key = String(table.name).toLowerCase();
      if (names.has(key)) fail(`powtórzona tabela "${String(table.name)}"`);
      names.add(key);
      if (
        table.headers !== undefined &&
        (!Array.isArray(table.headers) || !table.headers.every(isText))
      )
        fail(`tabela "${String(table.name)}": "headers" musi być listą nazw pól`);
      if (table.separator !== undefined && !isText(table.separator))
        fail(`tabela "${String(table.name)}": "separator" musi być niepustym tekstem`);
    }
  }

  validateParts(task.parts, fail);
  for (const part of (Array.isArray(task.parts) ? task.parts : []) as Record<string, unknown>[]) {
    if (part.chart !== undefined) fail(`podpunkt ${String(part.number)}: wykres w zadaniu z SQL`);
  }
  return errors;
}
