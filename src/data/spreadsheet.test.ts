/**
 * Integralność zadań z arkusza kalkulacyjnego: walidacja, istnienie plików
 * i poprawne wczytanie wszystkich zadań.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { validateSpreadsheetTask } from '../lib/spreadsheet/validate';
import { sessions } from './index';
import { spreadsheetTasks, spreadsheetTasksById, totalPoints } from './spreadsheets';

const dir = join(import.meta.dirname, 'spreadsheet');
const publicDir = join(import.meta.dirname, '..', '..', 'public');
const sessionIds = new Set(sessions.map((s) => s.id));
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

describe.each(files)('%s', (file) => {
  const tasks = JSON.parse(readFileSync(join(dir, file), 'utf8')) as {
    files: { path: string }[];
  }[];

  it('każde zadanie przechodzi walidację', () => {
    expect(tasks.flatMap((task) => validateSpreadsheetTask(task, sessionIds))).toEqual([]);
  });

  it('pliki z danymi istnieją', () => {
    const missing = tasks
      .flatMap((task) => task.files.map((f) => f.path))
      .filter((path) => !existsSync(join(publicDir, path)));
    expect(missing).toEqual([]);
  });
});

test('wszystkie zadania są wczytane, z unikalnymi identyfikatorami', () => {
  expect(spreadsheetTasks.map((t) => t.id)).toEqual([
    // Jak w katalogu arkuszy: od najnowszych.
    '2026-maj-7',
    '2025-maj-6',
    '2024-maj-7',
    '2023-maj-6',
  ]);
  expect(spreadsheetTasksById.size).toBe(spreadsheetTasks.length);
  expect(totalPoints(spreadsheetTasksById.get('2023-maj-6')!)).toBe(10);
});

describe('validateSpreadsheetTask', () => {
  const valid = {
    id: 'x',
    sessionId: '2024/maj',
    number: '7',
    title: 'T',
    summary: 'S',
    files: [{ sheet: 'a', path: 'p' }],
    parts: [{ number: '7.1', points: 1, prompt: 'P', fields: [{ label: 'L', expected: '1' }] }],
  };

  it('akceptuje poprawne zadanie', () => {
    expect(validateSpreadsheetTask(valid, sessionIds)).toEqual([]);
  });

  it('wykrywa typowe błędy', () => {
    expect(validateSpreadsheetTask(null, sessionIds)).toEqual(['zadanie nie jest obiektem']);
    const errors = validateSpreadsheetTask(
      {
        ...valid,
        sessionId: 'brak',
        title: '',
        files: [
          { sheet: 'a', path: 'p', headers: ['x'], hasHeader: true },
          { sheet: 'a', path: '' },
        ],
        parts: [
          { number: '7.1', points: 0, prompt: 'P' },
          { number: '7.2', points: 1, prompt: 'P', fields: [{ label: 'L' }] },
          {
            number: '7.3',
            points: 1,
            prompt: 'P',
            table: { rows: ['a'], columns: ['b'], expected: [['1', '2']] },
          },
          { number: '7.4', points: 1, prompt: 'P', table: { rows: ['a'] } },
        ],
      },
      sessionIds,
    );
    expect(errors.join('\n')).toMatch(/title/);
    expect(errors.join('\n')).toMatch(/nieznana sesja/);
    expect(errors.join('\n')).toMatch(/wykluczają się/);
    expect(errors.join('\n')).toMatch(/powtórzona karta/);
    expect(errors.join('\n')).toMatch(/"sheet" i "path"/);
    expect(errors.join('\n')).toMatch(/points/);
    expect(errors.join('\n')).toMatch(/"fields" lub "table"/);
    expect(errors.join('\n')).toMatch(/"label" i "expected"/);
    expect(errors.join('\n')).toMatch(/rozmiar "expected"/);
    expect(errors.join('\n')).toMatch(/wymaga "rows", "columns"/);
    expect(validateSpreadsheetTask({ ...valid, files: [], parts: [] }, sessionIds)).toHaveLength(2);
  });
});
