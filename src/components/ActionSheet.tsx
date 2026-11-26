import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LuMaximize2, LuMinimize2, LuX } from 'react-icons/lu';

interface ActionSheetProps {
  open: boolean;
  onClose: () => void;
  /** Nazwa okna dla czytników ekranu (treść ma zwykle własny nagłówek). */
  label: string;
  children: ReactNode;
}

type SheetSize = 'half' | 'full';

/** Ruch palcem (px), po którym rozstrzygamy, czy to przeciąganie panelu, czy przewijanie. */
const DRAG_SLOP = 6;
/** Szybkie machnięcie (px/ms) rozstrzyga o kierunku niezależnie od przebytej drogi. */
const FLICK = 0.6;

/**
 * Panel wysuwany od dołu ekranu (na telefonie) – natywny modalny `<dialog>`.
 *
 * - Otwiera się do połowy ekranu; przeciągnięcie w górę (za uchwyt albo treść)
 *   rozciąga go na cały ekran, przycisk obok krzyżyka robi to samo z klawiatury.
 * - Gdy treść jest przewinięta do samej góry, dalsze ciągnięcie w dół zmniejsza
 *   panel z pełnego ekranu do połowy, a z połowy – zamyka go.
 * - Zawartość jest cały czas zamontowana, więc np. historia podpowiedzi czy wpisane
 *   wejście konsoli nie znikają po zamknięciu. Zamyka go też Esc i stuknięcie w tło.
 */
export function ActionSheet({ open, onClose, label, children }: ActionSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<SheetSize>('half');
  // Aktualne wartości dla nasłuchów dotyku (zakładanych raz).
  const sizeRef = useRef(size);
  const closeRef = useRef(onClose);
  useEffect(() => {
    sizeRef.current = size;
    closeRef.current = onClose;
  });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setSize('half');
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    } else if (!open && dialog.open) {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    }
  }, [open]);

  // Przeciąganie palcem (nasłuchy nie-pasywne, żeby móc zatrzymać przewijanie strony).
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    let start: {
      y: number;
      time: number;
      height: number;
      fromBar: boolean;
      atTop: boolean;
    } | null = null;
    let dragging: boolean | null = null;
    let lastDy = 0;

    const onStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch || event.touches.length > 1) return;
      const target = event.target as Element;
      start = {
        y: touch.clientY,
        time: event.timeStamp,
        height: dialog.getBoundingClientRect().height,
        fromBar: target.closest('.action-sheet__bar') !== null,
        atTop: (content.current?.scrollTop ?? 0) <= 0,
      };
      dragging = null;
      lastDy = 0;
    };

    const onMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!start || !touch) return;
      const dy = touch.clientY - start.y;
      if (dragging === null) {
        if (Math.abs(dy) < DRAG_SLOP) return;
        // W dół – gdy treść jest na samej górze; w górę – gdy panel nie jest jeszcze pełny.
        dragging =
          start.fromBar ||
          (dy > 0 && start.atTop) ||
          (dy < 0 && sizeRef.current === 'half' && start.atTop);
        if (dragging) dialog.classList.add('is-dragging');
      }
      if (!dragging) return;
      event.preventDefault();
      lastDy = dy;
      const height = Math.min(window.innerHeight, Math.max(0, start.height - dy));
      dialog.style.blockSize = `${height}px`;
      dialog.style.maxBlockSize = 'none';
    };

    const onEnd = (event: TouchEvent) => {
      if (!start || !dragging) {
        start = null;
        return;
      }
      const velocity = lastDy / Math.max(1, event.timeStamp - start.time);
      const height = start.height - lastDy;
      const full = window.innerHeight;
      dialog.classList.remove('is-dragging');
      dialog.style.blockSize = '';
      dialog.style.maxBlockSize = '';
      if (lastDy < 0) {
        if (velocity < -FLICK || height > (start.height + full) / 2) setSize('full');
      } else if (velocity > FLICK || height < start.height * 0.65) {
        if (sizeRef.current === 'full' && height > full * 0.35) setSize('half');
        else closeRef.current();
      }
      start = null;
      dragging = null;
    };

    dialog.addEventListener('touchstart', onStart, { passive: true });
    dialog.addEventListener('touchmove', onMove, { passive: false });
    dialog.addEventListener('touchend', onEnd);
    dialog.addEventListener('touchcancel', onEnd);
    return () => {
      dialog.removeEventListener('touchstart', onStart);
      dialog.removeEventListener('touchmove', onMove);
      dialog.removeEventListener('touchend', onEnd);
      dialog.removeEventListener('touchcancel', onEnd);
    };
  }, []);

  const full = size === 'full';
  return (
    <dialog
      ref={ref}
      className="action-sheet"
      data-size={size}
      aria-label={label}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // Stuknięcie w tło (poza panelem) trafia w sam element <dialog>.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="action-sheet__inner">
        <div className="action-sheet__bar">
          <span className="action-sheet__handle" aria-hidden="true" />
          <button
            type="button"
            className="icon-button action-sheet__close"
            onClick={() => setSize(full ? 'half' : 'full')}
            aria-label={full ? 'Zmniejsz panel' : 'Rozciągnij na cały ekran'}
          >
            {full ? (
              <LuMinimize2 aria-hidden className="icon" />
            ) : (
              <LuMaximize2 aria-hidden className="icon" />
            )}
          </button>
          <button
            type="button"
            className="icon-button action-sheet__close"
            onClick={onClose}
            aria-label="Zamknij"
          >
            <LuX aria-hidden className="icon" />
          </button>
        </div>
        <div className="action-sheet__content" ref={content}>
          {children}
        </div>
      </div>
    </dialog>
  );
}
