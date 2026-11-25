import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { assetUrl } from '../data';
import { fileName } from '../lib/sessions';

/** Więcej linii nie wyświetlamy – duży `<pre>` spowalnia przeglądarkę. */
export const PREVIEW_LINE_LIMIT = 2000;

type PreviewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; text: string; lineCount: number };

interface FilePreviewDialogProps {
  /** Ścieżka pliku względem `public/`; `null` – okno zamknięte. */
  path: string | null;
  onClose: () => void;
}

const loadPreview = async (path: string, signal: AbortSignal): Promise<PreviewState> => {
  const response = await fetch(assetUrl(path), { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const lines = (await response.text()).replace(/\r\n?/g, '\n').replace(/\n$/, '').split('\n');
  return {
    status: 'ready',
    text: lines.slice(0, PREVIEW_LINE_LIMIT).join('\n'),
    lineCount: lines.length,
  };
};

/**
 * Modalny podgląd pliku tekstowego z danymi (natywny `<dialog>`): pokazuje
 * zawartość, liczbę linii i przycisk pobierania. Zamyka się klawiszem Esc,
 * przyciskiem lub kliknięciem w tło.
 */
export function FilePreviewDialog({ path, onClose }: FilePreviewDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [preview, setPreview] = useState<PreviewState>({ status: 'loading' });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (path && !dialog.open) dialog.showModal();
    if (!path && dialog.open) dialog.close();
  }, [path]);

  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset przy zmianie pliku
    setPreview({ status: 'loading' });
    loadPreview(path, controller.signal).then(setPreview, (error: Error) => {
      if (!controller.signal.aborted) setPreview({ status: 'error', message: error.message });
    });
    return () => controller.abort();
  }, [path]);

  const name = path ? fileName(path) : '';

  // Portal do <body>: okno działa także wtedy, gdy lista plików jest w zwiniętym <details>.
  return createPortal(
    <dialog
      ref={dialogRef}
      className="file-preview"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        // Kliknięcie w tło (poza zawartością) trafia w sam element <dialog>.
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      {path && (
        <div className="file-preview__inner">
          <header className="file-preview__header">
            <h2 id={titleId} className="file-preview__title">
              {name}
            </h2>
            {preview.status === 'ready' && (
              <span className="file-preview__meta">
                {preview.lineCount.toLocaleString('pl-PL')}{' '}
                {preview.lineCount === 1 ? 'linia' : 'linii'}
              </span>
            )}
            <div className="file-preview__actions">
              <a className="button button--primary" href={assetUrl(path)} download={name}>
                Pobierz
              </a>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => dialogRef.current?.close()}
              >
                Zamknij
              </button>
            </div>
          </header>
          {preview.status === 'loading' && <p className="file-preview__status">Wczytywanie…</p>}
          {preview.status === 'error' && (
            <p className="file-preview__status" role="alert">
              Nie udało się wczytać pliku ({preview.message}). Możesz go pobrać.
            </p>
          )}
          {preview.status === 'ready' && (
            <>
              <pre className="file-preview__content" tabIndex={0}>
                {preview.text}
              </pre>
              {preview.lineCount > PREVIEW_LINE_LIMIT && (
                <p className="file-preview__status">
                  Pokazano pierwsze {PREVIEW_LINE_LIMIT.toLocaleString('pl-PL')} linii – pobierz
                  plik, aby zobaczyć całość.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </dialog>,
    document.body,
  );
}
