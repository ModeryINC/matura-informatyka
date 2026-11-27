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
