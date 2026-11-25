import { useEffect, useId, useRef } from 'react';

interface ConsoleProps {
  /** Wyjście programu (`print`, podpowiedzi i wpisane wartości `input`). */
  output: string;
  /** Komunikat błędu z ostatniego uruchomienia. */
  error: string | null;
  /** Program właśnie działa – wyjście dopisuje się na bieżąco. */
  running: boolean;
  /** Zawartość pola „Wejście” – kolejne linie dla `input()`. */
  stdin: string;
  onStdinChange: (value: string) => void;
  onClear: () => void;
  /** Kod wywołuje `input()` – pokazujemy podpowiedź przy pustym wejściu. */
  usesInput?: boolean;
}

/**
 * Konsola pod edytorem: wyjście programu na żywo i pole z danymi wejściowymi.
 *
 * Program nie może się zatrzymać i czekać na klawiaturę (działa w Web Workerze
 * bez współdzielonej pamięci, której GitHub Pages nie umożliwia), dlatego dane
 * dla `input()` wpisuje się przed uruchomieniem – po jednej linii na wywołanie.
 */
export function Console({
  output,
  error,
  running,
  stdin,
  onStdinChange,
  onClear,
  usesInput = false,
}: ConsoleProps) {
  const outputRef = useRef<HTMLPreElement>(null);
  const stdinId = useId();
  const hintId = useId();

  // Nowe wyjście – przewijamy na dół, jak w terminalu.
  useEffect(() => {
    const element = outputRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [output, error]);

  const empty = output === '' && error === null;

  return (
    <section className="console" aria-label="Konsola">
      <header className="console__header">
        <h3 className="console__title">Konsola</h3>
        {running && <span className="console__running">działa…</span>}
        <button
          type="button"
          className="button button--ghost button--small"
          onClick={onClear}
          disabled={empty || running}
        >
          Wyczyść
        </button>
      </header>

      <pre ref={outputRef} className="console__output" role="log" tabIndex={0}>
        {empty ? (
          <span className="console__placeholder">
            {running ? '' : 'Tu pojawi się wynik print() po kliknięciu „Uruchom”.'}
          </span>
        ) : (
          output
        )}
        {error && <span className="console__error">{error}</span>}
      </pre>

      <div className="console__stdin">
        <label htmlFor={stdinId}>Wejście (stdin)</label>
        <textarea
          id={stdinId}
          value={stdin}
          onChange={(event) => onStdinChange(event.target.value)}
          rows={2}
          spellCheck={false}
          placeholder="Dane dla input() – każda linia to kolejne wywołanie"
          aria-describedby={hintId}
        />
        <p
          id={hintId}
          className={`console__hint${usesInput && !stdin ? ' console__hint--warn' : ''}`}
        >
          {usesInput && !stdin
            ? 'Twój kod używa input() – wpisz dane powyżej przed uruchomieniem.'
            : 'Wpisane wartości trafią do input() i sys.stdin przy „Uruchom”.'}
        </p>
      </div>
    </section>
  );
}
