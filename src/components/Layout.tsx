import { NavLink, Outlet, ScrollRestoration } from 'react-router';
import { useTheme } from '../hooks/useTheme';

const THEME_LABELS = { system: 'Motyw: systemowy', light: 'Motyw: jasny', dark: 'Motyw: ciemny' };
const THEME_ICONS = { system: '◐', light: '☀', dark: '☾' };

/** Wspólny układ strony: nagłówek z nawigacją, treść i stopka. */
export function Layout() {
  const [theme, cycleTheme] = useTheme();

  return (
    <>
      <a className="skip-link" href="#tresc">
        Przejdź do treści
      </a>
      <header className="site-header">
        <div className="site-header__inner">
          <NavLink to="/" className="brand">
            <span className="brand__logo" aria-hidden="true">
              {'</>'}
            </span>
            <span>Matura z informatyki</span>
          </NavLink>
          <nav aria-label="Główna nawigacja">
            <ul className="nav">
              <li>
                <NavLink to="/" end>
                  Zadania
                </NavLink>
              </li>
              <li>
                <NavLink to="/arkusze">Arkusze</NavLink>
              </li>
              <li>
                <NavLink to="/python">Python</NavLink>
              </li>
              <li>
                <NavLink to="/pomoc">Pomoc</NavLink>
              </li>
            </ul>
          </nav>
          <button
            type="button"
            className="icon-button"
            onClick={cycleTheme}
            aria-label={THEME_LABELS[theme]}
            title={THEME_LABELS[theme]}
          >
            <span aria-hidden="true">{THEME_ICONS[theme]}</span>
          </button>
        </div>
      </header>
      <main id="tresc" className="site-main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>
          Arkusze i klucze odpowiedzi: CKE oraz Politechnika Łódzka (pobrane z arkusze.pl).
          Rozwiązania są sprawdzane w Twojej przeglądarce i zapisywane tylko lokalnie.
        </p>
      </footer>
      <ScrollRestoration />
    </>
  );
}
