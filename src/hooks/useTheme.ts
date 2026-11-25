import { useCallback, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

export type Theme = 'system' | 'light' | 'dark';
const KEY = 'matura-inf:theme';
const ORDER: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' };

function readTheme(): Theme {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

/** Ustawia atrybut `data-theme` na <html> (bez atrybutu = motyw systemowy). */
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
}

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Motyw kolorystyczny: systemowy, jasny lub ciemny. `cycle(przycisk)` przełącza
 * motyw z animacją: nowe kolory rozlewają się kołem od przycisku (View Transitions,
 * reguły `.theme-transition` w CSS). Bez obsługi API lub przy ograniczeniu ruchu
 * motyw zmienia się od razu.
 */
export function useTheme(): [Theme, (origin?: HTMLElement | null) => void] {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    applyTheme(theme);
    try {
      if (theme === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, theme);
    } catch {
      // brak dostępu do pamięci – motyw obowiązuje tylko w tej sesji
    }
  }, [theme]);

  const cycle = useCallback(
    (origin?: HTMLElement | null) => {
      const next = ORDER[theme];
      if (!origin || typeof document.startViewTransition !== 'function' || prefersReducedMotion()) {
        setTheme(next);
        return;
      }
      const rect = origin.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const root = document.documentElement;
      root.style.setProperty('--theme-x', `${x}px`);
      root.style.setProperty('--theme-y', `${y}px`);
      root.style.setProperty('--theme-r', `${radius}px`);
      root.classList.add('theme-transition');
      const transition = document.startViewTransition(() => {
        flushSync(() => setTheme(next));
        applyTheme(next);
      });
      void transition.finished.finally(() => root.classList.remove('theme-transition'));
    },
    [theme],
  );

  return [theme, cycle];
}
