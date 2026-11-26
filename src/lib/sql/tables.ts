/**
 * Wczytywanie plików tekstowych z matury jako tabel bazy danych – tak jak import
 * do Accessa: pierwszy wiersz to nazwy pól (albo nazwy podane w opisie zadania),
 * typ pola wynika z zawartości kolumny, daty są zapisywane jako `rrrr-mm-dd`.
 */
import { parseDate } from '../spreadsheet/answers';
import type { SqlTable } from '../../types';

export type SqlType = 'INTEGER' | 'REAL' | 'DATE' | 'DATETIME' | 'TIME' | 'TEXT';
export type SqlValue = string | number | null;

export interface TableData {
  name: string;
  columns: string[];
  types: SqlType[];
  rows: SqlValue[][];
  /** Wiersze z większą liczbą pól niż nagłówek (zły separator albo uszkodzony plik). */
  irregularRows: number;
}

const INTEGER = /^-?(0|[1-9]\d{0,14})$/;
const REAL = /^-?\d+[.,]\d+$/;
const DATE = /^\d{4}-\d{1,2}-\d{1,2}$|^\d{1,2}[.-]\d{1,2}[.-]\d{4}$/;
const DATETIME =
  /^(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[.-]\d{1,2}[.-]\d{4})[ T](\d{1,2}:\d{2}(?::\d{2})?)$/;
const TIME = /^\d{1,2}:\d{2}(:\d{2})?$/;

/**
 * Tekst pliku z danymi: UTF-8 (także z BOM), UTF-16 z BOM (np. pliki zapisane
 * w Notatniku jako „Unicode”) albo Windows-1250 (starsze pliki CKE).
 */
export function decodeText(bytes: Uint8Array): string {
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le').decode(bytes);
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder('utf-16be').decode(bytes);
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder('windows-1250').decode(bytes);
  }
}

/** Separator kolumn: podany w opisie albo wykryty (tabulator, średnik, spacja). */
export function detectSeparator(firstLine: string): string {
  if (firstLine.includes('\t')) return '\t';
  if (firstLine.includes(';')) return ';';
  return ' ';
}

function columnType(values: string[]): SqlType {
  const filled = values.filter((v) => v !== '');
  if (filled.length === 0) return 'TEXT';
  if (filled.every((v) => INTEGER.test(v))) return 'INTEGER';
  if (filled.every((v) => INTEGER.test(v) || REAL.test(v))) return 'REAL';
  if (filled.every((v) => DATE.test(v) && parseDate(v) !== null)) return 'DATE';
  if (filled.every((v) => DATETIME.test(v) && parseDate(DATETIME.exec(v)![1]!) !== null))
    return 'DATETIME';
  if (filled.every((v) => TIME.test(v))) return 'TIME';
  return 'TEXT';
}

function convert(value: string, type: SqlType): SqlValue {
  if (value === '') return null;
  switch (type) {
    case 'INTEGER':
      return Number(value);
    case 'REAL':
      return Number(value.replace(',', '.'));
    case 'DATE':
      return parseDate(value);
    case 'DATETIME': {
      const [, day, time] = DATETIME.exec(value)!;
      const [h, m, s] = time!.split(':');
      return `${parseDate(day!)} ${h!.padStart(2, '0')}:${m}:${s ?? '00'}`;
    }
    case 'TIME': {
      const [h, m, s] = value.split(':');
      return `${h!.padStart(2, '0')}:${m}:${s ?? '00'}`;
    }
    default:
      return value;
  }
}

/** Zawartość pliku jako tabela (nazwy pól, typy i wiersze z wartościami). */
export function parseTable(spec: SqlTable, content: string): TableData {
  const lines = content
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '');
  const separator = spec.separator ?? detectSeparator(lines[0] ?? '');
  const split = (line: string) =>
    (separator === ' ' ? line.trim().split(/ +/) : line.split(separator)).map((v) => v.trim());
  const cells = lines.map(split);
  const header = spec.headers ?? cells.shift() ?? [];
  // Nadmiarowy separator na końcu wiersza nagłówkowego daje pustą nazwę kolumny.
  const columns = header.slice(0, header.length - [...header].reverse().findIndex((h) => h !== ''));
  const width = columns.length;
  const raw = cells.map((row) => Array.from({ length: width }, (_, c) => row[c] ?? ''));
  const types = columns.map((_, c) => columnType(raw.map((row) => row[c]!)));
  return {
    name: spec.name,
    columns,
    types,
    rows: raw.map((row) => row.map((value, c) => convert(value, types[c]!))),
    irregularRows: cells.filter((row) => row.slice(width).some((value) => value !== '')).length,
  };
}
