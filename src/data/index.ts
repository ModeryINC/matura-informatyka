/**
 * Punkt dostępu do danych: katalog sesji (generowany) i zadania (pisane ręcznie).
 */
import catalogJson from './catalog.generated.json';
import type { ExamSession, Task } from '../types';
import { validateTask } from '../lib/validate';

export const sessions: ExamSession[] = catalogJson as ExamSession[];

export const sessionsById: Map<string, ExamSession> = new Map(sessions.map((s) => [s.id, s]));

const sessionIds = new Set(sessionsById.keys());

/** Pliki z zadaniami: każdy plik to tablica zadań jednej sesji. */
const taskModules = import.meta.glob<Task[]>('./tasks/*.json', { eager: true, import: 'default' });

/** Porównuje numery zadań, np. `1.2` < `1.10` < `2.1`. */
export function compareTaskNumbers(a: string, b: string): number {
  return a.localeCompare(b, 'pl', { numeric: true });
}

function loadTasks(): Task[] {
  const all = Object.values(taskModules).flat();
  const valid = all.filter((task) => {
    const errors = validateTask(task, sessionIds);
    if (errors.length > 0 && import.meta.env.DEV) console.error(errors.join('\n'));
    return errors.length === 0;
  });
  const order = new Map(sessions.map((s, i) => [s.id, i]));
  return valid.sort(
    (a, b) =>
      (order.get(a.sessionId) ?? 0) - (order.get(b.sessionId) ?? 0) ||
      compareTaskNumbers(a.number, b.number),
  );
}

export const tasks: Task[] = loadTasks();

export const tasksById: Map<string, Task> = new Map(tasks.map((t) => [t.id, t]));

/** Zadania należące do danej sesji. */
export const tasksForSession = (sessionId: string): Task[] =>
  tasks.filter((t) => t.sessionId === sessionId);

/** Adres pliku z katalogu `public/` z uwzględnieniem bazowej ścieżki aplikacji. */
export const assetUrl = (path: string): string => `${import.meta.env.BASE_URL}${path}`;
