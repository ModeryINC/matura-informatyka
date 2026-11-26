/**
 * Zadania z baz danych (`src/data/sql/*.json`).
 */
import type { SpreadsheetPart, SqlTask } from '../types';
import { validateSqlTask } from '../lib/sql/validate';
import { sessions, sessionsById } from './index';

const modules = import.meta.glob<SqlTask[]>('./sql/*.json', { eager: true, import: 'default' });

function load(): SqlTask[] {
  const ids = new Set(sessionsById.keys());
  const order = new Map(sessions.map((s, i) => [s.id, i]));
  return Object.values(modules)
    .flat()
    .filter((task) => {
      const errors = validateSqlTask(task, ids);
      if (errors.length > 0 && import.meta.env.DEV) console.error(errors.join('\n'));
      return errors.length === 0;
    })
    .sort((a, b) => (order.get(a.sessionId) ?? 0) - (order.get(b.sessionId) ?? 0));
}

export const sqlTasks: SqlTask[] = load();

export const sqlTasksById: Map<string, SqlTask> = new Map(sqlTasks.map((t) => [t.id, t]));

/** Podpunkt sprawdzany automatycznie (bez zapytań pisanych na kartce). */
export const isCheckable = (part: SpreadsheetPart) =>
  part.fields !== undefined || part.table !== undefined || part.list !== undefined;

export const checkableSqlParts = (task: SqlTask) => task.parts.filter(isCheckable);

export const sqlTotalPoints = (task: SqlTask): number =>
  task.parts.reduce((sum, part) => sum + part.points, 0);
