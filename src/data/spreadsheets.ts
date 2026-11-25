/**
 * Zadania z arkusza kalkulacyjnego (`src/data/spreadsheet/*.json`).
 */
import type { SpreadsheetTask } from '../types';
import { validateSpreadsheetTask } from '../lib/spreadsheet/validate';
import { sessions, sessionsById } from './index';

const modules = import.meta.glob<SpreadsheetTask[]>('./spreadsheet/*.json', {
  eager: true,
  import: 'default',
});

function load(): SpreadsheetTask[] {
  const ids = new Set(sessionsById.keys());
  const order = new Map(sessions.map((s, i) => [s.id, i]));
  return Object.values(modules)
    .flat()
    .filter((task) => {
      const errors = validateSpreadsheetTask(task, ids);
      if (errors.length > 0 && import.meta.env.DEV) console.error(errors.join('\n'));
      return errors.length === 0;
    })
    .sort((a, b) => (order.get(a.sessionId) ?? 0) - (order.get(b.sessionId) ?? 0));
}

export const spreadsheetTasks: SpreadsheetTask[] = load();

export const spreadsheetTasksById: Map<string, SpreadsheetTask> = new Map(
  spreadsheetTasks.map((t) => [t.id, t]),
);

/** Łączna liczba punktów za zadanie. */
export const totalPoints = (task: SpreadsheetTask): number =>
  task.parts.reduce((sum, part) => sum + part.points, 0);
