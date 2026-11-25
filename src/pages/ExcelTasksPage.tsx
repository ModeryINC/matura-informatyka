import { Link } from 'react-router';
import { MorphItem } from '../components/MorphItem';
import { sessionsById } from '../data';
import { spreadsheetTasks, totalPoints } from '../data/spreadsheets';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { plural } from '../lib/plural';
import { passedParts } from '../lib/spreadsheet/storage';
import { LuCircleCheck } from 'react-icons/lu';

/** Lista zadań rozwiązywanych w arkuszu kalkulacyjnym. */
export function ExcelTasksPage() {
  useDocumentTitle('Zadania z Excela');

  return (
    <section className="tab-intro-wrap" aria-labelledby="excel-tytul">
      <h2 id="excel-tytul">Zadania z arkusza kalkulacyjnego</h2>
      <p className="lead">
        Zadania z matury (nowa formuła, sesje majowe), które rozwiązuje się w Excelu. Dane są już
        wczytane do arkusza w przeglądarce – pisz formuły (także po polsku), a odpowiedzi sprawdzisz
        z kluczem CKE.
      </p>
      <ul className="session-grid">
        {spreadsheetTasks.map((task) => {
          const session = sessionsById.get(task.sessionId);
          const done = passedParts(task.id);
          const to = `/excel/${encodeURIComponent(task.id)}`;
          return (
            <MorphItem key={task.id} to={to} className="session-card">
              <p className="task-card__meta">
                {session ? `${session.label} ${session.year}` : task.sessionId} · zadanie{' '}
                {task.number}
              </p>
              <h3 className="xl-card__title">
                <Link to={to} className="stretched-link" viewTransition>
                  {task.title}
                </Link>
              </h3>
              <p className="muted">
                {task.parts.length}{' '}
                {plural(task.parts.length, 'podpunkt', 'podpunkty', 'podpunktów')} ·{' '}
                {totalPoints(task)} pkt
              </p>
              <p className={done === task.parts.length ? 'xl-card__done' : 'session-card__tasks'}>
                {done === task.parts.length ? (
                  <>
                    <LuCircleCheck aria-hidden className="icon" /> Wszystko zaliczone
                  </>
                ) : (
                  `Zaliczone: ${done}/${task.parts.length}`
                )}
              </p>
            </MorphItem>
          );
        })}
      </ul>
    </section>
  );
}
