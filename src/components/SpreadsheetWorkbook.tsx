/**
 * Arkusz kalkulacyjny w przeglądarce (Fortune Sheet, licencja MIT). Ładowany
 * leniwie – biblioteka jest duża, a potrzebna tylko w zakładce „Excel”.
 */
import { Workbook, type WorkbookInstance } from '@fortune-sheet/react';
import '@fortune-sheet/react/dist/index.css';
import type { Sheet } from '@fortune-sheet/core';
import { useImperativeHandle, useMemo, useRef, type Ref } from 'react';
import { translateInput } from '../lib/spreadsheet/formulaLocale';

/** Sterowanie arkuszem z zewnątrz (np. „wstaw z zaznaczenia”). */
export interface SpreadsheetHandle {
  /** Wartości zaznaczonego zakresu tak, jak są wyświetlane; `null` – brak zaznaczenia. */
  getSelectionValues(): string[][] | null;
}

interface SpreadsheetWorkbookProps {
  sheets: Sheet[];
  onChange?: (sheets: Sheet[]) => void;
  ref?: Ref<SpreadsheetHandle>;
}

const TOOLBAR = [
  'undo',
  'redo',
  'format-painter',
  'clear-format',
  '|',
  'percentage-format',
  'number-decrease',
  'number-increase',
  'format',
  '|',
  'bold',
  'italic',
  'font-color',
  'background',
  'border',
  'merge-cell',
  '|',
  'horizontal-align',
  'text-wrap',
  '|',
  'freeze',
  'conditionFormat',
  'filter',
  'quick-formula',
  'splitColumn',
  'search',
];

const CELL_MENU = [
  'copy',
  'paste',
  '|',
  'insert-row',
  'insert-column',
  'delete-row',
  'delete-column',
  'delete-cell',
  'hide-row',
  'hide-column',
  'set-row-height',
  'set-column-width',
  '|',
  'clear',
  'sort',
  'orderAZ',
  'orderZA',
  'filter',
  'cell-format',
];

const cellText = (cell: { m?: unknown; v?: unknown } | null | undefined): string =>
  cell == null ? '' : String(cell.m ?? cell.v ?? '');

export default function SpreadsheetWorkbook({ sheets, onChange, ref }: SpreadsheetWorkbookProps) {
  const workbook = useRef<WorkbookInstance>(null);

  useImperativeHandle(ref, () => ({
    getSelectionValues() {
      const api = workbook.current;
      const range = api?.getSelection()?.[0];
      if (!api || !range) return null;
      const cells = api.getCellsByRange({ row: range.row, column: range.column });
      return cells.map((row) => row.map(cellText));
    },
  }));

  // Formuły wpisane po polsku (SUMA, JEŻELI, „;”) zamieniamy na nazwy rozumiane
  // przez arkusz. Zmianę robimy po zakończeniu edycji komórki.
  const hooks = useMemo(
    () => ({
      beforeUpdateCell: (r: number, c: number, value: unknown) => {
        const translated = translateInput(value);
        if (translated === null) return true;
        setTimeout(() => workbook.current?.setCellValue(r, c, translated));
        return false;
      },
    }),
    [],
  );

  return (
    <Workbook
      ref={workbook}
      data={sheets}
      onChange={onChange}
      hooks={hooks}
      lang="en"
      currency="zł"
      toolbarItems={TOOLBAR}
      cellContextMenu={CELL_MENU}
    />
  );
}
