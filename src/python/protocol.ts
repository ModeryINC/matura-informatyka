/**
 * Protokół komunikacji między wątkiem głównym a Web Workerem z Pyodide.
 */

/** Plik do umieszczenia w wirtualnym systemie plików: nazwa → adres URL. */
export type FileMap = Record<string, string>;

export type WorkerRequest =
  | { type: 'init' }
  | { type: 'program'; id: number; code: string; runs: FileMap[] }
  | { type: 'function'; id: number; code: string; functionName: string; testsJson: string };

export interface ProgramRun {
  stdout: string;
  error: string | null;
}

export interface FunctionRun {
  error: string | null;
  stdout: string;
  results: { passed: boolean; actual: string; error?: string }[];
}

export type WorkerResponse =
  | { type: 'ready' }
  | { type: 'init-error'; message: string }
  | { type: 'program-result'; id: number; runs: ProgramRun[] }
  | { type: 'function-result'; id: number; result: FunctionRun }
  | { type: 'error'; id: number; message: string };
