import { useState } from 'react';
import {
  fieldMatches,
  fitSelection,
  listMatches,
  tableMatches,
  type ListCheck,
} from '../lib/spreadsheet/answers';
import { plural } from '../lib/plural';
import type { PartAnswer } from '../lib/spreadsheet/storage';
import type { SpreadsheetPart } from '../types';
import { LuCheck, LuCircleCheck, LuClipboardPaste, LuPartyPopper } from 'react-icons/lu';

interface SpreadsheetPartCardProps {
  part: SpreadsheetPart;
  answer: PartAnswer;
  onChange: (answer: PartAnswer) => void;
  /** Wartości zaznaczone w arkuszu (`null` – arkusz niegotowy albo brak zaznaczenia). */
  getSelection: () => string[][] | null;
  /** Napis na przycisku wstawiania (np. „Wstaw z wyniku” w zadaniach z SQL). */
  insertLabel?: string;
  /** Komunikat, gdy nie ma czego wstawić. */
  emptySelectionMessage?: string;
}

type Feedback = {
  fields?: boolean[];
  table?: boolean[][];
  list?: ListCheck;
  passed: boolean;
} | null;

/** Ile wierszy listy pokazujemy w podglądzie odpowiedzi. */
const LIST_PREVIEW = 8;

/** Jeden podpunkt zadania: polecenie, pola na odpowiedź i sprawdzenie. */
export function SpreadsheetPartCard({
  part,
  answer,
  onChange,
  getSelection,
  insertLabel = 'Wstaw z zaznaczenia',
  emptySelectionMessage = 'Najpierw zaznacz komórki w arkuszu.',
}: SpreadsheetPartCardProps) {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [focused, setFocused] = useState(0);

  const fields = part.fields?.map((_, i) => answer.fields?.[i] ?? '') ?? [];
  const table =
    part.table?.rows.map((_, r) =>
      part.table!.columns.map((_, c) => answer.table?.[r]?.[c] ?? ''),
    ) ?? [];
  const list = answer.list ?? [];

  const update = (next: Partial<PartAnswer>) => {
    // Zmiana odpowiedzi ukrywa oznaczenia z poprzedniego sprawdzenia
    // (zaliczenie podpunktu zostaje – jak przy zadaniach w Pythonie).
    setFeedback(null);
    onChange({ ...answer, ...next });
  };

  const setField = (i: number, value: string) =>
    update({ fields: fields.map((v, j) => (j === i ? value : v)) });

  const setCell = (r: number, c: number, value: string) =>
    update({ table: table.map((row, i) => row.map((v, j) => (i === r && j === c ? value : v))) });

  /** Wstawia zaznaczenie (wynik zapytania) jako listę wierszy. */
  const insertList = () => {
    const selection = getSelection();
    if (!part.list || !selection || selection.length === 0) {
      setMessage(emptySelectionMessage);
      return;
    }
    // Zaznaczenie w arkuszu może zaczynać się od wiersza z nagłówkami kolumn.
    const withoutHeader = selection.slice(1);
    const rows =
      !listMatches(selection, part.list).passed && listMatches(withoutHeader, part.list).passed
        ? withoutHeader
        : selection;
    update({ list: rows });
    setMessage(null);
  };

  const insertSelection = () => {
    if (!part.fields && !part.table) {
      insertList();
      return;
    }
    const selection = getSelection();
    if (!selection || selection.length === 0) {
      setMessage(emptySelectionMessage);
      return;
    }
    if (part.table) {
      const fitted = fitSelection(selection, part.table);
      if (!fitted) {
        const { rows, columns } = part.table;
        setMessage(
          `Zaznacz zakres ${rows.length} × ${columns.length} z wartościami zestawienia (może zawierać podpisy wierszy i kolumn).`,
        );
        return;
      }
      update({ table: fitted });
    } else {
      const values = selection.flat().filter((v) => v.trim() !== '');
      if (values.length === fields.length) update({ fields: values });
      else if (values.length === 1) setField(focused, values[0]!);
      else {
        setMessage(
          `Zaznacz jedną komórkę (trafi do aktywnego pola) albo ${fields.length} komórki z kolejnymi odpowiedziami.`,
        );
        return;
      }
    }
    setMessage(null);
  };

  const check = () => {
    const fieldResults = part.fields?.map((field, i) => fieldMatches(fields[i] ?? '', field));
    const tableResults = part.table ? tableMatches(table, part.table) : undefined;
    const listResult = part.list ? listMatches(list, part.list) : undefined;
    const cells = [...(fieldResults ?? []), ...(tableResults?.flat() ?? [])];
    const passed = cells.every(Boolean) && (listResult?.passed ?? true);
    setFeedback({ fields: fieldResults, table: tableResults, list: listResult, passed });
    const problems: string[] = [];
    const wrong = cells.filter((ok) => !ok).length;
    if (wrong > 0) problems.push(`Niepoprawnych odpowiedzi: ${wrong}.`);
    if (listResult && part.list && !listResult.passed) {
      const expected = part.list.expected.length;
      problems.push(
        listResult.rows === 0
          ? 'Lista jest pusta – wstaw wynik zapytania.'
          : `Lista: zgadza się ${listResult.matched} z ${expected} oczekiwanych wierszy` +
              (listResult.rows !== expected ? `, a lista ma ${listResult.rows}.` : '.'),
      );
    }
    setMessage(passed ? null : problems.join(' '));
    onChange({
      ...answer,
      fields: part.fields ? fields : undefined,
      table: part.table ? table : undefined,
      list: part.list ? list : undefined,
      passed: answer.passed === true || passed,
    });
  };

  const mark = (ok: boolean | undefined) =>
    ok === undefined ? '' : ok ? ' xl-input--ok' : ' xl-input--wrong';

  const headingId = `podpunkt-${part.number}`;
  // Podpunkt z samym wykresem albo zapytaniem na kartce nie ma odpowiedzi do sprawdzenia.
  const checkable =
    part.fields !== undefined || part.table !== undefined || part.list !== undefined;
  return (
    <section
      className={`xl-part${answer.passed ? ' xl-part--passed' : ''}`}
      aria-labelledby={headingId}
    >
      <header className="xl-part__header">
        <h3 id={headingId}>Zadanie {part.number}</h3>
        <span className="muted">{part.points} pkt</span>
        {answer.passed && (
          <span className="xl-part__badge">
            <LuCircleCheck aria-hidden className="icon" /> Zaliczone
          </span>
        )}
      </header>
      <p>{part.prompt}</p>
      {part.chart && (
        <p className="xl-part__chart">
          <strong>Wykres:</strong> {part.chart} Wykresu nie sprawdzamy automatycznie – zrób go w
          Excelu lub LibreOffice.
        </p>
      )}

      {part.fields && (
        <div className="xl-fields">
          {part.fields.map((field, i) => (
            <label key={i} className="xl-field">
              <span>{field.label}</span>
              <input
                className={`input${mark(feedback?.fields?.[i])}`}
                value={fields[i]}
                onChange={(event) => setField(i, event.target.value)}
                onFocus={() => setFocused(i)}
                aria-invalid={feedback?.fields?.[i] === false || undefined}
              />
            </label>
          ))}
        </div>
      )}

      {part.table && (
        <div className="xl-table-wrap">
          <table className="xl-table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="visually-hidden">Wiersz</span>
                </th>
                {part.table.columns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {part.table.rows.map((row, r) => (
                <tr key={row}>
                  <th scope="row">{row}</th>
                  {part.table!.columns.map((column, c) => (
                    <td key={column}>
                      <input
                        className={`input xl-cell${mark(feedback?.table?.[r]?.[c])}`}
                        value={table[r]?.[c] ?? ''}
                        onChange={(event) => setCell(r, c, event.target.value)}
                        aria-label={`${row} – ${column}`}
                        aria-invalid={feedback?.table?.[r]?.[c] === false || undefined}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {part.list && (
        <div className="xl-list">
          <p className="muted">
            Lista ({part.list.columns.join(', ')}) – kolejność wierszy i kolumn nie ma znaczenia,
            dodatkowe kolumny też nie.{' '}
            {list.length > 0
              ? `Wstawiono ${list.length} ${plural(list.length, 'wiersz', 'wiersze', 'wierszy')}.`
              : 'Nic jeszcze nie wstawiono.'}
          </p>
          {list.length > 0 && (
            <div className="xl-table-wrap">
              <table
                className={`xl-table xl-list__table${
                  feedback?.list
                    ? feedback.list.passed
                      ? ' xl-input--ok'
                      : ' xl-input--wrong'
                    : ''
                }`}
              >
                <tbody>
                  {list.slice(0, LIST_PREVIEW).map((row, r) => (
                    <tr key={r}>
                      {row.map((value, c) => (
                        <td key={c}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {list.length > LIST_PREVIEW && (
                <p className="muted">… i {list.length - LIST_PREVIEW} więcej.</p>
              )}
            </div>
          )}
        </div>
      )}

      {part.query && (
        <details className="xl-part__query">
          <summary>Pokaż przykładowe rozwiązanie z klucza</summary>
          <p className="muted">
            Tabel z tego podpunktu nie ma w plikach – zapytanie pisze się na kartce. Nie sprawdzamy
            go automatycznie.
          </p>
          <pre>
            <code>{part.query}</code>
          </pre>
        </details>
      )}

      {checkable && (
        <div className="xl-part__actions">
          <button type="button" className="button button--small" onClick={insertSelection}>
            <LuClipboardPaste aria-hidden className="icon" /> {insertLabel}
            {part.list && (part.fields || part.table) ? ' do pól' : ''}
          </button>
          {part.list && (part.fields || part.table) && (
            <button type="button" className="button button--small" onClick={insertList}>
              <LuClipboardPaste aria-hidden className="icon" /> {insertLabel} do listy
            </button>
          )}
          <button type="button" className="button button--small button--primary" onClick={check}>
            <LuCheck aria-hidden className="icon" /> Sprawdź
          </button>
        </div>
      )}
      <div aria-live="polite">
        {message && <p className="xl-part__message">{message}</p>}
        {feedback?.passed && (
          <p className="xl-part__success">
            <LuPartyPopper aria-hidden className="icon" /> Wszystko się zgadza!
          </p>
        )}
      </div>
    </section>
  );
}
