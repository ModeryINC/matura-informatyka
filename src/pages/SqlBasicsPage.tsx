import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { LuPlay } from 'react-icons/lu';
import { BasicsLayout } from '../components/BasicsLayout';
import { CodeEditor } from '../components/CodeEditor';
import { FileList } from '../components/FileList';
import { SqlResults } from '../components/SqlResults';
import { SQL_BASICS, SQL_BASICS_TABLES, type SqlBasicsExample } from '../data/sqlBasics';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { SqlClient } from '../lib/sql/client';
import type { QueryOutcome } from '../lib/sql/engine';
import type { TableInfo } from '../lib/sql/protocol';

/** Podstrona z podstawami SQL: zapytania do uruchomienia na małej przykładowej bazie. */
export function SqlBasicsPage({ client: given }: { client?: SqlClient }) {
  useDocumentTitle('Podstawy SQL');
  const client = useMemo(() => given ?? new SqlClient(SQL_BASICS_TABLES), [given]);
  const [schema, setSchema] = useState<TableInfo[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    client.init().then(
      (tables) => !cancelled && setSchema(tables),
      () => undefined,
    );
    return () => {
      cancelled = true;
      client.dispose();
    };
  }, [client]);

  const editorSchema = useMemo(
    () => Object.fromEntries((schema ?? []).map((t) => [t.name, t.columns])),
    [schema],
  );

  return (
    <BasicsLayout
      title="Podstawy SQL"
      lead={
        <p>
          Zapytania potrzebne w zadaniach z baz danych. Każde możesz zmienić i uruchomić (
          <kbd>Ctrl</kbd> + <kbd>Enter</kbd> w edytorze) na małej bazie szkoły – działa w
          przeglądarce (SQLite), tak jak w <Link to="/zadania/sql">zadaniach z SQL</Link>. Składnia
          z Accessa (<code>TOP</code>, <code>Year()</code>, <code>IIf()</code>, <code>&amp;</code>)
          też działa.
        </p>
      }
      before={
        <section className="basics-section" aria-labelledby="baza-tytul">
          <h2 id="baza-tytul">Przykładowa baza</h2>
          <p>
            Trzy tabele, jak w zadaniu maturalnym – każda powstała z pliku tekstowego (pierwszy
            wiersz to nazwy pól). Pliki możesz obejrzeć i pobrać, żeby poćwiczyć w Accessie.
          </p>
          <ul className="basics-tables">
            {(schema ?? []).map((table) => (
              <li key={table.name}>
                <code>{table.name}</code> ({table.rows}): {table.columns.join(', ')}
              </li>
            ))}
          </ul>
          <FileList files={SQL_BASICS_TABLES.map((t) => t.path)} preview />
        </section>
      }
      sections={SQL_BASICS}
      renderExamples={(section) =>
        section.examples.map((example, i) => (
          <SqlExample
            key={i}
            example={example}
            client={client}
            schema={editorSchema}
            label={`Zapytanie: ${section.title}${section.examples.length > 1 ? ` (${i + 1})` : ''}`}
          />
        ))
      }
    />
  );
}

interface SqlExampleProps {
  example: SqlBasicsExample;
  client: SqlClient;
  schema: Record<string, string[]>;
  label: string;
}

/** Zapytanie do zmiany i uruchomienia; „Przywróć” wraca do wersji z lekcji. */
function SqlExample({ example, client, schema, label }: SqlExampleProps) {
  const [sql, setSql] = useState(example.sql);
  const [outcome, setOutcome] = useState<QueryOutcome | null>(null);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    try {
      setOutcome(await client.run(sql));
    } catch (error) {
      setOutcome({
        results: [],
        error: error instanceof Error ? error.message : String(error),
        changes: 0,
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="example">
      <CodeEditor
        key={Object.keys(schema).length}
        value={sql}
        onChange={setSql}
        onSubmit={() => void run()}
        label={label}
        language="sql"
        schema={schema}
        autoHeight
      />
      <div className="example__actions">
        <button
          type="button"
          className="button button--small"
          onClick={() => void run()}
          disabled={running}
        >
          {!running && <LuPlay aria-hidden className="icon" />}
          {running ? 'Wykonywanie…' : 'Uruchom'}
        </button>
        {sql !== example.sql && (
          <button
            type="button"
            className="button button--ghost button--small"
            onClick={() => {
              setSql(example.sql);
              setOutcome(null);
            }}
          >
            Przywróć
          </button>
        )}
      </div>
      <div aria-live="polite">{outcome && <SqlResults outcome={outcome} />}</div>
    </div>
  );
}
