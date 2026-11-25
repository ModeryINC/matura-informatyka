/** Pobieranie wygenerowanego tekstu jako pliku (bez serwera – przez Blob). */
export function downloadText(fileName: string, text: string, type = 'text/x-python'): void {
  const url = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  // Zwolnienie adresu po rozpoczęciu pobierania.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Nazwa pliku z rozwiązaniem, np. `2024-maj-3.2.py`. */
export const solutionFileName = (taskId: string): string =>
  `${taskId.replace(/[^\w.-]+/g, '_')}.py`;

/** Czy zdarzenie to skrót Ctrl+S (Cmd+S na macOS). */
export const isSaveShortcut = (event: KeyboardEvent): boolean =>
  (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 's';
