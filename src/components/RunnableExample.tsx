import { useState } from 'react';
import type { BasicsExample } from '../data/pythonBasics';
import type { ExecutionOutput, PythonRunner } from '../python/runner';
import { CodeEditor } from './CodeEditor';
import { LuPlay } from 'react-icons/lu';

interface RunnableExampleProps {
  example: BasicsExample;
  runner: PythonRunner;
  label: string;
}

/**
 * Przykład kodu, który można zmienić i uruchomić w przeglądarce (Pyodide).
 * Zmiany nie są zapisywane – „Przywróć” wraca do wersji z lekcji.
 */
export function RunnableExample({ example, runner, label }: RunnableExampleProps) {
  const [code, setCode] = useState(example.code);
  const [stdin, setStdin] = useState(example.stdin ?? '');
  const [output, setOutput] = useState<ExecutionOutput | null>(null);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    setOutput({ stdout: '', error: null });
    const result = await runner.executeSnippet(code, {
      stdin,
      onOutput: (text) =>
        setOutput((current) => ({ stdout: (current?.stdout ?? '') + text, error: null })),
    });
    setOutput(result);
    setRunning(false);
  };

  return (
    <div className="example">
      <CodeEditor value={code} onChange={setCode} onSubmit={run} label={label} autoHeight />
      {example.stdin !== undefined && (
        <label className="example__stdin">
          <span>Wejście (dla input())</span>
          <textarea
            value={stdin}
            onChange={(event) => setStdin(event.target.value)}
            rows={2}
            spellCheck={false}
          />
        </label>
      )}
      <div className="example__actions">
        <button type="button" className="button button--small" onClick={run} disabled={running}>
          {!running && <LuPlay aria-hidden className="icon" />}
          {running ? 'Uruchamiam…' : 'Uruchom'}
        </button>
        {code !== example.code && (
          <button
            type="button"
            className="button button--ghost button--small"
            onClick={() => {
              setCode(example.code);
              setOutput(null);
            }}
          >
            Przywróć
          </button>
        )}
      </div>
      {output && (
        <pre className="example__output" aria-label="Wynik przykładu" aria-live="polite">
          {output.stdout || (running ? '' : '(brak wyjścia)')}
          {output.error && <span className="console__error">{output.error}</span>}
        </pre>
      )}
    </div>
  );
}
