import { useSyncExternalStore } from 'react';

/** Czy zapytanie o media (np. `(max-width: 640px)`) jest teraz spełnione. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window.matchMedia !== 'function') return () => undefined;
      const list = window.matchMedia(query);
      // Starsze Safari (< 14) zna tylko addListener/removeListener.
      if (typeof list.addEventListener !== 'function') {
        list.addListener?.(onChange);
        return () => list.removeListener?.(onChange);
      }
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => typeof window.matchMedia === 'function' && Boolean(window.matchMedia(query)?.matches),
  );
}
