import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { LuRefreshCw } from 'react-icons/lu';
import { PdfViewer } from '../components/PdfViewer';
import { TheoryPartCard } from '../components/TheoryPartCard';
import { sessionsById } from '../data';
import { allTheoryParts, theoryTasksById } from '../data/theory';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  loadTheoryAnswers,
  saveTheoryAnswers,
  type StoredTheoryAnswers,
  type TheoryPartAnswer,
} from '../lib/theory/storage';
import type { TheoryTask } from '../types';
import { NotFoundPage } from './NotFoundPage';

export function TheoryTaskPage() {
  const { taskId = '' } = useParams();
  if (taskId === 'losowy') return <RandomTest />;
  const task = theoryTasksById.get(taskId);
  if (!task) return <NotFoundPage />;
  return <TheoryWorkspace key={task.id} task={task} />;
}

function Breadcrumbs({ current }: { current: string }) {
  return (
    <nav aria-label="Okruszki" className="breadcrumbs">
      <Link to="/zadania/test" viewTransition>
        Zadania testowe
      </Link>{' '}
      <span aria-hidden="true">/</span> <span aria-current="page">{current}</span>
    </nav>
  );
}

function TheoryWorkspace({ task }: { task: TheoryTask }) {
  const session = sessionsById.get(task.sessionId);
  useDocumentTitle(`Test: zadanie ${task.number} – ${session?.label ?? ''} ${session?.year ?? ''}`);
  const [answers, setAnswers] = useState<StoredTheoryAnswers>(() => loadTheoryAnswers(task.id));
  const [showSheet, setShowSheet] = useState(false);
  const passed = task.parts.filter((part) => answers.parts[part.number]?.passed).length;

  const setPart = (number: string, answer: TheoryPartAnswer) => {
    const next = { parts: { ...answers.parts, [number]: answer } };
    setAnswers(next);
    saveTheoryAnswers(task.id, next);
  };

  return (
    <div className="page page--narrow page--detail theory-page">
      <Breadcrumbs
        current={`${session?.label ?? ''} ${session?.year ?? ''} · zadanie ${task.number}`}
      />
      <header className="xl-header">
        <div>
          <p className="task-card__meta">
            {session ? (
              <Link to={`/arkusze/${session.id}`}>
                {session.label} {session.year}
              </Link>
            ) : (
              task.sessionId
            )}{' '}
            · zadanie {task.number}
          </p>
          <h1>{task.title}</h1>
        </div>
        <p className="xl-progress" role="status">
          Zaliczone: {passed}/{task.parts.length}
        </p>
      </header>
      <p className="muted">
        Oceń prawdziwość zdań: zaznacz P, jeśli zdanie jest prawdziwe, albo F – jeśli jest fałszywe.
        W każdym podpunkcie punkt uzyskasz tylko za komplet poprawnych odpowiedzi.
      </p>
      {session && (
        <div className="task-actions">
          <button
            type="button"
            className="button button--ghost"
            onClick={() => setShowSheet((v) => !v)}
            aria-expanded={showSheet}
          >
            {showSheet ? 'Ukryj arkusz' : 'Pokaż arkusz (PDF)'}
          </button>
        </div>
      )}
      {showSheet && session && (
        <PdfViewer files={session.sheets} title={`Arkusz ${session.label} ${session.year}`} />
      )}
      <div className="theory-parts">
        {task.parts.map((part) => (
          <TheoryPartCard
            key={part.number}
            part={part}
            answer={answers.parts[part.number] ?? { choices: [] }}
            onChange={(answer) => setPart(part.number, answer)}
          />
        ))}
      </div>
    </div>
  );
}

const RANDOM_SIZE = 10;

function drawParts() {
  const pool = [...allTheoryParts];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, RANDOM_SIZE);
}

/** Losowy test: 10 podpunktów z różnych arkuszy; odpowiedzi nie są zapisywane. */
function RandomTest() {
  useDocumentTitle('Losowy test');
  const [round, setRound] = useState(0);
  const [items, setItems] = useState(drawParts);
  const [answers, setAnswers] = useState<Record<string, TheoryPartAnswer>>({});
  const keyOf = (index: number) => `${round}-${index}`;
  const checked = items.filter((_, i) => answers[keyOf(i)]?.passed !== undefined).length;
  const passed = items.filter((_, i) => answers[keyOf(i)]?.passed).length;

  const again = () => {
    setItems(drawParts());
    setAnswers({});
    setRound((r) => r + 1);
  };

  return (
    <div className="page page--narrow page--detail theory-page">
      <Breadcrumbs current="Losowy test" />
      <header className="xl-header">
        <h1>Losowy test</h1>
        <p className="xl-progress" role="status">
          Wynik: {passed}/{items.length} pkt
          {checked < items.length ? ` (sprawdzone: ${checked})` : ''}
        </p>
      </header>
      <p className="muted">
        {RANDOM_SIZE} losowych podpunktów z zadań „Test” ze wszystkich arkuszy. Każdy wart jest 1
        punkt – tylko za komplet poprawnych odpowiedzi. Wyniki losowego testu nie są zapisywane.
      </p>
      <div className="theory-parts">
        {items.map(({ task, part }, i) => {
          const session = sessionsById.get(task.sessionId);
          return (
            <TheoryPartCard
              key={keyOf(i)}
              part={part}
              heading={
                <>
                  {i + 1}.{' '}
                  <span className="muted">
                    {session ? `${session.label} ${session.year}` : task.sessionId}, zad.{' '}
                    {part.number}
                  </span>
                </>
              }
              answer={answers[keyOf(i)] ?? { choices: [] }}
              onChange={(answer) => setAnswers((current) => ({ ...current, [keyOf(i)]: answer }))}
            />
          );
        })}
      </div>
      <button type="button" className="button" onClick={again}>
        <LuRefreshCw aria-hidden className="icon" /> Wylosuj nowy test
      </button>
    </div>
  );
}
