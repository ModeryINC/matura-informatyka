import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { MorphItem } from '../components/MorphItem';
import { sessions, tasksForSession } from '../data';
import { spreadsheetTasks } from '../data/spreadsheets';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { SESSION_KIND_LABELS } from '../lib/sessions';
import type { SessionKind } from '../types';

/** Lista wszystkich arkuszy pogrupowana według lat, z filtrem rodzaju sesji. */
export function SessionsPage() {
  useDocumentTitle('Arkusze');
  const [kind, setKind] = useState<SessionKind | null>(null);
  const byYear = useMemo(() => {
    const groups = new Map<number, typeof sessions>();
    for (const session of sessions) {
      if (kind && session.kind !== kind) continue;
      groups.set(session.year, [...(groups.get(session.year) ?? []), session]);
    }
    return [...groups.entries()];
  }, [kind]);
  const kinds = [...new Set(sessions.map((s) => s.kind))];

  return (
    <div className="page">
      <h1>Arkusze maturalne</h1>
      <p className="lead">
        Wszystkie arkusze z informatyki na poziomie rozszerzonym od 2018 roku – z kluczami
        odpowiedzi i plikami z danymi.
      </p>
      <div role="group" aria-label="Rodzaj sesji" className="chip-row">
        <button
          type="button"
          className="chip"
          aria-pressed={kind === null}
          onClick={() => setKind(null)}
        >
          Wszystkie
        </button>
        {kinds.map((k) => (
          <button
            key={k}
            type="button"
            className="chip"
            aria-pressed={kind === k}
            onClick={() => setKind(k)}
          >
            {SESSION_KIND_LABELS[k]}
          </button>
        ))}
      </div>
      {byYear.map(([year, list]) => (
        <section key={year} className="year-group" aria-labelledby={`rok-${year}`}>
          <h2 id={`rok-${year}`}>{year}</h2>
          <ul className="session-grid">
            {list.map((session) => {
              const count =
                tasksForSession(session.id).length +
                spreadsheetTasks.filter((t) => t.sessionId === session.id).length;
              return (
                <MorphItem key={session.id} to={`/arkusze/${session.id}`} className="session-card">
                  <h3>
                    <Link to={`/arkusze/${session.id}`} className="stretched-link" viewTransition>
                      {session.label}
                    </Link>
                  </h3>
                  <p className="muted">
                    {SESSION_KIND_LABELS[session.kind]} · {session.sheets.length} PDF ·{' '}
                    {session.attachments.length} plików z danymi
                  </p>
                  {count > 0 && <p className="session-card__tasks">{count} zadań do rozwiązania</p>}
                </MorphItem>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
