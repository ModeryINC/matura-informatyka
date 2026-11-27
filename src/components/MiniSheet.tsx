import { useState } from 'react';
import { isFormula, type ExcelBasicsSheet, type ExcelCell } from '../data/excelBasics';

const NUMBER = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 4, useGrouping: false });
const column = (index: number) => String.fromCharCode(65 + index);

/** Wartość komórki tak, jak pokazałby ją polski Excel (przecinek dziesiętny). */
function display(cell: ExcelCell): string {
  const value = isFormula(cell) ? cell.v : cell;
  if (value === null) return '';
  return typeof value === 'number' ? NUMBER.format(value) : value;
}

/**
 * Mały arkusz do lekcji: litery kolumn, numery wierszy i pasek formuły.
 * Kliknięcie komórki z formułą (zielone tło) pokazuje ją w pasku formuły.
 */
export function MiniSheet({ sheet, label }: { sheet: ExcelBasicsSheet; label: string }) {
  const [selected, setSelected] = useState(sheet.focus ?? 'A1');
  const width = Math.max(...sheet.rows.map((row) => row.length));
  const selectedCell =
    sheet.rows[Number(selected.slice(1)) - 1]?.[selected.charCodeAt(0) - 65] ?? null;

  return (
    <figure className="mini-sheet" aria-label={label}>
      <div className="mini-sheet__formula" role="status">
        <span className="mini-sheet__address">{selected}</span>
        <span className="mini-sheet__fx" aria-hidden="true">
          fx
        </span>
        <code>{isFormula(selectedCell) ? selectedCell.f : display(selectedCell)}</code>
      </div>
      <div className="mini-sheet__scroll">
        <table>
          <thead>
            <tr>
              <td className="mini-sheet__corner" />
              {Array.from({ length: width }, (_, c) => (
                <th key={c} scope="col">
                  {column(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheet.rows.map((row, r) => (
              <tr key={r}>
                <th scope="row">{r + 1}</th>
                {Array.from({ length: width }, (_, c) => {
                  const cell = row[c] ?? null;
                  const address = `${column(c)}${r + 1}`;
                  const text = display(cell);
                  const numeric = typeof (isFormula(cell) ? cell.v : cell) === 'number';
                  const classes = [
                    numeric ? 'mini-sheet__num' : '',
                    isFormula(cell) ? 'mini-sheet__formula-cell' : '',
                    r === 0 ? 'mini-sheet__header' : '',
                    address === selected ? 'is-selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  return (
                    <td key={c} className={classes || undefined}>
                      {isFormula(cell) ? (
                        <button
                          type="button"
                          onClick={() => setSelected(address)}
                          aria-pressed={address === selected}
                          aria-label={`${address}: ${text} – formuła ${cell.f}`}
                        >
                          {text}
                        </button>
                      ) : (
                        text
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
