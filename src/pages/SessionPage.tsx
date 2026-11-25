import { Link, useParams } from 'react-router';
import { FileList } from '../components/FileList';
import { MorphItem } from '../components/MorphItem';
import { PdfViewer } from '../components/PdfViewer';
import { sessionsById, tasksForSession } from '../data';
import { spreadsheetTasks } from '../data/spreadsheets';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useSolutionStatuses } from '../hooks/useSolutions';
import { passedParts } from '../lib/spreadsheet/storage';
import { NotFoundPage } from './NotFoundPage';
import { LuCircleCheck } from 'react-icons/lu';

/** Arkusz: podgląd PDF, przyciski do zadań z tego arkusza, klucz i pliki z danymi. */
export function SessionPage() {
  const { year = '', slug = '' } = useParams();
  const session = sessionsById.get(`${year}/${slug}`);
  useDocumentTitle(session ? `${session.label} ${session.year}` : undefined);
  const statusOf = useSolutionStatuses();
  if (!session) return <NotFoundPage />;
  const tasks = tasksForSession(session.id);
  const excelTasks = spreadsheetTasks.filter((t) => t.sessionId === session.id);
  const count = tasks.length + excelTasks.length;

  return (
    <div className="page page--detail">
      <nav aria-label="Okruszki" className="breadcrumbs">
        <Link to="/arkusze" viewTransition>
          Arkusze
        </Link>{' '}
        <span aria-hidden="true">/</span>{' '}
        <span aria-current="page">
          {session.label} {session.year}
        </span>
      </nav>
      <h1>
        {session.label} {session.year}
      </h1>

      <nav className="task-jump" aria-labelledby="zadania">
        <h2 id="zadania" className="task-jump__title">
          Zadania z tego arkusza
        </h2>
        {count === 0 ? (
          <p className="muted">
            Dla tego arkusza nie ma jeszcze zadań ze sprawdzarką. Możesz rozwiązać go samodzielnie,
            korzystając z klucza odpowiedzi.
          </p>
        ) : (
          <ul className="task-jump__list">
            {tasks.map((task) => {
              const status = statusOf(task.id);
              return (
                <MorphItem key={task.id} to={`/zadanie/${encodeURIComponent(task.id)}`}>
                  <Link
                    viewTransition
                    to={`/zadanie/${encodeURIComponent(task.id)}`}
                    className={`task-jump__button task-jump__button--${status}`}
                    title={task.title}
                  >
                    <span className="task-jump__number">
                      {status === 'zaliczone' && (
                        <LuCircleCheck className="icon" aria-label="zaliczone" />
                      )}
                      {task.number}
                    </span>
                    <span className="task-jump__name">{task.title}</span>
                  </Link>
                </MorphItem>
              );
            })}
            {excelTasks.map((task) => {
              const done = passedParts(task.id) === task.parts.length;
              return (
                <MorphItem key={task.id} to={`/excel/${encodeURIComponent(task.id)}`}>
                  <Link
                    viewTransition
                    to={`/excel/${encodeURIComponent(task.id)}`}
                    className={`task-jump__button task-jump__button--excel${done ? ' task-jump__button--zaliczone' : ''}`}
                    title={task.title}
                  >
                    <span className="task-jump__number">
                      {done && <LuCircleCheck className="icon" aria-label="zaliczone" />}
                      {task.number} · Excel
                    </span>
                    <span className="task-jump__name">{task.title}</span>
                  </Link>
                </MorphItem>
              );
            })}
          </ul>
        )}
      </nav>

      <div className="session-layout">
        <section aria-labelledby="podglad">
          <h2 id="podglad" className="visually-hidden">
            Arkusz
          </h2>
          <PdfViewer files={session.sheets} title={`Arkusz ${session.label} ${session.year}`} />
        </section>
        <aside className="session-layout__side">
          <section aria-labelledby="pliki">
            <h2 id="pliki">Pliki</h2>
            <h3>Arkusz</h3>
            <FileList files={session.sheets} />
            <h3>Klucz odpowiedzi</h3>
            {session.answers.length ? (
              <FileList files={session.answers} />
            ) : (
              <p className="muted">Brak</p>
            )}
            <h3>Dane do zadań</h3>
            {session.attachments.length ? (
              <details>
                <summary>{session.attachments.length} plików</summary>
                <FileList files={session.attachments} preview />
              </details>
            ) : (
              <p className="muted">Brak</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
