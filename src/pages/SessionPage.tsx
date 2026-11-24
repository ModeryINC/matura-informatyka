import { useParams } from 'react-router';
import { FileList } from '../components/FileList';
import { PdfViewer } from '../components/PdfViewer';
import { TaskCard } from '../components/TaskCard';
import { sessionsById, tasksForSession } from '../data';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useSolutionStatuses } from '../hooks/useSolutions';
import { NotFoundPage } from './NotFoundPage';

/** Szczegóły sesji: podgląd arkusza, klucz, pliki z danymi i zadania. */
export function SessionPage() {
  const { year = '', slug = '' } = useParams();
  const session = sessionsById.get(`${year}/${slug}`);
  useDocumentTitle(session ? `${session.label} ${session.year}` : undefined);
  const statusOf = useSolutionStatuses();
  if (!session) return <NotFoundPage />;
  const tasks = tasksForSession(session.id);

  return (
    <div className="page">
      <h1>
        {session.label} {session.year}
      </h1>
      <div className="session-layout">
        <section aria-labelledby="podglad">
          <h2 id="podglad">Arkusz</h2>
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
                <FileList files={session.attachments} download />
              </details>
            ) : (
              <p className="muted">Brak</p>
            )}
          </section>
        </aside>
      </div>
      <section aria-labelledby="zadania" className="session-tasks">
        <h2 id="zadania">Zadania z automatycznym sprawdzaniem</h2>
        {tasks.length === 0 ? (
          <p className="muted">
            Dla tego arkusza nie ma jeszcze zadań ze sprawdzaczką. Możesz rozwiązać go samodzielnie,
            korzystając z klucza odpowiedzi.
          </p>
        ) : (
          <ul className="task-grid">
            {tasks.map((task) => (
              <li key={task.id}>
                <TaskCard task={task} session={session} status={statusOf(task.id)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
