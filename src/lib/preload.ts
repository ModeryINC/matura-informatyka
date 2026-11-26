/**
 * Ładowanie silników w tle: po wejściu na zakładkę „Zadania → Python / Excel / SQL”
 * zaczynamy pobierać Pythona (Pyodide), arkusz kalkulacyjny albo SQLite, kiedy
 * przeglądarka nie ma nic pilniejszego do roboty – zanim uczeń otworzy zadanie.
 * Pomijamy to w trybie oszczędzania danych.
 */
import { useEffect } from 'react';

interface NetworkInformation {
  saveData?: boolean;
}

/** Czy wolno pobierać w tle (są workery i nie ma trybu oszczędzania danych). */
export function canPreload(): boolean {
  if (typeof Worker === 'undefined') return false;
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  return connection?.saveData !== true;
}

/** Wywołuje `task`, gdy przeglądarka jest bezczynna; zwraca funkcję anulującą. */
export function whenIdle(task: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(task, { timeout: 2000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(task, 300);
  return () => window.clearTimeout(id);
}

/** Po wyświetleniu strony ładuje w tle silnik (`load`); błędy pomija – wróci do nich zadanie. */
export function usePreload(load: () => unknown): void {
  useEffect(() => {
    if (!canPreload()) return;
    return whenIdle(() => {
      try {
        void Promise.resolve(load()).catch(() => undefined);
      } catch {
        // Ładowanie w tle jest tylko przyspieszeniem – zadanie spróbuje jeszcze raz.
      }
    });
  }, [load]);
}

/** Moduł arkusza kalkulacyjnego (Fortune Sheet) – wspólny dla `lazy()` i ładowania w tle. */
export const loadWorkbookModule = () => import('../components/SpreadsheetWorkbook');
