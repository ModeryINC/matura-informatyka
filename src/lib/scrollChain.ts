/**
 * Przekazywanie przewijania do strony z komponentów, które same obsługują kółko
 * myszy i dotyk (arkusz kalkulacyjny przechwytuje te zdarzenia i nie pozwala
 * przeglądarce przewinąć strony). Gdy wewnętrzny obszar dojdzie do krawędzi,
 * dalsze przewijanie w tę stronę przesuwa stronę – jak przy zwykłych,
 * zagnieżdżonych obszarach przewijania.
 */

/** Wymiary przewijanego obszaru (podzbiór `Element`). */
export interface ScrollBox {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

const LINE_PX = 16;

/** Przesunięcie z kółka w pikselach (niezależnie od trybu `deltaMode`). */
export function wheelPixels(event: Pick<WheelEvent, 'deltaY' | 'deltaMode'>, pageHeight: number) {
  if (event.deltaMode === 1) return event.deltaY * LINE_PX;
  if (event.deltaMode === 2) return event.deltaY * pageHeight;
  return event.deltaY;
}

/** Czy obszar nie może się już przewinąć w danym kierunku (dodatni = w dół). */
export function atEdge(box: ScrollBox | null, delta: number): boolean {
  if (!box || delta === 0) return false;
  if (box.scrollHeight <= box.clientHeight) return true;
  return delta > 0 ? box.scrollTop + box.clientHeight >= box.scrollHeight - 1 : box.scrollTop <= 0;
}

/**
 * Podpina przekazywanie przewijania do kontenera. `findScroller` zwraca element,
 * którego `scrollTop` opisuje pionowe przewinięcie komponentu (wywoływane przy
 * każdym zdarzeniu – komponent może go utworzyć później). Zwraca funkcję odpinającą.
 */
export function chainScroll(
  container: HTMLElement,
  findScroller: () => ScrollBox | null,
  win: Pick<Window, 'scrollBy' | 'innerHeight'> = window,
): () => void {
  const onWheel = (event: WheelEvent) => {
    // Poziome przewijanie i Ctrl+kółko (powiększenie) zostawiamy komponentowi.
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const delta = wheelPixels(event, win.innerHeight);
    if (delta !== 0 && atEdge(findScroller(), delta)) win.scrollBy({ top: delta });
  };

  let lastY: number | null = null;
  const onTouchStart = (event: TouchEvent) => {
    lastY = event.touches.length === 1 ? event.touches[0]!.clientY : null;
  };
  const onTouchMove = (event: TouchEvent) => {
    if (lastY === null || event.touches.length !== 1) return;
    const y = event.touches[0]!.clientY;
    const delta = lastY - y;
    lastY = y;
    if (delta !== 0 && atEdge(findScroller(), delta)) win.scrollBy({ top: delta });
  };
  const onTouchEnd = () => {
    lastY = null;
  };

  // Faza przechwytywania: stan przewinięcia odczytujemy, zanim komponent go zmieni.
  const options = { capture: true, passive: true } as const;
  container.addEventListener('wheel', onWheel, options);
  container.addEventListener('touchstart', onTouchStart, options);
  container.addEventListener('touchmove', onTouchMove, options);
  container.addEventListener('touchend', onTouchEnd, options);
  return () => {
    container.removeEventListener('wheel', onWheel, options);
    container.removeEventListener('touchstart', onTouchStart, options);
    container.removeEventListener('touchmove', onTouchMove, options);
    container.removeEventListener('touchend', onTouchEnd, options);
  };
}
