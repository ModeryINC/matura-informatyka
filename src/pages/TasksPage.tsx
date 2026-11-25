import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
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

/** Zakładka „Python”: wyszukiwarka i lista zadań z automatycznym sprawdzaniem. */
export function TasksPage() {
  useDocumentTitle('Zadania w Pythonie');
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
    <>
      <section className="tab-intro" aria-labelledby="python-tytul">
        <h2 id="python-tytul">Zadania w Pythonie</h2>
        <p className="lead">
          Zadania algorytmiczne z arkuszy CKE. Kod uruchamia się w Twojej przeglądarce i jest od
          razu porównywany z kluczem odpowiedzi. Nowy w Pythonie? Zacznij od{' '}
          <Link to="/python">podstaw Pythona</Link>.
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
    </>
  );
}
