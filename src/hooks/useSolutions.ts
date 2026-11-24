import { useSyncExternalStore } from 'react';
import { solutionStatus, subscribeSolutions } from '../lib/storage';
import type { SolutionStatus } from '../lib/search';

type StatusLookup = (taskId: string) => SolutionStatus;

/**
 * Migawka (snapshot) statusów. Po każdej zmianie w zapisanych rozwiązaniach
 * (także w innej karcie) tworzymy nową funkcję-odczyt z własną pamięcią
 * podręczną – React widzi nową referencję i odświeża komponenty.
 */
const createLookup = (): StatusLookup => {
  const cache = new Map<string, SolutionStatus>();
  return (taskId) => {
    let status = cache.get(taskId);
    if (status === undefined) {
      status = solutionStatus(taskId);
      cache.set(taskId, status);
    }
    return status;
  };
};

let snapshot: StatusLookup = createLookup();

const subscribe = (callback: () => void) => {
  // Zmiany mogły nastąpić, gdy nikt nie nasłuchiwał – zaczynamy od świeżej migawki.
  snapshot = createLookup();
  return subscribeSolutions(() => {
    snapshot = createLookup();
    callback();
  });
};

const getSnapshot = () => snapshot;

/** Zwraca funkcję podającą status zadania; odświeża komponent po każdej zmianie. */
export function useSolutionStatuses(): StatusLookup {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
