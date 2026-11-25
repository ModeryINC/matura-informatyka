/**
 * Uruchamia wszystkie przykłady z podstrony „Podstawy Pythona” prawdziwym
 * Pythonem (każdy w osobnym, pustym katalogu, z danymi dla input()) i zgłasza
 * te, które kończą się błędem.
 *
 * Użycie: `npm run verify:basics` (Python 3 w PATH jako `python` lub zmienna PYTHON).
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PYTHON_BASICS } from '../src/data/pythonBasics.ts';

const python = process.env.PYTHON ?? 'python';
const errors: string[] = [];
let count = 0;

for (const section of PYTHON_BASICS) {
  section.examples.forEach((example, i) => {
    count++;
    const dir = mkdtempSync(join(tmpdir(), 'basics-'));
    try {
      const file = join(dir, 'przyklad.py');
      writeFileSync(file, example.code, 'utf8');
      const result = spawnSync(python, ['-I', file], {
        cwd: dir,
        input: example.stdin ?? '',
        encoding: 'utf8',
        timeout: 30_000,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' },
      });
      if (result.status !== 0) {
        errors.push(`${section.id} – przykład ${i + 1}:\n${result.stderr || result.error}`);
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
}

if (errors.length > 0) {
  console.error(errors.join('\n\n'));
  console.error(`\n✗ ${errors.length} z ${count} przykładów kończy się błędem.`);
  process.exit(1);
}
console.log(`✓ Wszystkie przykłady (${count}) działają.`);
