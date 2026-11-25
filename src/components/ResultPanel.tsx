import type { SubmissionResult } from '../types';

/** Wynik sprawdzenia („Sprawdź”) – lista testów z porównaniem. */
export function ResultPanel({ result }: { result: SubmissionResult }) {
  const passedCount = result.results.filter((r) => r.passed).length;
  return (
    <section
      className={`result ${result.passed ? 'result--passed' : 'result--failed'}`}
      aria-label="Wynik sprawdzenia"
    >
      <h3 className="result__title">
        {result.passed ? '✓ Zaliczone!' : '✗ Jeszcze nie'}{' '}
        <span className="muted">
          ({passedCount}/{result.results.length} testów, {result.durationMs} ms)
        </span>
      </h3>
      <ol className="checks">
        {result.results.map((check, i) => (
          <li key={i} className={`check ${check.passed ? 'check--passed' : 'check--failed'}`}>
            <details open={!check.passed}>
              <summary>
                <span aria-hidden="true">{check.passed ? '✓' : '✗'}</span> {check.label}
                <span className="visually-hidden">
                  {check.passed ? ' – poprawnie' : ' – błędnie'}
                </span>
              </summary>
              <div className="check__body">
                {check.expected !== '' && (
                  <div>
                    <h4>Oczekiwano</h4>
                    <pre>{check.expected}</pre>
                  </div>
                )}
                <div>
                  <h4>Otrzymano</h4>
                  <pre>{check.actual || '(brak wyjścia)'}</pre>
                </div>
                {check.error && (
                  <div className="check__error">
                    <h4>Błąd</h4>
                    <pre>{check.error}</pre>
                  </div>
                )}
              </div>
            </details>
          </li>
        ))}
      </ol>
    </section>
  );
}
