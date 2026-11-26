import { useEffect, useRef, type ReactNode } from 'react';
import { LuX } from 'react-icons/lu';

interface ActionSheetProps {
  open: boolean;
  onClose: () => void;
  /** Nazwa okna dla czytników ekranu (treść ma zwykle własny nagłówek). */
  label: string;
  children: ReactNode;
}

/**
 * Panel wysuwany od dołu ekranu (na telefonie) – natywny modalny `<dialog>`.
 * Zawartość jest cały czas zamontowana, więc np. historia podpowiedzi czy wpisane
 * wejście konsoli nie znikają po zamknięciu. Zamyka go Esc, przycisk i stuknięcie
 * w przyciemnione tło.
 */
export function ActionSheet({ open, onClose, label, children }: ActionSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    } else if (!open && dialog.open) {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="action-sheet"
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
            onClick={onClose}
            aria-label="Zamknij"
          >
            <LuX aria-hidden className="icon" />
          </button>
        </div>
        <div className="action-sheet__content">{children}</div>
      </div>
    </dialog>
  );
}
