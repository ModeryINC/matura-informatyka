import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { LuDatabase, LuPlay, LuRotateCcw, LuTable } from 'react-icons/lu';
import { ActionSheet } from '../components/ActionSheet';
import { CodeEditor } from '../components/CodeEditor';
import { MOBILE_NAV_QUERY } from '../components/Layout';
import { FileList } from '../components/FileList';
import { PdfViewer } from '../components/PdfViewer';
import { SidePanel } from '../components/SidePanel';
import { SpreadsheetPartCard } from '../components/SpreadsheetPartCard';
import { SqlResults } from '../components/SqlResults';
import { sessionsById, sheetLocation } from '../data';
import { checkableSqlParts, sqlTasksById, sqlTotalPoints } from '../data/sql';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { plural } from '../lib/plural';
import { SqlClient } from '../lib/sql/client';
import { formatValue, type QueryOutcome } from '../lib/sql/engine';
import type { TableInfo } from '../lib/sql/protocol';
import {
  loadQuery,
  loadSqlAnswers,
  saveQuery,
  saveSqlAnswers,
  type PartAnswer,
  type StoredSqlAnswers,
} from '../lib/sql/storage';
import type { SqlTask } from '../types';
import { NotFoundPage } from './NotFoundPage';

const TYPE_LABELS: Record<TableInfo['types'][number], string> = {
  INTEGER: 'liczba całkowita',
  REAL: 'liczba',
  DATE: 'data',
  DATETIME: 'data i godzina',
  TIME: 'godzina',
  TEXT: 'tekst',
};

export function SqlTaskPage() {
  const { taskId = '' } = useParams();
  const task = sqlTasksById.get(taskId);
  if (!task) return <NotFoundPage />;
  return <SqlWorkspace key={task.id} task={task} />;
}

const starterQuery = (task: SqlTask) =>
  `-- Zapytania SQL do zadania ${task.number}. Ctrl+Enter – uruchom.\nSELECT *\nFROM ${task.tables[0]!.name}\nLIMIT 10;\n`;

