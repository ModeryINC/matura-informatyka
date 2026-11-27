// @vitest-environment node
/**
 * Wyniki formuł w „Podstawach Excela” są wpisane ręcznie – tu liczymy każdą
 * formułę od nowa (polską formułę tłumaczymy na angielską i liczymy parserem
 * formuł arkusza) i porównujemy z wpisanym wynikiem.
 */
import { Parser } from '@fortune-sheet/formula-parser';
import { translateFormula } from '../lib/spreadsheet/formulaLocale';
import { EXCEL_BASICS, isFormula, type ExcelBasicsSheet, type ExcelCell } from './excelBasics';

/** Data `rrrr-mm-dd` jako numer seryjny Excela (dni od 1899-12-30). */
const serial = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return (Date.UTC(+match[1]!, +match[2]! - 1, +match[3]!) - Date.UTC(1899, 11, 30)) / 86_400_000;
};

function evaluator(sheet: ExcelBasicsSheet) {
  const parser = new Parser();
  // Parser testowy nie ma WYSZUKAJ.PIONOWO, a JEŻELI.BŁĄD nie łapie w nim dzielenia
  // przez zero – uzupełniamy je zgodnie z Excelem.
  const isError = (v: unknown) =>
    typeof v === 'string' && /^#?(DIV\/0|N\/A|VALUE|NAME|REF|NUM|ERROR)/.test(v);
  parser.setFunction('IFERROR', ([result, fallback]: unknown[]) =>
    isError(result) ? fallback : result,
  );
  parser.setFunction('VLOOKUP', ([needle, table, column]: unknown[]) => {
    const row = (table as unknown[][]).find((r) => r[0] === needle);
    return row ? row[(column as number) - 1] : '#N/A';
  });
  const cache = new Map<string, unknown>();
  const value = (row: number, column: number): unknown => {
    const cell: ExcelCell | undefined = sheet.rows[row]?.[column];
    if (cell === undefined || cell === null) return null;
    if (typeof cell === 'string') return serial(cell) ?? cell;
    if (!isFormula(cell)) return cell;
    const key = `${row}:${column}`;
    if (!cache.has(key)) cache.set(key, compute(cell.f));
    return cache.get(key);
  };
  const compute = (formula: string): unknown => {
    // Parser rozumie stałe logiczne tylko jako funkcje: FALSE().
    const english = translateFormula(formula)
      .slice(1)
      .replace(/\b(TRUE|FALSE)\b(?!\()/g, '$1()');
    const { result, error } = parser.parse(english);
    return error ?? result;
  };
  // Ostatni argument zdarzenia to funkcja zwracająca wartość (przed nią są opcje parsera).
  type Coord = { row: { index: number }; column: { index: number } };
  type Done = (value: unknown) => void;
  parser.on('callCellValue', (coord: Coord, ...rest: unknown[]) =>
    (rest.at(-1) as Done)(value(coord.row.index, coord.column.index)),
  );
  parser.on('callRangeValue', (start: Coord, end: Coord, ...rest: unknown[]) => {
    const rows = [];
    for (let r = start.row.index; r <= end.row.index; r += 1) {
      const row = [];
      for (let c = start.column.index; c <= end.column.index; c += 1) row.push(value(r, c));
      rows.push(row);
    }
    (rest.at(-1) as Done)(rows);
  });
  return value;
}

const cases = EXCEL_BASICS.flatMap((section) =>
  section.sheets.flatMap((sheet, s) =>
    sheet.rows.flatMap((row, r) =>
      row.flatMap((cell, c) =>
        isFormula(cell)
          ? [
              [
                `${section.id}[${s}] ${String.fromCharCode(65 + c)}${r + 1} ${cell.f}`,
                sheet,
                r,
                c,
                cell.v,
              ] as const,
            ]
          : [],
      ),
    ),
  ),
);

test.each(cases)('%s', (_, sheet, row, column, expected) => {
  const actual = evaluator(sheet)(row, column);
  if (typeof expected === 'number') expect(actual).toBeCloseTo(expected, 9);
  else expect(actual).toBe(expected);
});

test('komórka w pasku formuły na start zawiera formułę', () => {
  for (const section of EXCEL_BASICS) {
    for (const sheet of section.sheets) {
      if (!sheet.focus) continue;
      const column = sheet.focus.charCodeAt(0) - 65;
      const row = Number(sheet.focus.slice(1)) - 1;
      expect(isFormula(sheet.rows[row]?.[column] ?? null), `${section.id} ${sheet.focus}`).toBe(
        true,
      );
    }
  }
});
