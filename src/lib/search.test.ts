import type { ExamSession, Task } from '../types';
import {
  EMPTY_FILTERS,
  countTopics,
  filterTasks,
  filtersToParams,
  paramsToFilters,
  type SolutionStatus,
} from './search';

const session = (id: string, year: number, label = 'Maj'): ExamSession => ({
  id,
  year,
  slug: id.slice(5),
  kind: 'glowna',
  label,
  sheets: [],
  answers: [],
  attachments: [],
});

const task = (over: Partial<Task> & Pick<Task, 'id' | 'sessionId'>): Task =>
  ({
    number: '1.1',
    title: 'Zadanie',
    part: 2,
    points: 1,
    topics: [],
    summary: '',
    starterCode: '',
    kind: 'program',
    checks: [],
    ...over,
  }) as Task;

const tasks: Task[] = [
  task({
    id: 'a',
    sessionId: '2024/maj',
    title: 'Liczby pierwsze',
    topics: ['liczby-pierwsze'],
    part: 2,
  }),
  task({
    id: 'b',
    sessionId: '2023/maj',
    title: 'Sortowanie bąbelkowe',
    topics: ['sortowanie'],
    part: 1,
  }),
  task({
    id: 'c',
    sessionId: '2023/maj',
    title: 'Słowa',
    topics: ['napisy', 'slowniki'],
    summary: 'Zliczanie słów',
  }),
];

const context = (statuses: Record<string, SolutionStatus> = {}) => ({
  sessions: new Map([
    ['2024/maj', session('2024/maj', 2024)],
    ['2023/maj', session('2023/maj', 2023)],
  ]),
  statusOf: (id: string) => statuses[id] ?? 'nowe',
});

const ids = (list: Task[]) => list.map((t) => t.id);

describe('filterTasks', () => {
  it('bez filtrów zwraca wszystko', () => {
    expect(ids(filterTasks(tasks, EMPTY_FILTERS, context()))).toEqual(['a', 'b', 'c']);
  });

  it('filtruje po temacie (dowolny z wybranych)', () => {
    const result = filterTasks(
      tasks,
      { ...EMPTY_FILTERS, topics: ['sortowanie', 'slowniki'] },
      context(),
    );
    expect(ids(result)).toEqual(['b', 'c']);
  });

  it('wyszukuje bez względu na polskie znaki i wielkość liter', () => {
    expect(ids(filterTasks(tasks, { ...EMPTY_FILTERS, query: 'BABELKOWE' }, context()))).toEqual([
      'b',
    ]);
    expect(ids(filterTasks(tasks, { ...EMPTY_FILTERS, query: 'slow' }, context()))).toEqual(['c']);
  });

  it('wyszukuje po nazwie tematu i roku sesji', () => {
    expect(ids(filterTasks(tasks, { ...EMPTY_FILTERS, query: 'dzielniki' }, context()))).toEqual([
      'a',
    ]);
    expect(ids(filterTasks(tasks, { ...EMPTY_FILTERS, query: 'maj 2023' }, context()))).toEqual([
      'b',
      'c',
    ]);
  });

  it('filtruje po roku, części i statusie', () => {
    expect(ids(filterTasks(tasks, { ...EMPTY_FILTERS, years: [2024] }, context()))).toEqual(['a']);
    expect(ids(filterTasks(tasks, { ...EMPTY_FILTERS, part: 1 }, context()))).toEqual(['b']);
    expect(
      ids(
        filterTasks(tasks, { ...EMPTY_FILTERS, status: 'zaliczone' }, context({ c: 'zaliczone' })),
      ),
    ).toEqual(['c']);
  });
});

test('countTopics zlicza zadania w tematach', () => {
  const counts = countTopics(tasks);
  expect(counts.get('napisy')).toBe(1);
  expect(counts.get('rekurencja')).toBeUndefined();
});

describe('parametry URL', () => {
  it('zapis i odczyt są odwrotne', () => {
    const filters = {
      query: 'ciągi',
      topics: ['rekurencja', 'napisy'] as const,
      years: [2024, 2025],
      part: 2 as const,
      status: 'zaliczone' as const,
    };
    expect(paramsToFilters(filtersToParams({ ...filters, topics: [...filters.topics] }))).toEqual({
      ...filters,
      topics: [...filters.topics],
    });
  });

  it('puste filtry dają pusty adres', () => {
    expect(filtersToParams(EMPTY_FILTERS).toString()).toBe('');
  });

  it('ignoruje niepoprawne wartości', () => {
    const params = new URLSearchParams(
      'tematy=nieznany,rekurencja&lata=abc,2020&czesc=7&status=xyz',
    );
    expect(paramsToFilters(params)).toEqual({
      ...EMPTY_FILTERS,
      topics: ['rekurencja'],
      years: [2020],
    });
  });
});
