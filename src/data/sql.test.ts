/**
 * Integralność zadań z baz danych: walidacja, istnienie plików, zapytania
 * wzorcowe dla każdego sprawdzanego podpunktu i poprawne wczytanie wszystkich zadań.
 * (Same wyniki zapytań wzorcowych sprawdza `npm run verify:sql`.)
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { validateSqlTask } from '../lib/sql/validate';
import type { SqlTask } from '../types';
import { sessions } from './index';
import { checkableSqlParts, isCheckable, sqlTasks, sqlTasksById, sqlTotalPoints } from './sql';

const dir = join(import.meta.dirname, 'sql');
const root = join(import.meta.dirname, '..', '..');
const sessionIds = new Set(sessions.map((s) => s.id));
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

describe.each(files)('%s', (file) => {
  const tasks = JSON.parse(readFileSync(join(dir, file), 'utf8')) as SqlTask[];

  it('każde zadanie przechodzi walidację', () => {
    expect(tasks.flatMap((task) => validateSqlTask(task, sessionIds))).toEqual([]);
  });

  it('pliki z danymi istnieją', () => {
    const missing = tasks
      .flatMap((task) => task.tables.map((t) => t.path))
      .filter((path) => !existsSync(join(root, 'public', path)));
    expect(missing).toEqual([]);
  });

  it('każdy sprawdzany podpunkt ma zapytanie wzorcowe', () => {
    for (const task of tasks) {
      const solution = readFileSync(join(root, 'solutions', 'sql', `${task.id}.sql`), 'utf8');
      const markers = new Set(solution.split(/\r?\n/));
      const missing = task.parts
        .filter(isCheckable)
        .filter((part) => !markers.has(`-- ${part.number}`))
        .map((part) => part.number);
      expect(missing, task.id).toEqual([]);
    }
  });
});

test('wszystkie zadania są wczytane, z unikalnymi identyfikatorami', () => {
  const inFiles = files.flatMap(
    (file) => JSON.parse(readFileSync(join(dir, file), 'utf8')) as { id: string }[],
  );
  expect(sqlTasks).toHaveLength(inFiles.length);
  expect(sqlTasks.length).toBeGreaterThanOrEqual(33);
  expect(sqlTasks[0]!.sessionId.startsWith('2026')).toBe(true);
  expect(sqlTasks.at(-1)!.sessionId.startsWith('2018')).toBe(true);
  expect(sqlTasksById.size).toBe(sqlTasks.length);
  const task = sqlTasksById.get('2026-maj-8')!;
  expect(sqlTotalPoints(task)).toBe(9);
  // 8.5 – zapytanie na kartce, nie liczy się do postępu.
  expect(checkableSqlParts(task).map((p) => p.number)).toEqual(['8.1', '8.2', '8.3', '8.4']);
});

describe('validateSqlTask', () => {
  const valid = {
    id: 'x',
    sessionId: '2024/maj',
    number: '8',
    title: 'T',
    summary: 'S',
    tables: [{ name: 'a', path: 'p' }],
    parts: [{ number: '8.1', points: 1, prompt: 'P', list: { columns: ['c'], expected: [['1']] } }],
  };

  it('akceptuje poprawne zadanie', () => {
    expect(validateSqlTask(valid, sessionIds)).toEqual([]);
  });

  it('wykrywa typowe błędy', () => {
    expect(validateSqlTask(null, sessionIds)).toEqual(['zadanie nie jest obiektem']);
    const errors = validateSqlTask(
      {
        ...valid,
        title: '',
        tables: [
          { name: 'a', path: 'p', headers: 'x', separator: '' },
          { name: 'A', path: 'q' },
          { name: 'zła nazwa', path: 'r' },
          { name: '', path: '' },
        ],
        parts: [
          {
            number: '8.1',
            points: 1,
            prompt: 'P',
            list: { columns: ['a', 'b'], expected: [['1']] },
          },
          { number: '8.1', points: 1, prompt: 'P', list: { columns: [] } },
          { number: '8.3', points: 1, prompt: 'P', chart: 'wykres' },
          { number: '8.4', points: 1, prompt: 'P' },
        ],
      },
      sessionIds,
    ).join('\n');
    expect(errors).toMatch(/title/);
    expect(errors).toMatch(/"headers" musi być listą/);
    expect(errors).toMatch(/"separator"/);
    expect(errors).toMatch(/powtórzona tabela "A"/);
    expect(errors).toMatch(/tylko litery, cyfry i _/);
    expect(errors).toMatch(/"name" i "path"/);
    expect(errors).toMatch(/tyle wartości, ile "columns"/);
    expect(errors).toMatch(/powtórzony numer/);
    expect(errors).toMatch(/lista wymaga "columns"/);
    expect(errors).toMatch(/wykres w zadaniu z SQL/);
    expect(errors).toMatch(/wymaga "fields", "table", "list", "chart" lub "query"/);
    expect(validateSqlTask({ ...valid, tables: [] }, sessionIds)).toEqual([
      'x: zadanie wymaga listy "tables"',
    ]);
  });
});
