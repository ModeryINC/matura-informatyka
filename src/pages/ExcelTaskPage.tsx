import type { Sheet } from '@fortune-sheet/core';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { FileList } from '../components/FileList';
import { PdfViewer } from '../components/PdfViewer';
import { SpreadsheetPartCard } from '../components/SpreadsheetPartCard';
import type { SpreadsheetHandle } from '../components/SpreadsheetWorkbook';
import { sessionsById, sheetLocation } from '../data';
import { spreadsheetTasksById, totalPoints } from '../data/spreadsheets';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { POLISH_FUNCTIONS } from '../lib/spreadsheet/formulaLocale';
import { compactSheets, loadTaskSheets } from '../lib/spreadsheet/workbook';
import {
  loadAnswers,
  loadWorkbook,
  removeWorkbook,
  saveAnswers,
  saveWorkbook,
  type PartAnswer,
  type StoredSpreadsheetAnswers,
} from '../lib/spreadsheet/storage';
import type { SpreadsheetTask } from '../types';
import { NotFoundPage } from './NotFoundPage';

const SpreadsheetWorkbook = lazy(() => import('../components/SpreadsheetWorkbook'));

const SAVE_DELAY_MS = 1000;

export function ExcelTaskPage() {
  const { taskId = '' } = useParams();
  const task = spreadsheetTasksById.get(taskId);
  if (!task) return <NotFoundPage />;
  return <ExcelWorkspace key={task.id} task={task} />;
}

