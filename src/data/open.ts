/**
 * Zadania otwarte z arkuszy (`src/data/open/*.json`): podpunkty, których nie da się
 * rozwiązać w edytorze Pythona, arkuszu ani SQL – analiza algorytmów, uzupełnianie
 * tabel, złożoność, krótkie odpowiedzi z teorii. Pokazywane w zakładce „Test”.
 */
import type { OpenTask } from '../types';
import { validateOpenTask } from '../lib/theory/validate';
import { sessions, sessionsById } from './index';

const modules = import.meta.glob<OpenTask[]>('./open/*.json', {
  eager: true,
  import: 'default',
});

function load(): OpenTask[] {
  const ids = new Set(sessionsById.keys());
  const order = new Map(sessions.map((s, i) => [s.id, i]));
  return Object.values(modules)
    .flat()
    .filter((task) => {
      const errors = validateOpenTask(task, ids);
      if (errors.length > 0 && import.meta.env.DEV) console.error(errors.join('\n'));
      return errors.length === 0;
    })
    .sort(
      (a, b) =>
        (order.get(a.sessionId) ?? 0) - (order.get(b.sessionId) ?? 0) ||
        a.number.localeCompare(b.number, 'pl', { numeric: true }),
    );
}

export const openTasks: OpenTask[] = load();

export const openTasksById: Map<string, OpenTask> = new Map(openTasks.map((t) => [t.id, t]));
