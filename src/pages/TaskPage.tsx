import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { CodeEditor } from '../components/CodeEditor';
import { Console } from '../components/Console';
import { FileList } from '../components/FileList';
import { HintPanel } from '../components/HintPanel';
import { PdfViewer } from '../components/PdfViewer';
import { ResultPanel } from '../components/ResultPanel';
import { StatusBadge } from '../components/StatusBadge';
import { TopicList } from '../components/TopicBadge';
import { sessionsById, sheetLocation, tasksById, tasksForSession } from '../data';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useRunnerStatus } from '../hooks/useRunnerStatus';
import { downloadText, isSaveShortcut, solutionFileName } from '../lib/download';
import { findForbidden } from '../lib/restrictions';
import { aiConfigFromEnv, type AiConfig } from '../lib/hints';
import { loadSolution, removeSolution, saveSolution, solutionStatus } from '../lib/storage';
import { getRunner, type ExecutionOutput, type PythonRunner } from '../python/runner';
import type { SubmissionResult, Task } from '../types';
import { NotFoundPage } from './NotFoundPage';
import {
  LuArrowLeft,
  LuArrowRight,
  LuCheck,
  LuDownload,
  LuPlay,
  LuTriangleAlert,
} from 'react-icons/lu';

const STATUS_TEXT = {
  off: 'Python zostanie załadowany przy pierwszym uruchomieniu',
  loading: 'Ładowanie Pythona (pierwszy raz może potrwać kilka sekund)…',
  ready: 'Python gotowy',
  running: 'Wykonywanie…',
  error: 'Nie udało się załadować Pythona – sprawdź połączenie z internetem',
} as const;

