import type { SubmissionResult } from '../types';
import type { SolutionStatus } from './search';

/**
 * Lokalny zapis rozwiązań w `localStorage`.
 *
 * Strona nie ma serwera, więc kod i wyniki zostają wyłącznie w przeglądarce
 * użytkownika. Każde wywołanie jest zabezpieczone `try/catch`, bo dostęp do
 * pamięci może być zablokowany (tryb prywatny, polityka przeglądarki).
 */

const PREFIX = 'matura-inf:solution:';
const EVENT = 'matura-inf:solution-change';

export interface StoredSolution {
  code: string;
  /** Czy ostatnie sprawdzenie zakończyło się sukcesem. */
  passed: boolean;
  /** Czy rozwiązanie było kiedykolwiek zaliczone. */
  everPassed: boolean;
  lastResult?: SubmissionResult;
  updatedAt: string;
}

const key = (taskId: string) => `${PREFIX}${taskId}`;

export function loadSolution(taskId: string): StoredSolution | null {
  try {
    const raw = localStorage.getItem(key(taskId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredSolution>;
    if (typeof parsed.code !== 'string') return null;
    return {
      code: parsed.code,
      passed: parsed.passed === true,
      everPassed: parsed.everPassed === true,
      lastResult: parsed.lastResult,
      updatedAt: parsed.updatedAt ?? new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveSolution(
  taskId: string,
  update: Pick<StoredSolution, 'code'> & Partial<Pick<StoredSolution, 'lastResult'>>,
): StoredSolution {
  const previous = loadSolution(taskId);
  const lastResult = update.lastResult ?? previous?.lastResult;
  const passed = update.lastResult ? update.lastResult.passed : (previous?.passed ?? false);
  const solution: StoredSolution = {
    code: update.code,
    passed,
    everPassed: (previous?.everPassed ?? false) || passed,
    lastResult,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(key(taskId), JSON.stringify(solution));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: taskId }));
  } catch {
    // Brak dostępu do pamięci – rozwiązanie działa, ale nie zostanie zapamiętane.
  }
  return solution;
}

export function removeSolution(taskId: string): void {
  try {
    localStorage.removeItem(key(taskId));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: taskId }));
  } catch {
    // ignorujemy – patrz komentarz w saveSolution
  }
}

/** Status zadania na potrzeby listy i filtrów. */
export function solutionStatus(taskId: string): SolutionStatus {
  const solution = loadSolution(taskId);
  if (!solution) return 'nowe';
  return solution.everPassed ? 'zaliczone' : 'rozpoczete';
}

/** Subskrypcja zmian rozwiązań (także z innych kart przeglądarki). */
export function subscribeSolutions(callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key.startsWith(PREFIX)) callback();
  };
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', onStorage);
  };
}
