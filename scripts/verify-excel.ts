/**
 * Weryfikacja kluczy zadań z arkusza kalkulacyjnego: uruchamia obliczenia wzorcowe
 * (`solutions/excel/<id>.py`) prawdziwym Pythonem i porównuje ich wyniki
 * z odpowiedziami w `src/data/spreadsheet/*.json` – tą samą funkcją, która
 * sprawdza odpowiedzi ucznia na stronie.
 *
 * Program wzorcowy wypisuje JSON: `{"6.2": ["19"], "6.1": {"table": [[...]]}}`.
 *
 * Użycie: `npm run verify:excel` (Python 3 w PATH jako `python` lub zmienna PYTHON).
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fieldMatches, tableMatches } from '../src/lib/spreadsheet/answers.ts';
import type { SpreadsheetTask } from '../src/types.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const python = process.env.PYTHON ?? 'python';
const dataDir = join(root, 'src', 'data', 'spreadsheet');

type Output = Record<string, string[] | { table: string[][]; rows?: string[]; fields?: string[] }>;

function verify(task: SpreadsheetTask): string[] {
  const errors: string[] = [];
  const solution = join(root, 'solutions', 'excel', `${task.id}.py`);
  if (!existsSync(solution)) return [`${task.id}: brak obliczeń wzorcowych ${solution}`];

  const dir = mkdtempSync(join(tmpdir(), 'excel-'));
  try {
    for (const file of task.files) {
      const source = join(root, 'public', file.path);
      if (!existsSync(source)) {
        errors.push(`${task.id}: brak pliku ${file.path}`);
        continue;
      }
      copyFileSync(source, join(dir, basename(file.path)));
    }
    const result = spawnSync(python, ['-I', solution], {
      cwd: dir,
      encoding: 'utf8',
      timeout: 60_000,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' },
    });
    if (result.status !== 0) return [...errors, `${task.id}: błąd wykonania\n${result.stderr}`];
    const output = JSON.parse(result.stdout) as Output;

    for (const part of task.parts) {
      const actual = output[part.number];
      const where = `${task.id} ${part.number}`;
      // Podpunkt z samym wykresem nie ma odpowiedzi do sprawdzenia.
      if (!part.fields && !part.table) continue;
      if (actual === undefined) {
        errors.push(`${where}: brak wyniku w obliczeniach wzorcowych`);
        continue;
      }
      if (part.fields) {
        const values = Array.isArray(actual) ? actual : (actual.fields ?? []);
        part.fields.forEach((field, i) => {
          if (!fieldMatches(values[i] ?? '', field))
            errors.push(
              `${where} „${field.label}”: klucz ${field.expected}, obliczono ${values[i]}`,
            );
        });
      }
      if (part.table) {
        const table = Array.isArray(actual) ? [] : actual.table;
        if (
          !Array.isArray(actual) &&
          actual.rows &&
          actual.rows.join('|') !== part.table.rows.join('|')
        )
          errors.push(`${where}: podpisy wierszy różnią się od obliczonych`);
        tableMatches(table, part.table).forEach((row, r) =>
          row.forEach((ok, c) => {
            if (!ok)
              errors.push(
                `${where} [${part.table!.rows[r]} / ${part.table!.columns[c]}]: klucz ${part.table!.expected[r]![c]}, obliczono ${table[r]?.[c]}`,
              );
          }),
        );
      }
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  return errors;
}

const tasks = readdirSync(dataDir)
  .filter((name) => name.endsWith('.json'))
  .flatMap((name) => JSON.parse(readFileSync(join(dataDir, name), 'utf8')) as SpreadsheetTask[]);

const errors = tasks.flatMap(verify);
if (errors.length > 0) {
  console.error(errors.join('\n'));
  console.error(`\n✗ Błędy w ${errors.length} odpowiedziach.`);
  process.exit(1);
}
console.log(`✓ Klucze ${tasks.length} zadań z arkusza kalkulacyjnego zgadzają się z obliczeniami.`);
