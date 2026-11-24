import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { TaskCard } from '../components/TaskCard';
import { TaskFilters } from '../components/TaskFilters';
import { sessionsById, tasks } from '../data';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useSolutionStatuses } from '../hooks/useSolutions';
import {
  countTopics,
  filterTasks,
  filtersToParams,
  paramsToFilters,
  type TaskFilters as Filters,
} from '../lib/search';

/** Strona główna: wyszukiwarka i lista zadań z automatycznym sprawdzaniem. */
export function TasksPage() {
  useDocumentTitle();
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => paramsToFilters(params), [params]);
  const statusOf = useSolutionStatuses();

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

  return (
    <div className="page page--tasks">
      <section className="hero">
        <h1>Zadania maturalne z informatyki</h1>
        <p className="hero__lead">
          Rozwiązuj zadania algorytmiczne z arkuszy CKE w Pythonie. Kod uruchamia się w Twojej
          przeglądarce i jest od razu porównywany z kluczem odpowiedzi.
        </p>
        <p className="progress" aria-live="polite">
          <span>
            Zaliczone: <strong>{solved}</strong> z {tasks.length}
          </span>
          <progress max={tasks.length || 1} value={solved} aria-label="Postęp rozwiązywania" />
        </p>
      </section>

      <div className="tasks-layout">
        <aside className="tasks-layout__filters">
          <TaskFilters
            filters={filters}
            onChange={onChange}
            topicCounts={topicCounts}
            years={years}
          />
        </aside>
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
    </div>
  );
}
