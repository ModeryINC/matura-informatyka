/**
 * Weryfikacja kluczy zadań z baz danych: wykonuje zapytania wzorcowe
 * (`solutions/sql/<id>.sql`) w tym samym silniku co strona (sql.js + tabele z plików)
 * i porównuje wyniki z odpowiedziami w `src/data/sql/*.json` – tymi samymi funkcjami,
 * które sprawdzają odpowiedzi ucznia.
 *
 * Plik wzorcowy dzieli się na podpunkty komentarzami `-- 8.1`. Pola (`fields`)
 * dostają kolejne wartości ze wszystkich wyników podpunktu, zestawienie (`table`)
 * i lista (`list`) – wiersze ostatniego wyniku.
 *
 * Użycie: `npm run verify:sql` (opcjonalnie id zadań, np. `npm run verify:sql 2026-maj-8`).
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import initSqlJs from 'sql.js';
import { createDatabase, execute, formatValue, SQL_JS_CONFIG } from '../src/lib/sql/engine.ts';
import { decodeText, parseTable } from '../src/lib/sql/tables.ts';
import {
  fieldMatches,
  fitSelection,
  listMatches,
  tableMatches,
} from '../src/lib/spreadsheet/answers.ts';
import type { SqlTask } from '../src/types.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'src', 'data', 'sql');
const SQL = await initSqlJs(SQL_JS_CONFIG);

/** Zapytania wzorcowe podzielone na podpunkty. */
function solutionParts(source: string): Map<string, string> {
  const parts = new Map<string, string>();
  let current: string | null = null;
  for (const line of source.split(/\r?\n/)) {
    const header = /^--\s*(\d+\.\d+)\s*$/.exec(line);
    if (header) {
      current = header[1]!;
      parts.set(current, '');
    } else if (current) {
      parts.set(current, `${parts.get(current)}${line}\n`);
    }
  }
  return parts;
}

function verify(task: SqlTask): string[] {
  const solution = join(root, 'solutions', 'sql', `${task.id}.sql`);
  if (!existsSync(solution)) return [`${task.id}: brak zapytań wzorcowych ${solution}`];
  const errors: string[] = [];
  const tables = task.tables.map((table) => {
    const content = decodeText(readFileSync(join(root, 'public', table.path)));
    const data = parseTable(table, content);
    if (data.irregularRows > 0)
      errors.push(
        `${task.id}: tabela ${table.name} – ${data.irregularRows} wierszy z inną liczbą pól`,
      );
    return data;
  });
  const db = createDatabase(SQL, tables);
  const queries = solutionParts(readFileSync(solution, 'utf8'));

  for (const part of task.parts) {
    const where = `${task.id} ${part.number}`;
    if (!part.fields && !part.table && !part.list) continue;
    const sql = queries.get(part.number);
    if (!sql) {
      errors.push(`${where}: brak zapytania wzorcowego`);
      continue;
    }
    const outcome = execute(db, sql);
    if (outcome.error) {
      errors.push(`${where}: błąd zapytania – ${outcome.error}`);
      continue;
    }
    const last = outcome.results.at(-1)?.rows.map((row) => row.map(formatValue)) ?? [];
    if (part.fields) {
      const values = outcome.results.flatMap((r) => r.rows.flat().map(formatValue));
      part.fields.forEach((field, i) => {
        if (!fieldMatches(values[i] ?? '', field))
          errors.push(`${where} „${field.label}”: klucz ${field.expected}, wynik ${values[i]}`);
      });
    }
    if (part.table) {
      const fitted = fitSelection(last, part.table);
      if (!fitted) errors.push(`${where}: wynik ma inny rozmiar niż zestawienie`);
      else
        tableMatches(fitted, part.table).forEach((row, r) =>
          row.forEach((ok, c) => {
            if (!ok)
              errors.push(
                `${where} [${part.table!.rows[r]} / ${part.table!.columns[c]}]: klucz ${part.table!.expected[r]![c]}, wynik ${fitted[r]?.[c]}`,
              );
          }),
        );
    }
    if (part.list) {
      const check = listMatches(last, part.list);
      if (!check.passed)
        errors.push(
          `${where}: lista – pasuje ${check.matched}/${part.list.expected.length}, wierszy w wyniku ${check.rows}\n${last
            .slice(0, 12)
            .map((row) => row.join(' | '))
            .join('\n')}`,
        );
    }
  }
  db.close();
  return errors;
}

const only = process.argv.slice(2);
const tasks = readdirSync(dataDir)
  .filter((name) => name.endsWith('.json'))
  .flatMap((name) => JSON.parse(readFileSync(join(dataDir, name), 'utf8')) as SqlTask[])
  .filter((task) => only.length === 0 || only.includes(task.id));

const errors = tasks.flatMap(verify);
if (errors.length > 0) {
  console.error(errors.join('\n'));
  console.error(`\n✗ Błędy w ${errors.length} odpowiedziach.`);
  process.exit(1);
}
console.log(`✓ Klucze ${tasks.length} zadań z baz danych zgadzają się z zapytaniami wzorcowymi.`);