function SqlWorkspace({ task }: { task: SqlTask }) {
  const session = sessionsById.get(task.sessionId);
  useDocumentTitle(`SQL: zadanie ${task.number} – ${task.title}`);

  const client = useMemo(() => new SqlClient(task.tables), [task]);
  const [schema, setSchema] = useState<TableInfo[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState(() => loadQuery(task.id) ?? starterQuery(task));
  const [outcome, setOutcome] = useState<QueryOutcome | null>(null);
  const [running, setRunning] = useState(false);
  const [answers, setAnswers] = useState<StoredSqlAnswers>(() => loadSqlAnswers(task.id));
  const [showSheet, setShowSheet] = useState(false);
  // Na telefonie wynik zapytania wysuwa się od dołu.
  const mobile = useMediaQuery(MOBILE_NAV_QUERY);
  const [resultsOpen, setResultsOpen] = useState(false);
  const lastRows = useRef<string[][] | null>(null);

  useEffect(() => {
    let cancelled = false;
    client
      .init()
      .then((tables) => !cancelled && setSchema(tables))
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : String(error));
      });
    return () => {
      cancelled = true;
      client.dispose();
    };
  }, [client]);

  const run = useCallback(async () => {
    if (mobile) setResultsOpen(true);
    setRunning(true);
    try {
      const result = await client.run(query);
      setOutcome(result);
      const last = result.results.at(-1);
      lastRows.current = last ? last.rows.map((row) => row.map(formatValue)) : null;
    } catch (error) {
      setOutcome({
        results: [],
        error: error instanceof Error ? error.message : String(error),
        changes: 0,
      });
      lastRows.current = null;
    } finally {
      setRunning(false);
    }
  }, [client, query, mobile]);

  const onQueryChange = (value: string) => {
    setQuery(value);
    saveQuery(task.id, value);
  };

  const reloadData = () => {
    if (
      !window.confirm(
        'Wczytać dane z plików od nowa? Zmiany wprowadzone poleceniami (INSERT, UPDATE, DELETE, CREATE) znikną. Twoje zapytania w edytorze zostaną.',
      )
    )
      return;
    client.reset();
    setOutcome(null);
    lastRows.current = null;
    void client.init().then(setSchema, () => undefined);
  };

  const setPart = (number: string, answer: PartAnswer) => {
    const next = { parts: { ...answers.parts, [number]: answer } };
    setAnswers(next);
    saveSqlAnswers(task.id, next);
  };

  const editorSchema = useMemo(
    () => Object.fromEntries((schema ?? []).map((t) => [t.name, t.columns])),
    [schema],
  );
  const getSelection = useCallback(() => lastRows.current, []);
  const passed = task.parts.filter((part) => answers.parts[part.number]?.passed);
  const points = passed.reduce((sum, part) => sum + part.points, 0);

  return (
    <div className="page page--excel page--detail">
      <nav aria-label="Okruszki" className="breadcrumbs">
        <Link to="/zadania/sql" viewTransition>
          Zadania z SQL
        </Link>{' '}
        <span aria-hidden="true">/</span>{' '}
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
            Zadanie {task.number} · bazy danych · {sqlTotalPoints(task)} pkt
          </p>
          <h1>{task.title}</h1>
        </div>
        <p className="xl-progress" role="status">
          Zaliczone: {passed.length}/{checkableSqlParts(task).length} podpunktów · {points}/
          {sqlTotalPoints(task)} pkt
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
          <button type="button" className="button button--ghost" onClick={reloadData}>
            <LuRotateCcw aria-hidden className="icon" /> Wczytaj dane od nowa
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
          <summary>Pliki z danymi ({task.tables.length})</summary>
          <FileList files={task.tables.map((t) => t.path)} preview />
        </details>
        <details className="xl-cheatsheet">
          <summary>Jak pisać zapytania</summary>
          <ul>
            <li>
              Każdy plik jest już tabelą bazy (SQLite) o nazwie pliku, np.{' '}
              <code>{task.tables[0]!.name}</code>. Typy pól (liczby, daty, tekst) są rozpoznane przy
              imporcie, daty mają postać <code>rrrr-mm-dd</code>.
            </li>
            <li>
              Uruchom zapytanie przyciskiem <strong>Uruchom</strong> albo <kbd>Ctrl</kbd>+
              <kbd>Enter</kbd>. Możesz wpisać kilka poleceń rozdzielonych średnikami – zobaczysz
              wynik każdego z nich.
            </li>
            <li>
              Przy podpunkcie kliknij <strong>Wstaw z wyniku</strong> – trafi tam wynik ostatniego
              zapytania – i <strong>Sprawdź</strong>. Liczby możesz też wpisać ręcznie.
            </li>
            <li>
              Działa też składnia z Accessa: <code>SELECT TOP 1</code>, <code>Year()</code>,{' '}
              <code>Month()</code>, <code>Day()</code>, <code>Left()</code>, <code>Mid()</code>,{' '}
              <code>Len()</code>, <code>IIf()</code>, <code>DateDiff("d", od, do)</code>, daty{' '}
              <code>#2020-05-01#</code>, łączenie tekstów <code>&amp;</code> i wzorce{' '}
              <code>LIKE "*elf*"</code>.
            </li>
            <li>
              Przydatne w SQLite: <code>julianday(do) - julianday(od)</code> (liczba dni),{' '}
              <code>strftime('%m', data)</code>, <code>date(data, '+5 years')</code>,{' '}
              <code>ROUND(AVG(x), 2)</code>, <code>WITH … AS (…)</code>. Nazwę pola ze spacją zapisz
              w nawiasach: <code>[nazwa uslugi]</code>.
            </li>
            <li>
              Polecenia <code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code> i{' '}
              <code>CREATE VIEW</code> też działają – <strong>Wczytaj dane od nowa</strong>{' '}
              przywraca dane z plików.
            </li>
          </ul>
        </details>
      </div>

      <div className="xl-workspace">
        <section className="sql-work" aria-label="Zapytania SQL">
          {loadError ? (
            <p className="hints__error" role="alert">
              {loadError}
            </p>
          ) : schema ? (
            <ul className="sql-schema" aria-label="Tabele w bazie">
              {schema.map((table) => (
                <li key={table.name} className="sql-schema__table">
                  <details>
                    <summary>
                      <LuDatabase aria-hidden className="icon" /> <code>{table.name}</code>{' '}
                      <span className="muted">
                        ({table.rows} {plural(table.rows, 'wiersz', 'wiersze', 'wierszy')})
                      </span>
                    </summary>
                    <ul className="sql-schema__columns">
                      {table.columns.map((column, i) => (
                        <li key={column} style={{ '--i': i } as React.CSSProperties}>
                          <code>{column}</code>{' '}
                          <span className="muted">{TYPE_LABELS[table.types[i]!]}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted" role="status">
              Wczytywanie bazy danych…
            </p>
          )}

          <CodeEditor
            key={schema ? 'z-tabelami' : 'bez-tabel'}
            value={query}
            onChange={onQueryChange}
            onSubmit={() => void run()}
            label="Zapytanie SQL"
            language="sql"
            schema={editorSchema}
          />
          <div className="sql-work__actions">
            <button
              type="button"
              className="button button--primary"
              onClick={() => void run()}
              disabled={running || loadError !== null}
            >
              <LuPlay aria-hidden className="icon" /> {running ? 'Wykonywanie…' : 'Uruchom'}
            </button>
            <span className="muted">
              <kbd>Ctrl</kbd>+<kbd>Enter</kbd>
            </span>
            {mobile && outcome && (
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setResultsOpen(true)}
                aria-haspopup="dialog"
              >
                <LuTable aria-hidden className="icon" /> Wynik
              </button>
            )}
          </div>
          {mobile ? (
            <ActionSheet
              open={resultsOpen}
              onClose={() => setResultsOpen(false)}
              label="Wynik zapytania"
            >
              <div aria-live="polite">
                {running && !outcome ? (
                  <p className="muted">Wykonywanie…</p>
                ) : (
                  outcome && <SqlResults outcome={outcome} />
                )}
              </div>
            </ActionSheet>
          ) : (
            <div aria-live="polite">{outcome && <SqlResults outcome={outcome} />}</div>
          )}
        </section>

        <SidePanel title="Odpowiedzi" badge={`${passed.length}/${checkableSqlParts(task).length}`}>
          <div className="xl-parts">
            {task.parts.map((part) => (
              <SpreadsheetPartCard
                key={part.number}
                part={part}
                answer={answers.parts[part.number] ?? {}}
                onChange={(answer) => setPart(part.number, answer)}
                getSelection={getSelection}
                insertLabel="Wstaw z wyniku"
                emptySelectionMessage="Najpierw uruchom zapytanie – wstawiany jest wynik ostatniego z nich."
              />
            ))}
          </div>
        </SidePanel>
      </div>
    </div>
  );
}
