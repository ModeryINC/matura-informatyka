import { useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router';
import {
  LuCircleHelp,
  LuFileText,
  LuHouse,
  LuListTodo,
  LuMoon,
  LuSun,
  LuSunMoon,
} from 'react-icons/lu';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useTheme } from '../hooks/useTheme';

const THEME_LABELS = { system: 'Motyw: systemowy', light: 'Motyw: jasny', dark: 'Motyw: ciemny' };
const THEME_ICONS = { system: LuSunMoon, light: LuSun, dark: LuMoon };

/** Szerokość, poniżej której nawigacja jest dolnym paskiem (jak w aplikacji mobilnej). */
export const MOBILE_NAV_QUERY = '(max-width: 640px)';

/** Wspólny układ strony: nagłówek, nawigacja (na telefonie – dolny pasek), treść i stopka. */
export function Layout() {
  const [theme, cycleTheme] = useTheme();
  const ThemeIcon = THEME_ICONS[theme];
  const mobile = useMediaQuery(MOBILE_NAV_QUERY);
  const { pathname } = useLocation();
  useFocusOnNavigation(pathname);

  const nav = <MainNav pathname={pathname} mobile={mobile} />;

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
          {!mobile && nav}
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
        <p>Arkusze i klucze odpowiedzi: CKE oraz Politechnika Łódzka (pobrane z arkusze.pl).</p>
        <p>
          Twoje odpowiedzi są zapisywane tylko w tej przeglądarce – na innych urządzeniach ich nie
          zobaczysz.
        </p>
      </footer>
      {mobile && nav}
      <ScrollRestoration />
    </>
  );
}

function MainNav({ pathname, mobile }: { pathname: string; mobile: boolean }) {
  // „Zadania” są aktywne także na stronie pojedynczego zadania (Python, Excel i SQL).
  const tasksActive = /^\/(zadania|zadanie|excel|sql|test)(\/|$)/.test(pathname);
  return (
    <nav aria-label="Główna nawigacja" className={mobile ? 'bottom-nav' : undefined}>
      <ul className="nav">
        {mobile && (
          <li>
            <NavLink to="/" end viewTransition>
              <LuHouse aria-hidden className="icon" />
              <span>Start</span>
            </NavLink>
          </li>
        )}
        <li>
          <Link to="/zadania" aria-current={tasksActive ? 'page' : undefined} viewTransition>
            {mobile && <LuListTodo aria-hidden className="icon" />}
            <span>Zadania</span>
          </Link>
        </li>
        <li>
          <NavLink to="/arkusze" viewTransition>
            {mobile && <LuFileText aria-hidden className="icon" />}
            <span>Arkusze</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/pomoc" viewTransition>
            {mobile && <LuCircleHelp aria-hidden className="icon" />}
            <span>Pomoc</span>
          </NavLink>
        </li>
      </ul>
    </nav>
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