function ExcelWorkspace({ task }: { task: SpreadsheetTask }) {
  const session = sessionsById.get(task.sessionId);
  useDocumentTitle(`Excel: zadanie ${task.number} – ${task.title}`);

  const [sheets, setSheets] = useState<Sheet[] | null>(() => loadWorkbook(task.id));
  const [version, setVersion] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [answers, setAnswers] = useState<StoredSpreadsheetAnswers>(() => loadAnswers(task.id));
  const [showSheet, setShowSheet] = useState(false);
  const workbook = useRef<SpreadsheetHandle>(null);
  const pending = useRef<Sheet[] | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Pierwsze wejście (albo „przywróć dane”): wczytujemy pliki z danymi.
  useEffect(() => {
    if (sheets) return;
    let cancelled = false;
    loadTaskSheets(task)
      .then((loaded) => !cancelled && setSheets(loaded))
      .catch(() => !cancelled && setLoadError('Nie udało się pobrać plików z danymi.'));
    return () => {
      cancelled = true;
    };
  }, [task, sheets]);

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    if (!pending.current) return;
    setSaveFailed(!saveWorkbook(task.id, compactSheets(pending.current)));
    pending.current = null;
  }, [task.id]);

  // Zapis przy opuszczeniu strony, żeby nie zgubić ostatniej sekundy pracy.
  useEffect(() => flush, [flush]);

  const onSheetsChange = useCallback(
    (next: Sheet[]) => {
      pending.current = next;
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, SAVE_DELAY_MS);
    },
    [flush],
  );

  const resetData = () => {
    if (
      !window.confirm(
        'Przywrócić dane z plików? Twoje formuły i zmiany w arkuszu zostaną usunięte.',
      )
    )
      return;
    clearTimeout(timer.current);
    pending.current = null;
    removeWorkbook(task.id);
    setSaveFailed(false);
    setSheets(null);
    setVersion((v) => v + 1);
  };

  const setPart = (number: string, answer: PartAnswer) => {
    const next = { parts: { ...answers.parts, [number]: answer } };
    setAnswers(next);
    saveAnswers(task.id, next);
  };

  const passed = task.parts.filter((part) => answers.parts[part.number]?.passed);
  const points = passed.reduce((sum, part) => sum + part.points, 0);
  const getSelection = useCallback(() => workbook.current?.getSelectionValues() ?? null, []);

  return (
    <div className="page page--excel">
      <nav aria-label="Okruszki" className="breadcrumbs">
        <Link to="/zadania/excel">Zadania z Excela</Link> <span aria-hidden="true">/</span>{' '}
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

      <header className="xl-header">
        <div>
          <p className="task-card__meta">
            Zadanie {task.number} · arkusz kalkulacyjny · {totalPoints(task)} pkt
          </p>
          <h1>{task.title}</h1>
        </div>
        <p className="xl-progress" role="status">
          Zaliczone: {passed.length}/{task.parts.length} podpunktów · {points}/{totalPoints(task)}{' '}
          pkt
        </p>
      </header>

      <div className="xl-intro">
        <div className="task-summary">
          {task.summary.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
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
          <button type="button" className="button button--ghost" onClick={resetData}>
            Przywróć dane z plików
          </button>
        </div>
        {showSheet && session && (
          <PdfViewer
            files={session.sheets}
            title={`Arkusz ${session.label} ${session.year}`}
            initialPart={sheetLocation(task.id)?.part}
            initialPage={sheetLocation(task.id)?.page}
          />
        )}
        <details className="data-files">
          <summary>Pliki z danymi ({task.files.length})</summary>
          <FileList files={task.files.map((f) => f.path)} preview />
        </details>
        <details className="xl-cheatsheet">
          <summary>Jak pracować w arkuszu</summary>
          <ul>
            <li>
              Dane są już wczytane – każdy plik w osobnej karcie (na dole arkusza). Zmiany zapisują
              się w przeglądarce.
            </li>
            <li>
              Formuły możesz pisać po polsku, np. <code>=LICZ.JEŻELI(B2:B154;"&gt;100")</code> – po
              zatwierdzeniu zamienią się na angielskie nazwy (<code>COUNTIF</code>) i przecinki.
            </li>
            <li>
              Odpowiedź wpisz w pole albo zaznacz komórki w arkuszu i kliknij{' '}
              <strong>Wstaw z zaznaczenia</strong>. Przy zestawieniu zaznacz całą tabelę – podpisy
              wierszy i kolumn mogą być w zaznaczeniu.
            </li>
            <li>Wykresów nie sprawdzamy – zrób je w Excelu lub LibreOffice Calc.</li>
          </ul>
          <p className="muted">Polskie nazwy funkcji rozpoznawane przez arkusz:</p>
          <p className="xl-functions">
            {Object.entries(POLISH_FUNCTIONS)
              .filter(([pl, en]) => pl !== en)
              .map(([pl, en]) => (
                <span key={pl}>
                  <code>{pl}</code> → {en}
                </span>
              ))}
          </p>
        </details>
      </div>

      <div className="xl-workspace">
        <section className="xl-sheet" aria-label="Arkusz kalkulacyjny">
          {saveFailed && (
            <p className="restriction-warning" role="status">
              Arkusz jest za duży, by zapamiętać go w przeglądarce – zmiany znikną po zamknięciu
              strony.
            </p>
          )}
          {loadError ? (
            <p className="hints__error" role="alert">
              {loadError}
            </p>
          ) : sheets ? (
            <div className="xl-sheet__frame">
              <Suspense fallback={<p className="muted">Ładowanie arkusza…</p>}>
                <SpreadsheetWorkbook
                  key={version}
                  ref={workbook}
                  sheets={sheets}
                  onChange={onSheetsChange}
                />
              </Suspense>
            </div>
          ) : (
            <p className="muted">Wczytywanie danych…</p>
          )}
        </section>

        <section className="xl-parts" aria-label="Odpowiedzi">
          {task.parts.map((part) => (
            <SpreadsheetPartCard
              key={part.number}
              part={part}
              answer={answers.parts[part.number] ?? {}}
              onChange={(answer) => setPart(part.number, answer)}
              getSelection={getSelection}
            />
          ))}
        </section>
      </div>
    </div>
  );
}
