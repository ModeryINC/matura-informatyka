const isText = (v: unknown) => typeof v === 'string' && v !== '';

/**
 * Walidacja podpunktów (wspólna dla zadań z arkusza i z baz danych). Każdy podpunkt
 * wymaga odpowiedzi do sprawdzenia (`fields`, `table`, `list`), wykresu (`chart`)
 * albo zapytania pisanego na kartce (`query`).
 */
export function validateParts(parts: unknown, fail: (message: string) => void): void {
  if (!Array.isArray(parts) || parts.length === 0) {
    fail('zadanie wymaga listy "parts"');
    return;
  }
  const numbers = new Set<string>();
  for (const part of parts as Record<string, unknown>[]) {
    const label = `podpunkt ${String(part.number)}`;
    if (!isText(part.number) || !isText(part.prompt)) fail(`${label}: brak "number" lub "prompt"`);
    if (numbers.has(part.number as string)) fail(`${label}: powtórzony numer`);
    numbers.add(part.number as string);
    if (typeof part.points !== 'number' || part.points <= 0)
      fail(`${label}: "points" musi być > 0`);
    const fields = part.fields as Record<string, unknown>[] | undefined;
    const table = part.table as Record<string, unknown> | undefined;
    const list = part.list as Record<string, unknown> | undefined;
    if (!fields && !table && !list && !isText(part.chart) && !isText(part.query))
      fail(`${label}: wymaga "fields", "table", "list", "chart" lub "query"`);
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
    if (list) {
      const columns = list.columns as unknown[];
      const expected = list.expected as unknown[][];
      if (!Array.isArray(columns) || columns.length === 0 || !Array.isArray(expected)) {
        fail(`${label}: lista wymaga "columns" i "expected"`);
      } else if (
        expected.length === 0 ||
        expected.some(
          (row) =>
            !Array.isArray(row) ||
            row.length !== columns.length ||
            row.some((value) => typeof value !== 'string'),
        )
      ) {
        fail(`${label}: każdy wiersz "expected" listy musi mieć tyle wartości, ile "columns"`);
      }
    }
  }
}

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

  for (const field of ['id', 'sessionId', 'number', 'title', 'summary'] as const) {
    if (!isText(task[field])) fail(`pole "${field}" musi być niepustym tekstem`);
  }
  if (typeof task.sessionId === 'string' && !sessionIds.has(task.sessionId))
    fail(`nieznana sesja "${task.sessionId}"`);

  if (!Array.isArray(task.files)) {
    fail('zadanie wymaga listy "files" (może być pusta)');
  } else {
    const names = new Set<string>();
    for (const file of task.files as Record<string, unknown>[]) {
      if (!isText(file.sheet) || !isText(file.path)) fail('plik wymaga pól "sheet" i "path"');
      if (names.has(file.sheet as string)) fail(`powtórzona karta "${String(file.sheet)}"`);
      names.add(file.sheet as string);
      if (file.separator !== undefined && !isText(file.separator))
        fail(`plik "${String(file.sheet)}": "separator" musi być niepustym tekstem`);
      if (file.headers !== undefined && file.hasHeader !== undefined)
        fail(`plik "${String(file.sheet)}": "headers" i "hasHeader" wykluczają się`);
    }
  }

  validateParts(task.parts, fail);
  return errors;
}
