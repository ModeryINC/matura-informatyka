/** Integralność zadań testowych: walidacja plików i wczytanie wszystkich zadań. */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { validateTheoryTask } from '../lib/theory/validate';
import { sessions } from './index';
import { allTheoryParts, theoryTasks, theoryTasksById } from './theory';

const dir = join(import.meta.dirname, 'theory');
const sessionIds = new Set(sessions.map((s) => s.id));
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

test.each(files)('%s przechodzi walidację', (file) => {
  const tasks = JSON.parse(readFileSync(join(dir, file), 'utf8')) as unknown[];
  expect(tasks.flatMap((task) => validateTheoryTask(task, sessionIds))).toEqual([]);
  // Nazwa pliku odpowiada sesji (2024-maj.json → 2024/maj).
  for (const task of tasks as { sessionId: string }[])
    expect(task.sessionId.replace('/', '-')).toBe(file.replace('.json', ''));
});

test('wszystkie zadania są wczytane, z unikalnymi identyfikatorami', () => {
  expect(theoryTasks.length).toBe(files.length);
  expect(theoryTasksById.size).toBe(theoryTasks.length);
  expect(allTheoryParts.length).toBeGreaterThanOrEqual(80);
  expect(theoryTasks[0]!.sessionId.startsWith('2026')).toBe(true);
});

test('walidacja wykrywa typowe błędy', () => {
  expect(validateTheoryTask(null, sessionIds)).toEqual(['zadanie nie jest obiektem']);
  const errors = validateTheoryTask(
    {
      id: 'x',
      sessionId: 'brak',
      number: '3',
      title: 'Test',
      parts: [
        { number: '3.1', prompt: 'P', statements: ['a', 'b'], answers: 'PFP' },
        { number: '3.1', prompt: '', statements: ['a'], answers: 'X' },
      ],
    },
    sessionIds,
  ).join('\n');
  expect(errors).toMatch(/nieznana sesja/);
  expect(errors).toMatch(/tyle odpowiedzi, ile zdań/);
  expect(errors).toMatch(/powtórzony numer/);
  expect(errors).toMatch(/brak treści/);
  expect(errors).toMatch(/co najmniej dwa zdania/);
  expect(errors).toMatch(/ciąg liter P i F/);
  expect(
    validateTheoryTask(
      { id: 'y', sessionId: '2024/maj', number: '1', title: 'T', parts: [] },
      sessionIds,
    ),
  ).toEqual(['y: zadanie wymaga listy "parts"']);
});
