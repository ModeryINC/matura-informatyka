/**
 * Eksport arkusza do pliku .xlsx i import z takiego pliku (biblioteka ExcelJS,
 * licencja MIT). Moduł jest ładowany dopiero po kliknięciu przycisku.
 *
 * Przenosimy to, co potrzebne na maturze: wartości, formuły (z ostatnim wynikiem),
 * daty i godziny, formaty liczb, pogrubienie i szerokości kolumn. Wykresy, scalenia
 * i pozostałe style pomijamy.
 */
import { update, type Cell, type CellWithRowAndCol, type Sheet } from '@fortune-sheet/core';
import type * as ExcelJSTypes from 'exceljs';
import { serialToIso } from './answers';
import { DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT } from './importData';

type ExcelJS = typeof ExcelJSTypes;

async function loadExcelJS(): Promise<ExcelJS> {
  const module = (await import('exceljs')) as ExcelJS & { default?: ExcelJS };
  return module.default ?? module;
}

/** Numer seryjny daty (system 1900, jak w Excelu i w arkuszu na stronie). */
const EPOCH_OFFSET = 25_569;
const DAY_MS = 86_400_000;
export const dateToSerial = (date: Date) => date.getTime() / DAY_MS + EPOCH_OFFSET;

/**
 * Funkcje dodane w nowszych Excelach zapisuje się w pliku z przedrostkiem –
 * bez niego Excel pokazuje #NAZWA?.
 */
