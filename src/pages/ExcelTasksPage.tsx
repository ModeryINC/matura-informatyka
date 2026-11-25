import { Link } from 'react-router';
import { sessionsById } from '../data';
import { spreadsheetTasks, totalPoints } from '../data/spreadsheets';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { plural } from '../lib/plural';
import { passedParts } from '../lib/spreadsheet/storage';

/** Lista zadań rozwiązywanych w arkuszu kalkulacyjnym. */
export function ExcelTasksPage() {
  useDocumentTitle('Zadania z Excela');

  return (
    <div className="page">
      <h1>Zadania z arkusza kalkulacyjnego</h1>
      <p className="lead">
        Zadania z matury (nowa formuła, sesje majowe), które rozwiązuje się w Excelu. Dane są już
        wczytane do arkusza w przeglądarce – pisz formuły (także po polsku), a odpowiedzi sprawdzisz
        z kluczem CKE.
      </p>
      <ul className="session-grid">
        {spreadsheetTasks.map((task) => {
          const session = sessionsById.get(task.sessionId);
          const done = passedParts(task.id);
          return (
            <li key={task.id} className="session-card">
              <p className="task-card__meta">
                {session ? `${session.label} ${session.year}` : task.sessionId} · zadanie{' '}
                {task.number}
              </p>
              <h2 className="xl-card__title">
                <Link to={`/excel/${encodeURIComponent(task.id)}`} className="stretched-link">
                  {task.title}
                </Link>
              </h2>
              <p className="muted">
                {task.parts.length}{' '}
                {plural(task.parts.length, 'podpunkt', 'podpunkty', 'podpunktów')} ·{' '}
                {totalPoints(task)} pkt
              </p>
              <p className={done === task.parts.length ? 'xl-card__done' : 'session-card__tasks'}>
                {done === task.parts.length
                  ? '✓ Wszystko zaliczone'
                  : `Zaliczone: ${done}/${task.parts.length}`}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
