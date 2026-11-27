import { Link } from 'react-router';
import { LuCircleCheck, LuShuffle } from 'react-icons/lu';
import { MorphItem } from '../components/MorphItem';
import { sessionsById } from '../data';
import { allTheoryParts, theoryTasks } from '../data/theory';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { plural } from '../lib/plural';
import { passedTheoryParts } from '../lib/theory/storage';
import type { TheoryTask } from '../types';

function byYear(tasks: TheoryTask[]): [number, TheoryTask[]][] {
  const groups = new Map<number, TheoryTask[]>();
  for (const task of tasks) {
    const year = sessionsById.get(task.sessionId)?.year ?? 0;
    groups.set(year, [...(groups.get(year) ?? []), task]);
  }
  return [...groups.entries()];
}

/** Lista zadań testowych (P/F) z arkuszy i wejście do losowego testu. */
export function TheoryTasksPage() {
  useDocumentTitle('Zadania testowe');
  const statements = allTheoryParts.reduce((sum, { part }) => sum + part.statements.length, 0);

  return (
    <section className="tab-intro-wrap" aria-labelledby="test-tytul">
      <h2 id="test-tytul">Zadania testowe</h2>
      <p className="lead">
        Zadania „Test” z arkuszy 2018–2026: zdania do oceny – prawda czy fałsz – z systemów
        liczbowych, sieci, baz danych, grafiki, bezpieczeństwa i prawa. Punkt jest tylko za komplet
        poprawnych odpowiedzi, jak na maturze. Teorię znajdziesz w{' '}
        <Link to="/podstawy/teoria">podstawach teorii</Link>.
      </p>
      <div className="theory-random">
        <div>
          <strong>Losowy test</strong>
          <p className="muted">
            10 losowych podpunktów ze wszystkich arkuszy ({allTheoryParts.length} podpunktów,{' '}
            {statements} zdań).
          </p>
        </div>
        <Link to="/test/losowy" className="button button--primary" viewTransition>
          <LuShuffle aria-hidden className="icon" /> Rozwiąż losowy test
        </Link>
      </div>
      {byYear(theoryTasks).map(([year, tasks]) => (
        <section key={year} className="year-group" aria-labelledby={`test-rok-${year}`}>
          <h3 id={`test-rok-${year}`}>{year}</h3>
          <ul className="session-grid">
            {tasks.map((task) => {
              const session = sessionsById.get(task.sessionId);
              const done = passedTheoryParts(task.id);
              const total = task.parts.length;
              const to = `/test/${encodeURIComponent(task.id)}`;
              return (
                <MorphItem key={task.id} to={to} className="session-card">
                  <p className="task-card__meta">
                    {session ? `${session.label} ${session.year}` : task.sessionId} · zadanie{' '}
                    {task.number}
                  </p>
                  <h4 className="xl-card__title">
                    <Link to={to} className="stretched-link" viewTransition>
                      {task.title}
                    </Link>
                  </h4>
                  <p className="muted">
                    {total} {plural(total, 'podpunkt', 'podpunkty', 'podpunktów')}
                  </p>
                  <p className={done >= total ? 'xl-card__done' : 'session-card__tasks'}>
                    {done >= total ? (
                      <>
                        <LuCircleCheck aria-hidden className="icon" /> Wszystko zaliczone
                      </>
                    ) : (
                      `Zaliczone: ${done}/${total}`
                    )}
                  </p>
                </MorphItem>
              );
            })}
          </ul>
        </section>
      ))}
    </section>
  );
}
