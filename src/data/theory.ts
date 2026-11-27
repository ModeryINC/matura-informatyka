/**
 * Zadania testowe z arkuszy (`src/data/theory/*.json`): zdania do oceny P/F
 * z wiedzy ogólnej – systemy liczbowe, sieci, SQL, grafika, prawo, bezpieczeństwo.
 */
import type { TheoryPart, TheoryTask } from '../types';
import { validateTheoryTask } from '../lib/theory/validate';
import { sessions, sessionsById } from './index';

const modules = import.meta.glob<TheoryTask[]>('./theory/*.json', {
  eager: true,
  import: 'default',
});

function load(): TheoryTask[] {
  const ids = new Set(sessionsById.keys());
  const order = new Map(sessions.map((s, i) => [s.id, i]));
  return Object.values(modules)
    .flat()
    .filter((task) => {
      const errors = validateTheoryTask(task, ids);
      if (errors.length > 0 && import.meta.env.DEV) console.error(errors.join('\n'));
      return errors.length === 0;
    })
    .sort((a, b) => (order.get(a.sessionId) ?? 0) - (order.get(b.sessionId) ?? 0));
}

export const theoryTasks: TheoryTask[] = load();

export const theoryTasksById: Map<string, TheoryTask> = new Map(theoryTasks.map((t) => [t.id, t]));

/** Wszystkie podpunkty ze wszystkich arkuszy – do losowego testu. */
export const allTheoryParts: { task: TheoryTask; part: TheoryPart }[] = theoryTasks.flatMap(
  (task) => task.parts.map((part) => ({ task, part })),
);
