import { Link } from 'react-router';
import { LuCircleCheck } from 'react-icons/lu';
import { MorphItem } from '../components/MorphItem';
import { sessionsById } from '../data';
import { checkableParts, spreadsheetTasks, totalPoints } from '../data/spreadsheets';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { plural } from '../lib/plural';
import { loadWorkbookModule, usePreload } from '../lib/preload';
import { passedParts } from '../lib/spreadsheet/storage';
import type { SpreadsheetTask } from '../types';

/** Zadania pogrupowane według roku sesji (od najnowszych, jak w katalogu arkuszy). */
function byYear(tasks: SpreadsheetTask[]): [number, SpreadsheetTask[]][] {
  const groups = new Map<number, SpreadsheetTask[]>();
  for (const task of tasks) {
    const year = sessionsById.get(task.sessionId)?.year ?? 0;
    groups.set(year, [...(groups.get(year) ?? []), task]);
  }
  return [...groups.entries()];
}

/** Lista zadań rozwiązywanych w arkuszu kalkulacyjnym. */
export function ExcelTasksPage() {
  useDocumentTitle('Zadania z Excela');
  usePreload(loadWorkbookModule);

  return (
    <section className="tab-intro-wrap" aria-labelledby="excel-tytul">
      <h2 id="excel-tytul">Zadania z arkusza kalkulacyjnego</h2>
      <p className="lead">
        Zadania z arkuszy maturalnych 2018–2026, które rozwiązuje się w Excelu. Dane są już wczytane
        do arkusza w przeglądarce – pisz formuły (także po polsku), a odpowiedzi sprawdzisz z
        kluczem CKE. Nie pamiętasz funkcji? Zajrzyj do{' '}
        <Link to="/podstawy/excel">podstaw Excela</Link>.
      </p>
      {byYear(spreadsheetTasks).map(([year, tasks]) => (
        <section key={year} className="year-group" aria-labelledby={`excel-rok-${year}`}>
          <h3 id={`excel-rok-${year}`}>{year}</h3>
          <ul className="session-grid">
            {tasks.map((task) => {
              const session = sessionsById.get(task.sessionId);
              const done = passedParts(task.id);
              const total = checkableParts(task).length;
              const to = `/excel/${encodeURIComponent(task.id)}`;
              return (
                <MorphItem key={task.id} to={to} className="session-card">
                  <p className="task-card__meta">
                    {session ? session.label : task.sessionId} · zadanie {task.number}
                  </p>
                  <h4 className="xl-card__title">
                    <Link to={to} className="stretched-link" viewTransition>
                      {task.title}
                    </Link>
                  </h4>
                  <p className="muted">
                    {task.parts.length}{' '}
                    {plural(task.parts.length, 'podpunkt', 'podpunkty', 'podpunktów')} ·{' '}
                    {totalPoints(task)} pkt
                  </p>
                  <p className={done === total ? 'xl-card__done' : 'session-card__tasks'}>
                    {done === total ? (
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
