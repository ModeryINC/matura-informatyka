import { useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router';
import { useTheme } from '../hooks/useTheme';
import { LuMoon, LuSun, LuSunMoon } from 'react-icons/lu';

const THEME_LABELS = { system: 'Motyw: systemowy', light: 'Motyw: jasny', dark: 'Motyw: ciemny' };
const THEME_ICONS = { system: LuSunMoon, light: LuSun, dark: LuMoon };

/** Wspólny układ strony: nagłówek z nawigacją, treść i stopka. */
export function Layout() {
  const [theme, cycleTheme] = useTheme();
  const ThemeIcon = THEME_ICONS[theme];
  // „Zadania” są aktywne także na stronie pojedynczego zadania (Python i Excel).
  const { pathname } = useLocation();
  const tasksActive = /^\/(zadania|zadanie|excel)(\/|$)/.test(pathname);
  useFocusOnNavigation(pathname);

  return (
    <>
      <a className="skip-link" href="#tresc">
        Przejdź do treści
      </a>
      <header className="site-header">
        <div className="site-header__inner">
          <NavLink to="/" className="brand" viewTransition>
            <span className="brand__logo" aria-hidden="true">
              {'</>'}
            </span>
            <span>Matura z informatyki</span>
          </NavLink>
          <nav aria-label="Główna nawigacja">
            <ul className="nav">
              <li>
                <Link to="/zadania" aria-current={tasksActive ? 'page' : undefined} viewTransition>
                  Zadania
                </Link>
              </li>
              <li>
                <NavLink to="/arkusze" viewTransition>
                  Arkusze
                </NavLink>
              </li>
              <li>
                <NavLink to="/pomoc" viewTransition>
                  Pomoc
                </NavLink>
              </li>
            </ul>
          </nav>
          <button
            type="button"
            className="icon-button"
            onClick={(event) => cycleTheme(event.currentTarget)}
            aria-label={THEME_LABELS[theme]}
            title={THEME_LABELS[theme]}
          >
            <ThemeIcon aria-hidden className="icon" />
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

/**
 * Po przejściu na inną stronę fokus trafia na treść (`#tresc`), żeby czytnik ekranu
 * i klawiatura zaczynały od nowej zawartości, a nie od klikniętego, już nieistniejącego
 * linku. Przełączanie zakładek „Zadania” (Python / Excel / SQL) zostawia fokus na zakładce.
 */
function useFocusOnNavigation(pathname: string) {
  const previous = useRef(pathname);
  useEffect(() => {
    const before = previous.current;
    previous.current = pathname;
    if (before === pathname) return;
    if (before.startsWith('/zadania/') && pathname.startsWith('/zadania/')) return;
    document.getElementById('tresc')?.focus({ preventScroll: true });
  }, [pathname]);
}
