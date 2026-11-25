/**
 * Lokalny zapis postępów w zadaniach z arkusza kalkulacyjnego: odpowiedzi
 * (małe, osobny klucz) i zawartość arkusza z formułami ucznia (duża, osobny klucz).
 * Błędy dostępu do `localStorage` są ignorowane – strona działa, tylko nie pamięta.
 */
import type { Sheet } from '@fortune-sheet/core';

const ANSWERS = 'matura-inf:excel:';
const WORKBOOK = 'matura-inf:excel-arkusz:';

/** Odpowiedź do podpunktu: lista pól albo zestawienie (wiersze × kolumny). */
export interface PartAnswer {
  fields?: string[];
  table?: string[][];
  /** Wynik ostatniego sprawdzenia. */
  passed?: boolean;
}

export interface StoredSpreadsheetAnswers {
  parts: Record<string, PartAnswer>;
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadAnswers(taskId: string): StoredSpreadsheetAnswers {
  const stored = read<StoredSpreadsheetAnswers>(ANSWERS + taskId);
  return stored && typeof stored.parts === 'object' && stored.parts !== null
    ? stored
    : { parts: {} };
}

export function saveAnswers(taskId: string, answers: StoredSpreadsheetAnswers): void {
  write(ANSWERS + taskId, answers);
}

/** Liczba zaliczonych podpunktów (do listy zadań). */
export function passedParts(taskId: string): number {
  return Object.values(loadAnswers(taskId).parts).filter((part) => part.passed).length;
}

export function loadWorkbook(taskId: string): Sheet[] | null {
  const sheets = read<Sheet[]>(WORKBOOK + taskId);
  return Array.isArray(sheets) && sheets.length > 0 ? sheets : null;
}

/** Zapisuje arkusz; zwraca `false`, gdy się nie zmieścił w pamięci przeglądarki. */
export function saveWorkbook(taskId: string, sheets: Sheet[]): boolean {
  return write(WORKBOOK + taskId, sheets);
}

export function removeWorkbook(taskId: string): void {
  try {
    localStorage.removeItem(WORKBOOK + taskId);
  } catch {
    // ignorujemy
  }
}
