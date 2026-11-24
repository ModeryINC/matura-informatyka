import type { SolutionStatus } from './search';

/** Czytelne nazwy statusów rozwiązania. */
export const STATUS_LABELS: Record<SolutionStatus, string> = {
  nowe: 'Nierozwiązane',
  rozpoczete: 'W trakcie',
  zaliczone: 'Zaliczone',
};
