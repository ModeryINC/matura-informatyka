/**
 * Lokalny zapis postępów w zadaniach z baz danych: odpowiedzi do podpunktów
 * i treść edytora zapytań. Błędy dostępu do `localStorage` są ignorowane –
 * strona działa, tylko nie pamięta.
 */
import type { PartAnswer, StoredSpreadsheetAnswers } from '../spreadsheet/storage';

const ANSWERS = 'matura-inf:sql:';
const QUERY = 'matura-inf:sql-zapytanie:';

export type StoredSqlAnswers = StoredSpreadsheetAnswers;
export type { PartAnswer };

export function loadSqlAnswers(taskId: string): StoredSqlAnswers {
  try {
    const stored = JSON.parse(localStorage.getItem(ANSWERS + taskId) ?? 'null') as unknown;
    if (
      typeof stored === 'object' &&
      stored !== null &&
      typeof (stored as StoredSqlAnswers).parts === 'object' &&
      (stored as StoredSqlAnswers).parts !== null
    )
      return stored as StoredSqlAnswers;
  } catch {
    // ignorujemy
  }
  return { parts: {} };
}

export function saveSqlAnswers(taskId: string, answers: StoredSqlAnswers): void {
  try {
    localStorage.setItem(ANSWERS + taskId, JSON.stringify(answers));
  } catch {
    // ignorujemy
  }
}

/** Liczba zaliczonych podpunktów (do listy zadań). */
export function passedSqlParts(taskId: string): number {
  return Object.values(loadSqlAnswers(taskId).parts).filter((part) => part.passed).length;
}

export function loadQuery(taskId: string): string | null {
  try {
    return localStorage.getItem(QUERY + taskId);
  } catch {
    return null;
  }
}

export function saveQuery(taskId: string, query: string): void {
  try {
    localStorage.setItem(QUERY + taskId, query);
  } catch {
    // ignorujemy
  }
}
