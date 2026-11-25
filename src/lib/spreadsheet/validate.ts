/**
 * Walidacja opisu zadania z arkusza kalkulacyjnego wczytanego z JSON
 * (pusta lista = poprawne). Uruchamiana w testach, więc literówka zatrzyma CI.
 */
export function validateSpreadsheetTask(value: unknown, sessionIds: ReadonlySet<string>): string[] {
  const errors: string[] = [];
  if (typeof value !== 'object' || value === null) return ['zadanie nie jest obiektem'];
  const task = value as Record<string, unknown>;
  const where = typeof task.id === 'string' ? task.id : '(bez id)';
  const fail = (message: string) => errors.push(`${where}: ${message}`);
  const isText = (v: unknown) => typeof v === 'string' && v !== '';

  for (const field of ['id', 'sessionId', 'number', 'title', 'summary'] as const) {
    if (!isText(task[field])) fail(`pole "${field}" musi być niepustym tekstem`);
  }
  if (typeof task.sessionId === 'string' && !sessionIds.has(task.sessionId))
    fail(`nieznana sesja "${task.sessionId}"`);

  if (!Array.isArray(task.files) || task.files.length === 0) {
    fail('zadanie wymaga listy "files"');
  } else {
    const names = new Set<string>();
    for (const file of task.files as Record<string, unknown>[]) {
      if (!isText(file.sheet) || !isText(file.path)) fail('plik wymaga pól "sheet" i "path"');
      if (names.has(file.sheet as string)) fail(`powtórzona karta "${String(file.sheet)}"`);
      names.add(file.sheet as string);
      if (file.headers !== undefined && file.hasHeader !== undefined)
        fail(`plik "${String(file.sheet)}": "headers" i "hasHeader" wykluczają się`);
    }
  }

  if (!Array.isArray(task.parts) || task.parts.length === 0) {
    fail('zadanie wymaga listy "parts"');
    return errors;
  }
  for (const part of task.parts as Record<string, unknown>[]) {
    const label = `podpunkt ${String(part.number)}`;
    if (!isText(part.number) || !isText(part.prompt)) fail(`${label}: brak "number" lub "prompt"`);
    if (typeof part.points !== 'number' || part.points <= 0)
      fail(`${label}: "points" musi być > 0`);
    const fields = part.fields as Record<string, unknown>[] | undefined;
    const table = part.table as Record<string, unknown> | undefined;
    if (!fields && !table) fail(`${label}: wymaga "fields" lub "table"`);
    for (const field of fields ?? []) {
      if (!isText(field.label) || !isText(field.expected))
        fail(`${label}: pole wymaga "label" i "expected"`);
    }
    if (table) {
      const rows = table.rows as unknown[];
      const columns = table.columns as unknown[];
      const expected = table.expected as unknown[][];
      if (!Array.isArray(rows) || !Array.isArray(columns) || !Array.isArray(expected)) {
        fail(`${label}: tabela wymaga "rows", "columns" i "expected"`);
      } else if (
        expected.length !== rows.length ||
        expected.some((row) => !Array.isArray(row) || row.length !== columns.length)
      ) {
        fail(`${label}: rozmiar "expected" nie zgadza się z "rows" × "columns"`);
      }
    }
  }
  return errors;
}
