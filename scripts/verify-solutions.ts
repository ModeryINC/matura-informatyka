/**
 * Weryfikacja danych zadań: uruchamia rozwiązania wzorcowe (`solutions/`)
 * prawdziwym Pythonem i sprawdza, czy przechodzą wszystkie testy zadania.
 *
 * Dzięki temu oczekiwane odpowiedzi w `src/data/tasks/*.json` są potwierdzone
 * dwoma niezależnymi źródłami: kluczem CKE i działającym programem.
 *
 * Użycie: `npm run verify:solutions` (wymaga Pythona 3 w PATH jako `python`
 * lub zmiennej środowiskowej PYTHON).
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { outputMatchesAny } from '../src/lib/compare.ts';
import type { Task } from '../src/types.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const python = process.env.PYTHON ?? 'python';
const harnessDir = join(root, 'src', 'python');
const TIMEOUT_MS = 60_000;

export const solutionPath = (task: Task): string =>
  join(root, 'solutions', task.sessionId.replace('/', '-'), `${task.number}.py`);

function runPython(args: string[], cwd: string, input?: string) {
  return spawnSync(python, ['-I', ...args], {
    cwd,
    input,
    encoding: 'utf8',
    timeout: TIMEOUT_MS,
    env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' },
  });
}

function verifyTask(task: Task): string[] {
  const file = solutionPath(task);
  if (!existsSync(file)) return [`${task.id}: brak rozwiązania wzorcowego ${file}`];
  const code = readFileSync(file, 'utf8');
  const errors: string[] = [];

  if (task.kind === 'program') {
    for (const check of task.checks) {
      const dir = mkdtempSync(join(tmpdir(), 'matura-'));
      try {
        for (const [name, path] of Object.entries(check.files)) {
          copyFileSync(join(root, 'public', path), join(dir, name));
        }
        const result = runPython([file], dir);
        if (result.status !== 0) {
          errors.push(`${task.id} [${check.label}]: błąd wykonania\n${result.stderr}`);
        } else if (!outputMatchesAny(result.stdout, check.expected, check.alternatives)) {
          errors.push(
            `${task.id} [${check.label}]: wynik się nie zgadza\n  oczekiwano: ${JSON.stringify(check.expected)}\n  otrzymano:  ${JSON.stringify(result.stdout)}`,
          );
        }
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    }
  } else {
    const driver = [
      'import sys, json',
      `sys.path.insert(0, ${JSON.stringify(harnessDir)})`,
      'import harness',
      'data = json.load(sys.stdin)',
      'print(harness.run_function(data["code"], data["name"], json.dumps(data["tests"])))',
    ].join('\n');
    const result = runPython(
      ['-c', driver],
      root,
      JSON.stringify({ code, name: task.functionName, tests: task.tests }),
    );
    if (result.status !== 0) return [`${task.id}: błąd uruchomienia\n${result.stderr}`];
    const outcome = JSON.parse(result.stdout) as {
      error: string | null;
      results: { passed: boolean; actual: string; error?: string }[];
    };
    if (outcome.error) errors.push(`${task.id}: ${outcome.error}`);
    outcome.results.forEach((r, i) => {
      if (!r.passed) {
        errors.push(
          `${task.id} test ${i + 1} ${JSON.stringify(task.tests[i]?.args)}: oczekiwano ${JSON.stringify(task.tests[i]?.expected)}, otrzymano ${r.actual} ${r.error ?? ''}`,
        );
      }
    });
  }
  return errors;
}

function main() {
  const tasksDir = join(root, 'src', 'data', 'tasks');
  const filter = process.argv[2];
  const tasks = readdirSync(tasksDir)
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => JSON.parse(readFileSync(join(tasksDir, f), 'utf8')) as Task[])
    .filter((t) => !filter || t.id.startsWith(filter));

  let failures = 0;
  for (const task of tasks) {
    const errors = verifyTask(task);
    if (errors.length) {
      failures++;
      console.error(`✗ ${errors.join('\n')}`);
    } else {
      console.log(`✓ ${task.id}`);
    }
  }
  console.log(`\n${tasks.length - failures}/${tasks.length} zadań zweryfikowanych.`);
  if (failures > 0) process.exit(1);
}

main();
