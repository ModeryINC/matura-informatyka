import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { CodeEditor } from '../components/CodeEditor';
import { FileList } from '../components/FileList';
import { PdfViewer } from '../components/PdfViewer';
import { OutputPanel, ResultPanel } from '../components/ResultPanel';
import { StatusBadge } from '../components/StatusBadge';
import { TopicList } from '../components/TopicBadge';
import { sessionsById, tasksById, tasksForSession } from '../data';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useRunnerStatus } from '../hooks/useRunnerStatus';
import { loadSolution, removeSolution, saveSolution, solutionStatus } from '../lib/storage';
import { getRunner, type ExecutionOutput, type PythonRunner } from '../python/runner';
import type { SubmissionResult, Task } from '../types';
import { NotFoundPage } from './NotFoundPage';

const STATUS_TEXT = {
  off: 'Python zostanie załadowany przy pierwszym uruchomieniu',
  loading: 'Ładowanie Pythona (pierwszy raz może potrwać kilka sekund)…',
  ready: 'Python gotowy',
  running: 'Wykonywanie…',
  error: 'Nie udało się załadować Pythona – sprawdź połączenie z internetem',
} as const;

export function TaskPage({ runner = getRunner() }: { runner?: PythonRunner }) {
  const { taskId = '' } = useParams();
  const task = tasksById.get(taskId);
  if (!task) return <NotFoundPage />;
  // `key` zapewnia świeży stan edytora po przejściu do innego zadania.
  return <TaskWorkspace key={task.id} task={task} runner={runner} />;
}

function TaskWorkspace({ task, runner }: { task: Task; runner: PythonRunner }) {
  const session = sessionsById.get(task.sessionId);
  useDocumentTitle(`Zadanie ${task.number} – ${task.title}`);

  const [code, setCode] = useState(() => loadSolution(task.id)?.code ?? task.starterCode);
  const [result, setResult] = useState<SubmissionResult | null>(
    () => loadSolution(task.id)?.lastResult ?? null,
  );
  const [output, setOutput] = useState<ExecutionOutput | null>(null);
  const [busy, setBusy] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const runnerStatus = useRunnerStatus(runner);
  const status = solutionStatus(task.id);

  // Zapis szkicu z opóźnieniem, żeby nie pisać do localStorage przy każdym znaku.
  useEffect(() => {
    if (code === (loadSolution(task.id)?.code ?? task.starterCode)) return;
    const timer = setTimeout(() => saveSolution(task.id, { code }), 500);
    return () => clearTimeout(timer);
  }, [code, task]);

  const run = useCallback(async () => {
    setBusy(true);
    setResult(null);
    setOutput(await runner.execute(task, code));
    setBusy(false);
  }, [runner, task, code]);

  const submit = useCallback(async () => {
    setBusy(true);
    setOutput(null);
    const submission = await runner.submit(task, code);
    saveSolution(task.id, { code, lastResult: submission });
    setResult(submission);
    setBusy(false);
  }, [runner, task, code]);

  const reset = () => {
    if (!window.confirm('Przywrócić kod startowy? Twoje rozwiązanie zostanie usunięte.')) return;
    removeSolution(task.id);
    setCode(task.starterCode);
    setResult(null);
    setOutput(null);
  };

  const siblings = tasksForSession(task.sessionId);
  const index = siblings.findIndex((t) => t.id === task.id);
  const previous = siblings[index - 1];
  const next = siblings[index + 1];
  const dataFiles =
    task.kind === 'program' ? [...new Set(task.checks.flatMap((c) => Object.values(c.files)))] : [];

  return (
    <div className="page page--task">
      <nav aria-label="Okruszki" className="breadcrumbs">
        <Link to="/">Zadania</Link> <span aria-hidden="true">/</span>{' '}
        {session && (
          <>
            <Link to={`/arkusze/${session.id}`}>
              {session.label} {session.year}
            </Link>{' '}
            <span aria-hidden="true">/</span>{' '}
          </>
        )}
        <span aria-current="page">Zadanie {task.number}</span>
      </nav>

      <div className="workspace">
        <section className="workspace__task" aria-labelledby="tytul-zadania">
          <header className="task-header">
            <p className="task-card__meta">
              Zadanie {task.number} · część {task.part} · {task.points} pkt
            </p>
            <h1 id="tytul-zadania">{task.title}</h1>
            <StatusBadge status={status} />
          </header>
          <TopicList topics={task.topics} />
          <div className="task-summary">
            {task.summary.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <div className="task-howto">
            {task.kind === 'program' ? (
              <p>
                Napisz <strong>program</strong>, który wczyta dane z{' '}
                {Object.keys(task.checks[0]?.files ?? {}).map((name, i) => (
                  <span key={name}>
                    {i > 0 && ', '}
                    <code>{name}</code>
                  </span>
                ))}{' '}
                (z bieżącego katalogu) i wypisze odpowiedź przez <code>print</code>.
              </p>
            ) : (
              <p>
                Zdefiniuj funkcję <code>{task.functionName}</code>. Sprawdzarka wywoła ją z różnymi
                argumentami i porówna zwracane wartości (wypisywanie nie jest potrzebne).
              </p>
            )}
            <p className="muted">
              Pełna treść zadania jest w arkuszu – skrót powyżej to tylko przypomnienie.
            </p>
          </div>

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

          {dataFiles.length > 0 && (
            <details className="data-files">
              <summary>Pliki z danymi ({dataFiles.length})</summary>
              <FileList files={dataFiles} download />
            </details>
          )}

          <nav className="pager" aria-label="Inne zadania z arkusza">
            {previous ? (
              <Link to={`/zadanie/${encodeURIComponent(previous.id)}`}>
                ← Zadanie {previous.number}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link to={`/zadanie/${encodeURIComponent(next.id)}`}>Zadanie {next.number} →</Link>
            )}
          </nav>
        </section>

        <section className="workspace__editor" aria-label="Rozwiązanie">
          <div className="editor-toolbar">
            <button type="button" className="button" onClick={run} disabled={busy}>
              ▶ Uruchom
            </button>
            <button
              type="button"
              className="button button--primary"
              onClick={submit}
              disabled={busy}
            >
              ✓ Sprawdź
            </button>
            <button type="button" className="button button--ghost" onClick={reset} disabled={busy}>
              Resetuj
            </button>
            <span className="editor-toolbar__hint muted">Ctrl+Enter – sprawdź</span>
          </div>
          <CodeEditor
            value={code}
            onChange={setCode}
            onSubmit={busy ? undefined : submit}
            label={`Kod rozwiązania zadania ${task.number}`}
          />
          <p className={`runner-status runner-status--${runnerStatus}`} role="status">
            {STATUS_TEXT[runnerStatus]}
          </p>
          <div aria-live="polite">
            {output && <OutputPanel output={output} />}
            {result && <ResultPanel result={result} />}
          </div>
        </section>
      </div>
    </div>
  );
}
