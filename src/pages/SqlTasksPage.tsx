import { Link } from 'react-router';
import { LuCircleCheck } from 'react-icons/lu';
import { MorphItem } from '../components/MorphItem';
import { sessionsById } from '../data';
import { checkableSqlParts, sqlTasks, sqlTotalPoints } from '../data/sql';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { plural } from '../lib/plural';
import { passedSqlParts } from '../lib/sql/storage';
import type { SqlTask } from '../types';

/** Zadania pogrupowane według roku sesji (od najnowszych, jak w katalogu arkuszy). */
function byYear(tasks: SqlTask[]): [number, SqlTask[]][] {
  const groups = new Map<number, SqlTask[]>();
  for (const task of tasks) {
    const year = sessionsById.get(task.sessionId)?.year ?? 0;
    groups.set(year, [...(groups.get(year) ?? []), task]);
  }
  return [...groups.entries()];
}

/** Lista zadań z baz danych rozwiązywanych zapytaniami SQL. */
export function SqlTasksPage() {
  useDocumentTitle('Zadania z SQL');

  return (
    <section className="tab-intro-wrap" aria-labelledby="sql-tytul">
      <h2 id="sql-tytul">Zadania z baz danych</h2>
      <p className="lead">
        Zadania z arkuszy maturalnych 2018–2026, które rozwiązuje się w bazie danych. Pliki są już
        wczytane jako tabele – pisz zapytania SQL (także w stylu Accessa), a wyniki sprawdzisz z
        kluczem CKE.
      </p>
      {byYear(sqlTasks).map(([year, tasks]) => (
        <section key={year} className="year-group" aria-labelledby={`sql-rok-${year}`}>
          <h3 id={`sql-rok-${year}`}>{year}</h3>
          <ul className="session-grid">
            {tasks.map((task) => {
              const session = sessionsById.get(task.sessionId);
              const done = passedSqlParts(task.id);
              const total = checkableSqlParts(task).length;
              const to = `/sql/${encodeURIComponent(task.id)}`;
              return (
                <MorphItem key={task.id} to={to} className="session-card">
                  <p className="task-card__meta">
                    {session ? session.label : task.sessionId} · zadanie {task.number}
                  </p>
                  <h4 className="xl-card__title">
                    <Link to={to} className="stretched-link" viewTransition>
                      {task.title}
                    </Link>
                  </h4>
                  <p className="muted">
                    {task.parts.length}{' '}
                    {plural(task.parts.length, 'podpunkt', 'podpunkty', 'podpunktów')} ·{' '}
                    {sqlTotalPoints(task)} pkt
                  </p>
                  <p className={done >= total ? 'xl-card__done' : 'session-card__tasks'}>
                    {done >= total ? (
                      <>
                        <LuCircleCheck aria-hidden className="icon" /> Wszystko zaliczone
                      </>
                    ) : (
                      `Zaliczone: ${done}/${total}`
                    )}
                  </p>
                </MorphItem>
              );
            })}
          </ul>
        </section>
      ))}
    </section>
  );
}
