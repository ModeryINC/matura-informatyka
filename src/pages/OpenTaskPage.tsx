import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { HintText } from '../components/HintText';
import { OpenPartCard } from '../components/OpenPartCard';
import { PdfViewer } from '../components/PdfViewer';
import { ClearAnswersButton } from '../components/ClearAnswersButton';
import { sessionsById, sheetLocation } from '../data';
import { openTasksById } from '../data/open';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  clearOpenAnswers,
  loadOpenAnswers,
  saveOpenAnswers,
  type OpenPartAnswer,
  type StoredOpenAnswers,
} from '../lib/theory/storage';
import type { OpenTask } from '../types';
import { NotFoundPage } from './NotFoundPage';

export function OpenTaskPage() {
  const { taskId = '' } = useParams();
  const task = openTasksById.get(taskId);
  if (!task) return <NotFoundPage />;
  return <OpenWorkspace key={task.id} task={task} />;
}

function OpenWorkspace({ task }: { task: OpenTask }) {
  const session = sessionsById.get(task.sessionId);
  const where = `${session?.label ?? ''} ${session?.year ?? ''}`;
  useDocumentTitle(`Zadanie otwarte ${task.number} – ${where}`);
  const [answers, setAnswers] = useState<StoredOpenAnswers>(() => loadOpenAnswers(task.id));
  const [showSheet, setShowSheet] = useState(false);
  const passed = task.parts.filter((part) => answers.parts[part.number]?.passed).length;
  const touched = Object.keys(answers.parts).length > 0;
  const location = sheetLocation(task.id);

  const setPart = (number: string, answer: OpenPartAnswer) => {
    const next = { parts: { ...answers.parts, [number]: answer } };
    setAnswers(next);
    saveOpenAnswers(task.id, next);
  };

  return (
    <div className="page page--narrow page--detail theory-page">
      <nav aria-label="Okruszki" className="breadcrumbs">
        <Link to="/zadania/test" viewTransition>
          Zadania testowe
        </Link>{' '}
        <span aria-hidden="true">/</span>{' '}
        <span aria-current="page">
          {where} · zadanie {task.number}
        </span>
      </nav>
      <header className="xl-header">
        <div>
          <p className="task-card__meta">
            {session ? <Link to={`/arkusze/${session.id}`}>{where}</Link> : task.sessionId} ·
            zadanie {task.number} · otwarte
          </p>
          <h1>{task.title}</h1>
        </div>
        <p className="xl-progress" role="status">
          Zaliczone: {passed}/{task.parts.length}
        </p>
      </header>
      <p className="muted">
        Zapisz odpowiedź, a potem porównaj ją z rozwiązaniem z klucza CKE. Krótkie odpowiedzi
        sprawdzimy automatycznie, dłuższe oceniasz sam. Rysunki i pełne tabele są w arkuszu (PDF).
      </p>
      <div className="task-actions">
        {session && (
          <button
            type="button"
            className="button button--ghost"
            onClick={() => setShowSheet((v) => !v)}
            aria-expanded={showSheet}
          >
            {showSheet ? 'Ukryj arkusz' : 'Pokaż arkusz (PDF)'}
          </button>
        )}
        <ClearAnswersButton
          disabled={!touched}
          onClear={() => {
            clearOpenAnswers(task.id);
            setAnswers({ parts: {} });
          }}
        />
      </div>
      {showSheet && session && (
        <PdfViewer
          files={session.sheets}
          title={`Arkusz ${where}`}
          initialPart={location?.part}
          initialPage={location?.page}
        />
      )}
      {task.intro && <HintText text={task.intro} className="rich-text open-intro" />}
      <div className="theory-parts">
        {task.parts.map((part) => (
          <OpenPartCard
            key={part.number}
            part={part}
            answer={answers.parts[part.number] ?? { text: '' }}
            onChange={(answer) => setPart(part.number, answer)}
          />
        ))}
      </div>
    </div>
  );
}
