/**
 * Import plików tekstowych z danymi do arkusza – tak jak „Dane → Z pliku tekstowego”
 * w Excelu: kolumny rozdzielone tabulatorem, liczby z przecinkiem dziesiętnym
 * stają się liczbami, daty – datami (numer seryjny + format), reszta tekstem.
 */
import type { Cell, CellWithRowAndCol, Sheet } from '@fortune-sheet/core';
import type { SpreadsheetFile } from '../../types';
import { isoToSerial, parseDate } from './answers';

export const DATE_FORMAT = 'yyyy-mm-dd';
const NUMERIC = /^-?\d+([.,]\d+)?$/;

/** Komórka arkusza dla tekstu z pliku. */
export function cellFromText(text: string): Cell {
  const value = text.trim();
  // Długie ciągi cyfr (np. numery) zostają tekstem, żeby nie straciły zer i precyzji.
  if (NUMERIC.test(value) && value.replace(/\D/g, '').length <= 15 && !/^-?0\d/.test(value)) {
    const number = Number(value.replace(',', '.'));
    return { v: number, m: String(number), ct: { fa: 'General', t: 'n' } };
  }
  const iso = /^\d{4}-\d{2}-\d{2}$|^\d{2}\.\d{2}\.\d{4}$/.test(value) ? parseDate(value) : null;
  if (iso) return { v: isoToSerial(iso), m: iso, ct: { fa: DATE_FORMAT, t: 'd' } };
  return { v: value, m: value, ct: { fa: '@', t: 's' } };
}

/** Wiersze pliku podzielone na kolumny (bez pustych linii na końcu). */
export function splitRows(content: string): string[][] {
  return content
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '')
    .map((line) => line.split('\t'));
}

/** Szerokość kolumny w pikselach na podstawie najdłuższego tekstu. */
const columnWidth = (length: number) => Math.min(260, Math.max(70, 12 + length * 8));

/** Karta arkusza z zawartością pliku. */
export function sheetFromText(file: SpreadsheetFile, content: string, order: number): Sheet {
  const rows = splitRows(content);
  if (file.headers) rows.unshift(file.headers);
  const celldata: CellWithRowAndCol[] = [];
  const longest: number[] = [];
  rows.forEach((row, r) =>
    row.forEach((text, c) => {
      const header = r === 0 && (file.headers !== undefined || file.hasHeader === true);
      const cell = header
        ? { v: text.trim(), m: text.trim(), ct: { fa: '@', t: 's' }, bl: 1 }
        : cellFromText(text);
      celldata.push({ r, c, v: cell });
      longest[c] = Math.max(longest[c] ?? 0, String(cell.m ?? '').length);
    }),
  );
  const columns = longest.length;
  return {
    name: file.sheet,
    order,
    status: order === 0 ? 1 : 0,
    celldata,
    row: Math.max(rows.length + 50, 100),
    column: Math.max(columns + 10, 26),
    config: {
      columnlen: Object.fromEntries(longest.map((length, c) => [String(c), columnWidth(length)])),
    },
  };
}
