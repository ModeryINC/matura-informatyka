import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { MOBILE_NAV_QUERY } from '../components/Layout';
import { SidePanel } from '../components/SidePanel';
import { TaskCard } from '../components/TaskCard';
import { TaskFilters } from '../components/TaskFilters';
import { sessionsById, tasks } from '../data';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { usePreload } from '../lib/preload';
import { getRunner } from '../python/runner';
import { useSolutionStatuses } from '../hooks/useSolutions';
import {
  countTopics,
  filterTasks,
  filtersToParams,
  paramsToFilters,
  type TaskFilters as Filters,
} from '../lib/search';

/** Zakładka „Python”: wyszukiwarka i lista zadań z automatycznym sprawdzaniem. */
/** Python (Pyodide) ładuje się w tle – pierwsze „Uruchom” w zadaniu nie czeka. */
const preloadPython = () => getRunner().init();

export function TasksPage() {
  useDocumentTitle('Zadania w Pythonie');
  usePreload(preloadPython);
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => paramsToFilters(params), [params]);
  const statusOf = useSolutionStatuses();
  // Na telefonie wyszukiwarka wysuwa się z prawej krawędzi (jak panel odpowiedzi).
  const mobile = useMediaQuery(MOBILE_NAV_QUERY);
  const activeFilters =
    (filters.query.trim() ? 1 : 0) +
    filters.topics.length +
    filters.years.length +
    (filters.part ? 1 : 0) +
    (filters.status ? 1 : 0);

  const topicCounts = useMemo(() => countTopics(tasks), []);
  const years = useMemo(
    () =>
      [...new Set(tasks.map((t) => sessionsById.get(t.sessionId)?.year ?? 0))]
        .filter(Boolean)
        .sort((a, b) => b - a),
    [],
  );
  const visible = useMemo(
    () => filterTasks(tasks, filters, { sessions: sessionsById, statusOf }),
    [filters, statusOf],
  );
  const solved = tasks.filter((t) => statusOf(t.id) === 'zaliczone').length;

  const onChange = (next: Filters) => setParams(filtersToParams(next), { replace: true });

  const filterPanel = (
    <TaskFilters filters={filters} onChange={onChange} topicCounts={topicCounts} years={years} />
  );

  return (
    <>
      <section className="tab-intro" aria-labelledby="python-tytul">
        <h2 id="python-tytul">Zadania w Pythonie</h2>
        <p className="lead">
          Zadania algorytmiczne z arkuszy CKE. Kod uruchamia się w Twojej przeglądarce i jest od
          razu porównywany z kluczem odpowiedzi. Nowy w Pythonie? Zacznij od{' '}
          <Link to="/podstawy/python">podstaw Pythona</Link>.
        </p>
        <p className="progress" aria-live="polite">
          <span>
            Zaliczone: <strong>{solved}</strong> z {tasks.length}
          </span>
          <progress max={tasks.length || 1} value={solved} aria-label="Postęp rozwiązywania" />
        </p>
      </section>

      <div className="tasks-layout">
        {mobile ? (
          <SidePanel
            title="Szukaj"
            badge={activeFilters > 0 ? String(activeFilters) : undefined}
            drawerOnly
            footer={(close) => (
              <button type="button" className="button button--primary" onClick={close}>
                Pokaż zadania ({visible.length})
              </button>
            )}
          >
            {filterPanel}
          </SidePanel>
        ) : (
          <aside className="tasks-layout__filters">{filterPanel}</aside>
        )}
        <section className="tasks-layout__results" aria-labelledby="wyniki">
          <h2 id="wyniki" className="results-heading">
            {visible.length === tasks.length ? 'Wszystkie zadania' : 'Wyniki wyszukiwania'}{' '}
            <span className="muted">({visible.length})</span>
          </h2>
          {visible.length === 0 ? (
            <p className="empty">Brak zadań spełniających kryteria. Spróbuj zmienić filtry.</p>
          ) : (
            <ul className="task-grid">
              {visible.map((task) => (
                <li key={task.id}>
                  <TaskCard
                    task={task}
                    session={sessionsById.get(task.sessionId)}
                    status={statusOf(task.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
