import { TOPICS, type ExamSession, type Task, type TopicId } from '../types';
import { foldText } from './text';

/** Status rozwiązania zadania przechowywany lokalnie. */
export type SolutionStatus = 'nowe' | 'rozpoczete' | 'zaliczone';

export interface TaskFilters {
  /** Fraza wyszukiwana w tytule, opisie, numerze i nazwie sesji. */
  query: string;
  /** Wybrane tematy – zadanie musi mieć co najmniej jeden z nich. */
  topics: TopicId[];
  /** Wybrane lata (pusta lista = wszystkie). */
  years: number[];
  /** Część arkusza (`null` = obie). */
  part: 1 | 2 | null;
  /** Status rozwiązania (`null` = dowolny). */
  status: SolutionStatus | null;
}

export const EMPTY_FILTERS: TaskFilters = {
  query: '',
  topics: [],
  years: [],
  part: null,
  status: null,
};

export interface FilterContext {
  sessions: Map<string, ExamSession>;
  statusOf: (taskId: string) => SolutionStatus;
}

function searchableText(task: Task, session: ExamSession | undefined): string {
  return foldText(
    [
      task.title,
      task.summary,
      `zadanie ${task.number}`,
      session ? `${session.label} ${session.year}` : task.sessionId,
      ...task.topics.map((topic) => TOPICS[topic]),
    ].join(' '),
  );
}

/** Filtruje zadania według kryteriów. Wszystkie słowa frazy muszą wystąpić. */
export function filterTasks(tasks: Task[], filters: TaskFilters, context: FilterContext): Task[] {
  const words = foldText(filters.query).split(/\s+/).filter(Boolean);

  return tasks.filter((task) => {
    const session = context.sessions.get(task.sessionId);
    if (filters.topics.length > 0 && !task.topics.some((t) => filters.topics.includes(t))) {
      return false;
    }
    if (filters.years.length > 0 && (!session || !filters.years.includes(session.year))) {
      return false;
    }
    if (filters.part !== null && task.part !== filters.part) return false;
    if (filters.status !== null && context.statusOf(task.id) !== filters.status) return false;
    if (words.length > 0) {
      const text = searchableText(task, session);
      if (!words.every((word) => text.includes(word))) return false;
    }
    return true;
  });
}

/** Liczba zadań dla każdego tematu – do wyświetlania przy filtrach. */
export function countTopics(tasks: Task[]): Map<TopicId, number> {
  const counts = new Map<TopicId, number>();
  for (const task of tasks) {
    for (const topic of task.topics) counts.set(topic, (counts.get(topic) ?? 0) + 1);
  }
  return counts;
}

const isTopic = (value: string): value is TopicId => value in TOPICS;

/** Zamienia filtry na parametry adresu URL (do udostępniania wyszukiwania). */
export function filtersToParams(filters: TaskFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query) params.set('q', filters.query);
  if (filters.topics.length) params.set('tematy', filters.topics.join(','));
  if (filters.years.length) params.set('lata', filters.years.join(','));
  if (filters.part !== null) params.set('czesc', String(filters.part));
  if (filters.status !== null) params.set('status', filters.status);
  return params;
}

/** Odczytuje filtry z parametrów adresu URL, ignorując niepoprawne wartości. */
export function paramsToFilters(params: URLSearchParams): TaskFilters {
  const list = (key: string) => (params.get(key) ?? '').split(',').filter(Boolean);
  const part = params.get('czesc');
  const status = params.get('status');
  return {
    query: params.get('q') ?? '',
    topics: list('tematy').filter(isTopic),
    years: list('lata')
      .map(Number)
      .filter((year) => Number.isInteger(year)),
    part: part === '1' ? 1 : part === '2' ? 2 : null,
    status: status === 'nowe' || status === 'rozpoczete' || status === 'zaliczone' ? status : null,
  };
}
