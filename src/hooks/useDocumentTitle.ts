import { useEffect } from 'react';

const APP_NAME = 'Matura z informatyki';

/** Ustawia tytuł karty przeglądarki (ważne dla historii i czytników ekranu). */
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : `${APP_NAME} – arkusze i zadania`;
  }, [title]);
}