const XLWS = ['FILTER', 'SORT'];
const XLFN = [
  'UNIQUE',
  'SORTBY',
  'SEQUENCE',
  'XLOOKUP',
  'XMATCH',
  'IFS',
  'SWITCH',
  'CONCAT',
  'TEXTJOIN',
  'MAXIFS',
  'MINIFS',
  'DAYS',
  'ISOWEEKNUM',
  'IFNA',
];
const NAME_BEFORE_PAREN = /(?<![\w.])([A-Z][A-Z0-9.]*)(?=\s*\()/gi;

/** Formuła z arkusza (`=…`) zapisana tak, jak przechowuje ją plik .xlsx (bez `=`). */
export function toFileFormula(formula: string): string {
  return formula
    .replace(/^=/, '')
    .split(/("(?:[^"]|"")*")/)
    .map((part, i) =>
      i % 2 === 1
        ? part
        : part.replace(NAME_BEFORE_PAREN, (name: string) => {
            const upper = name.toUpperCase();
            if (XLWS.includes(upper)) return `_xlfn._xlws.${name}`;
            if (XLFN.includes(upper)) return `_xlfn.${name}`;
            return name;
          }),
    )
    .join('');
}

/** Formuła z pliku .xlsx jako formuła arkusza (`=…`, bez przedrostków `_xlfn.`). */
export const fromFileFormula = (formula: string) =>
  `=${formula.replace(/^=/, '').replace(/_xlfn\.(_xlws\.)?/gi, '')}`;

/** Nazwa karty dopuszczalna w Excelu (do 31 znaków, bez `[]:*?/\`), unikalna. */
function sheetName(name: string, used: Set<string>): string {
  const base = (name.replace(/[[\]:*?/\\]/g, '_').slice(0, 31) || 'Arkusz').trim() || 'Arkusz';
  let candidate = base;
  for (let i = 2; used.has(candidate.toLowerCase()); i += 1) {
    candidate = `${base.slice(0, 31 - String(i).length - 1)} ${i}`;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

const isError = (value: unknown) =>
  typeof value === 'string' &&
  /^#(NULL!|DIV\/0!|VALUE!|REF!|NAME\?|NUM!|N\/A|SPILL!|CALC!)$/.test(value);

/** Wartość komórki arkusza w postaci dla ExcelJS. */
function excelValue(cell: Cell): ExcelJSTypes.CellValue {
  const value = cell.v;
  if (typeof cell.f === 'string' && cell.f.startsWith('=')) {
    const formula = toFileFormula(cell.f);
    if (value == null || value === '') return { formula } as ExcelJSTypes.CellFormulaValue;
    const result = isError(value)
      ? { error: value as ExcelJSTypes.CellErrorValue['error'] }
      : (value as number | string | boolean);
    return { formula, result } as ExcelJSTypes.CellFormulaValue;
  }
  if (value == null) return null;
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (isError(value)) return { error: value as ExcelJSTypes.CellErrorValue['error'] };
  return String(value);
}

/** Zawartość arkusza jako plik .xlsx. */
export async function sheetsToXlsx(sheets: Sheet[]): Promise<Blob> {
  const ExcelJS = await loadExcelJS();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Matura z informatyki';
  const used = new Set<string>();
  const ordered = [...sheets].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const sheet of ordered) {
    const worksheet = workbook.addWorksheet(sheetName(sheet.name, used));
    for (const { r, c, v: cell } of sheet.celldata ?? []) {
      if (cell == null) continue;
      const target = worksheet.getCell(r + 1, c + 1);
      target.value = excelValue(cell);
      const format = cell.ct?.fa;
      if (format && format !== 'General' && format !== '@') target.numFmt = format;
      if (cell.bl === 1) target.font = { bold: true };
    }
    for (const [column, px] of Object.entries(sheet.config?.columnlen ?? {})) {
      worksheet.getColumn(Number(column) + 1).width = Math.max(4, Math.round((px - 5) / 7));
    }
  }
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/** Data lub godzina jako komórka arkusza (te same formaty co przy imporcie z pliku .txt). */
function dateCell(serial: number): Cell {
  const day = Math.floor(serial + 1e-9);
  const seconds = Math.round((serial - day) * 86_400);
  const clock = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');
  if (day === 0) return { v: serial, m: clock, ct: { fa: TIME_FORMAT, t: 'd' } };
  const iso = serialToIso(day);
  if (seconds === 0) return { v: serial, m: iso, ct: { fa: DATE_FORMAT, t: 'd' } };
  return { v: serial, m: `${iso} ${clock.slice(0, 5)}`, ct: { fa: DATETIME_FORMAT, t: 'd' } };
}

function numberCell(value: number, format: string | undefined): Cell {
  if (!format || format === 'General') {
    return { v: value, m: String(value), ct: { fa: 'General', t: 'n' } };
  }
  let shown = String(value);
  try {
    shown = String(update(format, value));
  } catch {
    // Format nieznany arkuszowi – pokazujemy samą liczbę.
  }
  return { v: value, m: shown, ct: { fa: format, t: 'n' } };
}

const textCell = (text: string): Cell => ({ v: text, m: text, ct: { fa: '@', t: 's' } });

/** Wartość (lub wynik formuły) z ExcelJS jako komórka arkusza. */
function plainCell(value: unknown, format: string | undefined): Cell | null {
  if (value == null || value === '') return null;
  if (value instanceof Date) return dateCell(dateToSerial(value));
  if (typeof value === 'number') return numberCell(value, format);
  if (typeof value === 'boolean') return textCell(value ? 'TRUE' : 'FALSE');
  if (typeof value === 'string') return textCell(value);
  if (typeof value === 'object') {
    if ('error' in value) return textCell(String(value.error));
    if ('richText' in value && Array.isArray(value.richText)) {
      return textCell(value.richText.map((part: { text?: string }) => part.text ?? '').join(''));
    }
    if ('text' in value) return textCell(String(value.text));
  }
  return textCell(String(value));
}

function cellFromExcel(cell: ExcelJSTypes.Cell): Cell | null {
  const format = cell.numFmt || undefined;
  let result: Cell | null;
  if (cell.type === 6 /* ValueType.Formula */) {
    const formula = cell.formula;
    const computed = plainCell(cell.result, format);
    result = formula
      ? {
          ...(computed ?? { v: '', m: '', ct: { fa: 'General', t: 'n' } }),
          f: fromFileFormula(formula),
        }
      : computed;
  } else {
    result = plainCell(cell.value, format);
  }
  if (result && cell.font?.bold) result.bl = 1;
  return result;
}

/** Karty arkusza z pliku .xlsx. */
export async function xlsxToSheets(data: ArrayBuffer): Promise<Sheet[]> {
  const ExcelJS = await loadExcelJS();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(data);
  const sheets: Sheet[] = [];
  workbook.eachSheet((worksheet) => {
    const order = sheets.length;
    const id = `xlsx-${order}-${Date.now().toString(36)}`;
    const celldata: CellWithRowAndCol[] = [];
    const calcChain: { r: number; c: number; id: string }[] = [];
    let rows = 0;
    let columns = 0;
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      row.eachCell({ includeEmpty: false }, (cell, columnNumber) => {
        const value = cellFromExcel(cell);
        if (!value) return;
        const [r, c] = [rowNumber - 1, columnNumber - 1];
        celldata.push({ r, c, v: value });
        // Formuły muszą być na liście obliczeń, żeby przeliczały się po zmianie danych.
        if (value.f) calcChain.push({ r, c, id });
        rows = Math.max(rows, rowNumber);
        columns = Math.max(columns, columnNumber);
      });
    });
    const columnlen: Record<string, number> = {};
    for (let c = 1; c <= columns; c += 1) {
      const width = worksheet.getColumn(c).width;
      if (width) columnlen[String(c - 1)] = Math.round(width * 7 + 5);
    }
    sheets.push({
      id,
      name: worksheet.name,
      order,
      status: order === 0 ? 1 : 0,
      celldata,
      calcChain,
      row: Math.max(rows + 50, 100),
      column: Math.max(columns + 10, 26),
      config: { columnlen },
    });
  });
  if (sheets.length === 0) throw new Error('Plik nie zawiera żadnej karty.');
  return sheets;
}
