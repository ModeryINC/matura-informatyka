/// <reference lib="webworker" />
/**
 * Web Worker uruchamiający Pythona (Pyodide) poza wątkiem interfejsu.
 * Dzięki temu nieskończona pętla w rozwiązaniu nie blokuje strony –
 * wątek główny po przekroczeniu limitu czasu po prostu kończy workera.
 */
import harnessSource from './harness.py?raw';
import type { FileMap, WorkerRequest, WorkerResponse } from './protocol';

export const PYODIDE_VERSION = '314.0.8';
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const WORKDIR = '/home/pyodide/zadanie';

interface PyodideApi {
  runPython: (code: string) => unknown;
  globals: { get: (name: string) => (...args: unknown[]) => string };
  FS: {
    mkdirTree: (path: string) => void;
    readdir: (path: string) => string[];
    unlink: (path: string) => void;
    writeFile: (path: string, data: Uint8Array) => void;
    analyzePath: (path: string) => { exists: boolean };
  };
}

declare const self: DedicatedWorkerGlobalScope;

let pyodidePromise: Promise<PyodideApi> | null = null;
const fileCache = new Map<string, Promise<Uint8Array>>();

function loadPython(): Promise<PyodideApi> {
  pyodidePromise ??= (async () => {
    const module = (await import(/* @vite-ignore */ `${INDEX_URL}pyodide.mjs`)) as {
      loadPyodide: (options: { indexURL: string }) => Promise<PyodideApi>;
    };
    const pyodide = await module.loadPyodide({ indexURL: INDEX_URL });
    pyodide.runPython(harnessSource);
    return pyodide;
  })();
  return pyodidePromise;
}

function fetchFile(url: string): Promise<Uint8Array> {
  let cached = fileCache.get(url);
  if (!cached) {
    cached = fetch(url).then(async (response) => {
      if (!response.ok) throw new Error(`Nie udało się pobrać pliku ${url} (${response.status})`);
      return new Uint8Array(await response.arrayBuffer());
    });
    cached.catch(() => fileCache.delete(url));
    fileCache.set(url, cached);
  }
  return cached;
}

async function prepareWorkdir(pyodide: PyodideApi, files: FileMap): Promise<void> {
  const { FS } = pyodide;
  if (!FS.analyzePath(WORKDIR).exists) FS.mkdirTree(WORKDIR);
  for (const name of FS.readdir(WORKDIR)) {
    if (name !== '.' && name !== '..') FS.unlink(`${WORKDIR}/${name}`);
  }
  const entries = await Promise.all(
    Object.entries(files).map(async ([name, url]) => [name, await fetchFile(url)] as const),
  );
  for (const [name, data] of entries) FS.writeFile(`${WORKDIR}/${name}`, data);
}

const post = (message: WorkerResponse) => self.postMessage(message);

self.addEventListener('message', async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  if (request.type === 'init') {
    try {
      await loadPython();
      post({ type: 'ready' });
    } catch (error) {
      pyodidePromise = null;
      post({ type: 'init-error', message: String(error) });
    }
    return;
  }

  try {
    const pyodide = await loadPython();
    if (request.type === 'program') {
      const runProgram = pyodide.globals.get('run_program');
      const runs = [];
      for (const files of request.runs) {
        await prepareWorkdir(pyodide, files);
        runs.push(JSON.parse(runProgram(request.code, WORKDIR)));
      }
      post({ type: 'program-result', id: request.id, runs });
    } else {
      await prepareWorkdir(pyodide, {});
      const runFunction = pyodide.globals.get('run_function');
      const result = JSON.parse(runFunction(request.code, request.functionName, request.testsJson));
      post({ type: 'function-result', id: request.id, result });
    }
  } catch (error) {
    post({ type: 'error', id: request.id, message: String(error) });
  }
});
