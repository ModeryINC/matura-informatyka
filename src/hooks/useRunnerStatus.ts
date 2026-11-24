import { useSyncExternalStore } from 'react';
import type { PythonRunner, RunnerStatus } from '../python/runner';

/** Aktualny stan interpretera Pythona (ładowanie, gotowy, wykonuje…). */
export function useRunnerStatus(runner: PythonRunner): RunnerStatus {
  return useSyncExternalStore(
    (callback) => runner.onStatus(callback),
    () => runner.status,
    () => runner.status,
  );
}
