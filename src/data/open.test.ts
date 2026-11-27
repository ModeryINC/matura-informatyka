/** Integralność zadań otwartych: walidacja plików i wczytanie wszystkich zadań. */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { validateOpenTask } from '../lib/theory/validate';
import { sessions } from './index';
import { openTasks, openTasksById } from './open';

const dir = join(import.meta.dirname, 'open');
const sessionIds = new Set(sessions.map((s) => s.id));
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

test.each(files)('%s przechodzi walidację', (file) => {
  const tasks = JSON.parse(readFileSync(join(dir, file), 'utf8')) as {
    id: string;
    sessionId: string;
    number: string;
  }[];
  expect(tasks.flatMap((task) => validateOpenTask(task, sessionIds))).toEqual([]);
  for (const task of tasks) {
    // Nazwa pliku odpowiada sesji (2024-maj.json → 2024/maj), a id – sesji i numerowi.
    expect(task.sessionId.replace('/', '-')).toBe(file.replace('.json', ''));
    expect(task.id).toBe(`${task.sessionId.replace('/', '-')}-${task.number}`);
  }
});

test('wszystkie zadania są wczytane, z unikalnymi identyfikatorami', () => {
  const count = files.reduce(
    (sum, file) => sum + (JSON.parse(readFileSync(join(dir, file), 'utf8')) as unknown[]).length,
    0,
  );
  expect(openTasks.length).toBe(count);
  expect(openTasksById.size).toBe(count);
});

test('walidacja wykrywa typowe błędy', () => {
  expect(validateOpenTask(null, sessionIds)).toEqual(['zadanie nie jest obiektem']);
  const errors = validateOpenTask(
    {
      id: 'x',
      sessionId: '2024/maj',
      number: '1',
      title: 't',
      parts: [
        { number: '1.1', points: 0, prompt: 'p', answer: '' },
        { number: '1.1', points: 1, prompt: 'p', answer: 'a', accepted: [] },
      ],
    },
    sessionIds,
  );
  expect(errors).toEqual([
    'x 1.1: brak rozwiązania "answer"',
    'x 1.1: "points" to dodatnia liczba całkowita',
    'x 1.1: powtórzony numer',
    'x 1.1: "accepted" to niepusta lista tekstów',
  ]);
});
