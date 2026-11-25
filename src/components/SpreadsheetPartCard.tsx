import { useState } from 'react';
import { fieldMatches, fitSelection, tableMatches } from '../lib/spreadsheet/answers';
import type { PartAnswer } from '../lib/spreadsheet/storage';
import type { SpreadsheetPart } from '../types';
import { LuCheck, LuCircleCheck, LuClipboardPaste, LuPartyPopper } from 'react-icons/lu';

interface SpreadsheetPartCardProps {
  part: SpreadsheetPart;
  answer: PartAnswer;
  onChange: (answer: PartAnswer) => void;
  /** Wartości zaznaczone w arkuszu (`null` – arkusz niegotowy albo brak zaznaczenia). */
  getSelection: () => string[][] | null;
}

type Feedback = { fields?: boolean[]; table?: boolean[][]; passed: boolean } | null;

/** Jeden podpunkt zadania: polecenie, pola na odpowiedź i sprawdzenie. */
export function SpreadsheetPartCard({
  part,
  answer,
  onChange,
  getSelection,
}: SpreadsheetPartCardProps) {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [focused, setFocused] = useState(0);

  const fields = part.fields?.map((_, i) => answer.fields?.[i] ?? '') ?? [];
  const table =
    part.table?.rows.map((_, r) =>
      part.table!.columns.map((_, c) => answer.table?.[r]?.[c] ?? ''),
    ) ?? [];

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

  const insertSelection = () => {
    const selection = getSelection();
    if (!selection || selection.length === 0) {
      setMessage('Najpierw zaznacz komórki w arkuszu.');
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
    const passed = [...(fieldResults ?? []), ...(tableResults?.flat() ?? [])].every(Boolean);
    setFeedback({ fields: fieldResults, table: tableResults, passed });
    const wrong = [...(fieldResults ?? []), ...(tableResults?.flat() ?? [])].filter(
      (ok) => !ok,
    ).length;
    setMessage(passed ? null : `Niepoprawnych odpowiedzi: ${wrong}.`);
    onChange({
      ...answer,
      fields: part.fields ? fields : undefined,
      table: part.table ? table : undefined,
      passed: answer.passed === true || passed,
    });
  };

  const mark = (ok: boolean | undefined) =>
    ok === undefined ? '' : ok ? ' xl-input--ok' : ' xl-input--wrong';

  const headingId = `podpunkt-${part.number}`;
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

      <div className="xl-part__actions">
        <button type="button" className="button button--small" onClick={insertSelection}>
          <LuClipboardPaste aria-hidden className="icon" /> Wstaw z zaznaczenia
        </button>
        <button type="button" className="button button--small button--primary" onClick={check}>
          <LuCheck aria-hidden className="icon" /> Sprawdź
        </button>
      </div>
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
