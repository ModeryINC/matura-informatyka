import { useId, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { LuChevronLeft, LuChevronRight, LuX } from 'react-icons/lu';
import { useMediaQuery } from '../hooks/useMediaQuery';

/** Od tej szerokości panel stoi obok arkusza / edytora (węższy ekran – wysuwa się z boku). */
export const DOCKED_PANEL_QUERY = '(min-width: 1100px)';
const STORAGE_KEY = 'matura-inf:panel-odpowiedzi';

function loadDockedOpen(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'zwiniety';
  } catch {
    return true;
  }
}

function saveDockedOpen(open: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, open ? 'rozwiniety' : 'zwiniety');
  } catch {
    // Brak dostępu do pamięci – panel po prostu nie zapamięta stanu.
  }
}

interface SidePanelProps {
  title: string;
  /** Krótki stan obok tytułu na zakładce (np. „2/4”). */
  badge?: string;
  /** Zawsze szuflada z boku, także na szerokim ekranie (np. wyszukiwarka na telefonie). */
  drawerOnly?: boolean;
  /** Stopka szuflady, np. przycisk „Pokaż wyniki” (dostaje funkcję zsuwającą panel). */
  footer?: (close: () => void) => ReactNode;
  children: ReactNode;
}

/**
 * Panel odpowiedzi z boku ekranu, który można rozsunąć i zsunąć.
 *
 * - Szeroki ekran: stoi obok arkusza (edytora) w osobnej kolumnie; po zwinięciu
 *   zostaje wąska zakładka, a arkusz dostaje całą szerokość. Stan jest zapamiętywany.
 * - Węższy ekran: wysuwa się z prawej krawędzi nad treścią (bez blokowania strony,
 *   żeby dało się zaznaczać komórki i uruchamiać zapytania) i domyślnie jest zsunięty.
 *
 * Zawartość jest zawsze zamontowana; zsunięta jest `inert` (niedostępna z klawiatury).
 */
export function SidePanel({ title, badge, drawerOnly = false, footer, children }: SidePanelProps) {
  const wide = useMediaQuery(DOCKED_PANEL_QUERY);
  const docked = wide && !drawerOnly;
  const [dockedOpen, setDockedOpen] = useState(loadDockedOpen);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const open = docked ? dockedOpen : drawerOpen;
  const bodyId = useId();

  const setOpen = (value: boolean) => {
    if (docked) {
      setDockedOpen(value);
      saveDockedOpen(value);
    } else setDrawerOpen(value);
  };

  const Chevron = open ? LuChevronRight : LuChevronLeft;
  const panel = (
    <aside
      className={`side-panel side-panel--${docked ? 'docked' : 'drawer'}`}
      data-open={open || undefined}
      aria-label={title}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open && !docked) {
          event.stopPropagation();
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        className="side-panel__toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={bodyId}
        title={open ? `Zsuń panel „${title}”` : `Rozsuń panel „${title}”`}
      >
        <Chevron aria-hidden className="icon" />
        <span className="side-panel__toggle-label">
          {title}
          {badge && <span className="side-panel__badge">{badge}</span>}
        </span>
      </button>
      <div className="side-panel__body" id={bodyId} inert={!open}>
        <header className="side-panel__header">
          <h2>{title}</h2>
          {badge && <span className="side-panel__badge">{badge}</span>}
          <button
            type="button"
            className="icon-button side-panel__close"
            onClick={() => setOpen(false)}
            aria-label={`Zsuń panel „${title}”`}
          >
            <LuX aria-hidden className="icon" />
          </button>
        </header>
        <div className="side-panel__content">{children}</div>
        {footer && <div className="side-panel__footer">{footer(() => setOpen(false))}</div>}
      </div>
    </aside>
  );
  // Szuflada leży nad wszystkim (także nad nagłówkiem i dolnym paskiem), więc
  // renderujemy ją w <body> – strona zadania ma własny kontekst warstw.
  return docked ? panel : createPortal(panel, document.body);
}
