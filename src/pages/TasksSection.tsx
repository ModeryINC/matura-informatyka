import { NavLink, Outlet } from 'react-router';
import { tasks } from '../data';
import { spreadsheetTasks } from '../data/spreadsheets';
import { sqlTasks } from '../data/sql';
import { theoryTasks } from '../data/theory';

const TABS = [
  { to: 'python', label: 'Python', count: tasks.length },
  { to: 'excel', label: 'Excel', count: spreadsheetTasks.length },
  { to: 'sql', label: 'SQL', count: sqlTasks.length },
  { to: 'test', label: 'Test', count: theoryTasks.length },
] as const;

/** Zakładka „Zadania”: wspólny nagłówek i podział na Python, Excel, SQL i Test. */
export function TasksSection() {
  return (
    <div className="page page--tasks">
      <header className="section-header">
        <h1>Zadania</h1>
        <nav aria-label="Rodzaj zadań" className="tabs">
          {TABS.map((tab) => (
            <NavLink key={tab.to} to={tab.to} className="tabs__tab">
              {tab.label}
              <span className="tabs__count">{tab.count}</span>
            </NavLink>
          ))}
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
