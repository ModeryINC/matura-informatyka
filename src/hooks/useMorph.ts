import type { CSSProperties } from 'react';
import { useViewTransitionState } from 'react-router';

/** Nazwa wspólna dla karty i strony szczegółów (patrz `.page--detail` w CSS). */
export const DETAIL_TRANSITION = 'szczegoly';

/**
 * Styl dla elementu listy (karty, przycisku), który podczas przejścia do `to`
 * (i z powrotem) ma się „rozciągnąć” w stronę szczegółów. Nazwa jest nadawana
 * tylko na czas przejścia – inaczej kilka kart miałoby tę samą nazwę.
 */
export function useMorphStyle(to: string): CSSProperties | undefined {
  return useViewTransitionState(to) ? { viewTransitionName: DETAIL_TRANSITION } : undefined;
}
