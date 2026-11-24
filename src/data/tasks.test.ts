/**
 * Testy integralności danych: każde zadanie musi przejść walidację,
 * a wszystkie wskazane pliki z danymi muszą istnieć w `public/`.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { validateTask } from '../lib/validate';
import { sessions } from './index';

const tasksDir = join(import.meta.dirname, 'tasks');
const publicDir = join(import.meta.dirname, '..', '..', 'public');
const sessionIds = new Set(sessions.map((s) => s.id));
const files = readdirSync(tasksDir).filter((f) => f.endsWith('.json'));

test('katalog zawiera sesje', () => {
  expect(sessions.length).toBeGreaterThan(0);
});

describe.each(files)('%s', (file) => {
  const tasks = JSON.parse(readFileSync(join(tasksDir, file), 'utf8')) as unknown[];

  it('jest tablicą zadań', () => {
    expect(Array.isArray(tasks)).toBe(true);
  });

  it('każde zadanie przechodzi walidację', () => {
    const errors = tasks.flatMap((task) => validateTask(task, sessionIds));
    expect(errors).toEqual([]);
  });

  it('pliki z danymi istnieją', () => {
    const missing = tasks
      .flatMap((task) => (task as { checks?: { files: Record<string, string> }[] }).checks ?? [])
      .flatMap((check) => Object.values(check.files))
      .filter((path) => !existsSync(join(publicDir, path)));
    expect(missing).toEqual([]);
  });
});

test('identyfikatory zadań są unikalne', () => {
  const ids = files.flatMap((file) =>
    (JSON.parse(readFileSync(join(tasksDir, file), 'utf8')) as { id: string }[]).map((t) => t.id),
  );
  expect(new Set(ids).size).toBe(ids.length);
});