const EMPTY_OUTPUT: ExecutionOutput = { stdout: '', error: null };
const USES_INPUT = /\binput\s*\(/;

const ENV_AI_CONFIG = aiConfigFromEnv();

interface TaskPageProps {
  runner?: PythonRunner;
  /** Konfiguracja podpowiedzi AI; `null` – wyłączone (brak klucza w buildzie). */
  aiConfig?: AiConfig | null;
}

export function TaskPage({ runner = getRunner(), aiConfig = ENV_AI_CONFIG }: TaskPageProps) {
  const { taskId = '' } = useParams();
  const task = tasksById.get(taskId);
  if (!task) return <NotFoundPage />;
  // `key` zapewnia świeży stan edytora po przejściu do innego zadania.
  return <TaskWorkspace key={task.id} task={task} runner={runner} aiConfig={aiConfig} />;
}

interface TaskWorkspaceProps {
  task: Task;
  runner: PythonRunner;
  aiConfig: AiConfig | null;
}

function TaskWorkspace({ task, runner, aiConfig }: TaskWorkspaceProps) {
  const session = sessionsById.get(task.sessionId);
  useDocumentTitle(`Zadanie ${task.number} – ${task.title}`);

  const [code, setCode] = useState(() => loadSolution(task.id)?.code ?? task.starterCode);
  const [result, setResult] = useState<SubmissionResult | null>(
    () => loadSolution(task.id)?.lastResult ?? null,
  );
  const [output, setOutput] = useState<ExecutionOutput>(EMPTY_OUTPUT);
  const [stdin, setStdin] = useState('');
  const [running, setRunning] = useState(false);
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
    setRunning(true);
    setResult(null);
    setOutput(EMPTY_OUTPUT);
    const finished = await runner.execute(task, code, {
      stdin,
      onOutput: (text) => setOutput((current) => ({ ...current, stdout: current.stdout + text })),
    });
    setOutput(finished);
    setRunning(false);
    setBusy(false);
  }, [runner, task, code, stdin]);

  const resultRef = useRef<HTMLDivElement>(null);
  const forbiddenUsed = useMemo(
    () => findForbidden(code, task.restrictions),
    [code, task.restrictions],
  );

  const submit = useCallback(async () => {
    setBusy(true);
    const submission = await runner.submit(task, code);
    saveSolution(task.id, { code, lastResult: submission });
    setResult(submission);
    // Wynik jest pod konsolą – pokazujemy go (w prawej kolumnie lub na stronie).
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' }),
    );
    setBusy(false);
  }, [runner, task, code]);

  // Ctrl+S na stronie zadania pobiera rozwiązanie jako plik .py zamiast zapisywać stronę.
  const saveFile = useCallback(
    () => downloadText(solutionFileName(task.id), code),
    [task.id, code],
  );
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isSaveShortcut(event)) return;
      event.preventDefault();
      saveFile();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [saveFile]);

  const reset = () => {
    if (!window.confirm('Przywrócić kod startowy? Twoje rozwiązanie zostanie usunięte.')) return;
    removeSolution(task.id);
    setCode(task.starterCode);
    setResult(null);
    setOutput(EMPTY_OUTPUT);
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
        <Link to="/zadania/python">Zadania</Link> <span aria-hidden="true">/</span>{' '}
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

          {task.restrictions && (
            <aside className="restriction" aria-label="Ograniczenia z arkusza">
              <strong>
                <LuTriangleAlert aria-hidden className="icon" /> Bez funkcji wbudowanych
              </strong>
              <p>{task.restrictions.note}</p>
            </aside>
          )}

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
            <PdfViewer
              files={session.sheets}
              title={`Arkusz ${session.label} ${session.year}`}
              initialPart={sheetLocation(task.id)?.part}
              initialPage={sheetLocation(task.id)?.page}
            />
          )}

          {dataFiles.length > 0 && (
            <details className="data-files">
              <summary>Pliki z danymi ({dataFiles.length})</summary>
              <FileList files={dataFiles} preview />
            </details>
          )}

          <nav className="pager" aria-label="Inne zadania z arkusza">
            {previous ? (
              <Link to={`/zadanie/${encodeURIComponent(previous.id)}`}>
                <LuArrowLeft aria-hidden className="icon" /> Zadanie {previous.number}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link to={`/zadanie/${encodeURIComponent(next.id)}`}>
                Zadanie {next.number} <LuArrowRight aria-hidden className="icon" />
              </Link>
            )}
          </nav>
        </section>

        <section className="workspace__editor" aria-label="Rozwiązanie">
          <div className="editor-toolbar">
            <button type="button" className="button" onClick={run} disabled={busy}>
              <LuPlay aria-hidden className="icon" /> Uruchom
            </button>
            <button
              type="button"
              className="button button--primary"
              onClick={submit}
              disabled={busy}
            >
              <LuCheck aria-hidden className="icon" /> Sprawdź
            </button>
            <button type="button" className="button button--ghost" onClick={reset} disabled={busy}>
              Resetuj
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={saveFile}
              title="Pobierz rozwiązanie jako plik .py (Ctrl+S)"
            >
              <LuDownload aria-hidden className="icon" /> .py
            </button>
            <span className="editor-toolbar__hint muted">
              Ctrl+Enter – sprawdź · Ctrl+S – pobierz
            </span>
          </div>
          {/* Na szerokim ekranie: kod po lewej, konsola i wynik sprawdzenia po prawej. */}
          <div className="editor-pane">
            <div className="editor-pane__code">
              <CodeEditor
                value={code}
                onChange={setCode}
                onSubmit={busy ? undefined : submit}
                label={`Kod rozwiązania zadania ${task.number}`}
              />
              <p className={`runner-status runner-status--${runnerStatus}`} role="status">
                {STATUS_TEXT[runnerStatus]}
              </p>
              {forbiddenUsed.length > 0 && (
                <p className="restriction-warning" role="status">
                  <LuTriangleAlert aria-hidden className="icon" /> W tym zadaniu na maturze nie
                  wolno używać:{' '}
                  {forbiddenUsed.map((name, i) => (
                    <span key={name}>
                      {i > 0 && ', '}
                      <code>{name}</code>
                    </span>
                  ))}
                  . Sprawdzarka i tak oceni wynik, ale napisz to samodzielnie.
                </p>
              )}
            </div>
            <div className="editor-pane__output">
              <Console
                output={output.stdout}
                error={output.error}
                running={running}
                stdin={stdin}
                onStdinChange={setStdin}
                onClear={() => setOutput(EMPTY_OUTPUT)}
                usesInput={USES_INPUT.test(code)}
              />
              <div aria-live="polite" ref={resultRef}>
                {result && <ResultPanel result={result} />}
              </div>
              {aiConfig && (
                <HintPanel
                  config={aiConfig}
                  task={task}
                  code={code}
                  result={result}
                  output={output.stdout || output.error ? output : null}
                  solved={status === 'zaliczone'}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
