/**
 * Przygotowanie i zapis zawartości arkusza dla zadania.
 */
import type { Sheet } from '@fortune-sheet/core';
import { assetUrl } from '../../data';
import type { SpreadsheetTask } from '../../types';
import { sheetFromText } from './importData';

/** Karty arkusza z danymi z plików zadania (pobierane z `public/`). */
export async function loadTaskSheets(
  task: SpreadsheetTask,
  fetchImpl: typeof fetch = fetch,
): Promise<Sheet[]> {
  return Promise.all(
    task.files.map(async (file, i) => {
      const response = await fetchImpl(assetUrl(file.path));
      if (!response.ok) throw new Error(`${file.path}: HTTP ${response.status}`);
      return sheetFromText(file, await response.text(), i);
    }),
  );
}

/** Zapisywany stan arkusza: komórki jako lista (bez pustych), bez macierzy roboczej. */
export function compactSheets(sheets: Sheet[]): Sheet[] {
  return sheets.map(({ data, ...sheet }) => {
    if (!data) return sheet;
    const celldata: NonNullable<Sheet['celldata']> = [];
    data.forEach((row, r) =>
      row?.forEach((cell, c) => {
        if (cell != null) celldata.push({ r, c, v: cell });
      }),
    );
    return { ...sheet, celldata };
  });
}
