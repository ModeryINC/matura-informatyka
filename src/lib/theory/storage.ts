/**
 * Lokalny zapis odpowiedzi w zadaniach testowych: wybrane P/F dla każdego zdania
 * i to, czy podpunkt został zaliczony. Błędy `localStorage` są ignorowane.
 */
export type Choice = 'P' | 'F' | null;

export interface TheoryPartAnswer {
  choices: Choice[];
  /** Wynik ostatniego sprawdzenia (`undefined` – jeszcze nie sprawdzano). */
  passed?: boolean;
}

export interface StoredTheoryAnswers {
  parts: Record<string, TheoryPartAnswer>;
}

const KEY = 'matura-inf:test:';

export function loadTheoryAnswers(taskId: string): StoredTheoryAnswers {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY + taskId) ?? 'null') as unknown;
    if (
      typeof stored === 'object' &&
      stored !== null &&
      typeof (stored as StoredTheoryAnswers).parts === 'object' &&
      (stored as StoredTheoryAnswers).parts !== null
    )
      return stored as StoredTheoryAnswers;
  } catch {
    // ignorujemy
  }
  return { parts: {} };
}

export function saveTheoryAnswers(taskId: string, answers: StoredTheoryAnswers): void {
  try {
    localStorage.setItem(KEY + taskId, JSON.stringify(answers));
  } catch {
    // ignorujemy
  }
}

/** Liczba zaliczonych podpunktów zadania (do listy i strony arkusza). */
export function passedTheoryParts(taskId: string): number {
  return Object.values(loadTheoryAnswers(taskId).parts).filter((part) => part.passed).length;
}

/** Usuwa zapisane odpowiedzi zadania testowego (przycisk „Wyczyść”). */
export function clearTheoryAnswers(taskId: string): void {
  try {
    localStorage.removeItem(KEY + taskId);
  } catch {
    // ignorujemy
  }
}

// --- Zadania otwarte ---------------------------------------------------------

export interface OpenPartAnswer {
  text: string;
  /** Czy rozwiązanie z klucza jest odsłonięte. */
  revealed?: boolean;
  /** Wynik sprawdzenia albo samooceny (`undefined` – jeszcze nie oceniono). */
  passed?: boolean;
}

export interface StoredOpenAnswers {
  parts: Record<string, OpenPartAnswer>;
}

const OPEN_KEY = 'matura-inf:otwarte:';

export function loadOpenAnswers(taskId: string): StoredOpenAnswers {
  try {
    const stored = JSON.parse(localStorage.getItem(OPEN_KEY + taskId) ?? 'null') as unknown;
    if (
      typeof stored === 'object' &&
      stored !== null &&
      typeof (stored as StoredOpenAnswers).parts === 'object' &&
      (stored as StoredOpenAnswers).parts !== null
    )
      return stored as StoredOpenAnswers;
  } catch {
    // ignorujemy
  }
  return { parts: {} };
}

export function saveOpenAnswers(taskId: string, answers: StoredOpenAnswers): void {
  try {
    localStorage.setItem(OPEN_KEY + taskId, JSON.stringify(answers));
  } catch {
    // ignorujemy
  }
}

export function clearOpenAnswers(taskId: string): void {
  try {
    localStorage.removeItem(OPEN_KEY + taskId);
  } catch {
    // ignorujemy
  }
}

export function passedOpenParts(taskId: string): number {
  return Object.values(loadOpenAnswers(taskId).parts).filter((part) => part.passed).length;
}

/** Porównanie krótkiej odpowiedzi z kluczem: bez wielkości liter, odstępów i z `−` jako `-`. */
export function normalizeShortAnswer(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '').replace(/[−–]/g, '-');
}
