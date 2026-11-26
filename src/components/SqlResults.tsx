import { formatValue, type QueryOutcome } from '../lib/sql/engine';
import { plural } from '../lib/plural';

/** Ile wierszy wyniku rysujemy (reszta jest dostępna przy wstawianiu odpowiedzi). */
const SHOWN_ROWS = 200;

interface SqlResultsProps {
  outcome: QueryOutcome;
}

/** Wyniki wykonanych poleceń SQL: tabele wierszy, komunikat o zmianach albo błąd. */
export function SqlResults({ outcome }: SqlResultsProps) {
  const { results, error, changes } = outcome;
  return (
    <div className="sql-results">
      {results.map((result, i) => (
        <section
          key={i}
          className="sql-result"
          aria-label={results.length > 1 ? `Wynik ${i + 1}` : 'Wynik zapytania'}
        >
          <p className="sql-result__meta muted">
            {results.length > 1 && <strong>Wynik {i + 1}: </strong>}
            {result.truncated ? 'ponad ' : ''}
            {result.rows.length} {plural(result.rows.length, 'wiersz', 'wiersze', 'wierszy')}
            {result.rows.length > SHOWN_ROWS && ` (pokazano pierwsze ${SHOWN_ROWS})`}
          </p>
          <div className="sql-result__scroll">
            <table className="sql-table">
              <thead>
                <tr>
                  {result.columns.map((column, c) => (
                    <th key={c} scope="col">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.slice(0, SHOWN_ROWS).map((row, r) => (
                  <tr key={r}>
                    {row.map((value, c) =>
                      value === null ? (
                        <td key={c} className="sql-table__null">
                          NULL
                        </td>
                      ) : (
                        <td key={c} className={typeof value === 'number' ? 'sql-table__num' : ''}>
                          {formatValue(value)}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      {results.length === 0 && !error && (
        <p className="muted">
          {changes > 0
            ? `Polecenie wykonane – zmienione wiersze: ${changes}.`
            : 'Polecenie wykonane (nie zwróciło wierszy).'}
        </p>
      )}
      {error && (
        <p className="hints__error" role="alert">
          Błąd: {error}
        </p>
      )}
    </div>
  );
}
