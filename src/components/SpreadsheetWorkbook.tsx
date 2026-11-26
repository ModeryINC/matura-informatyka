/**
 * Arkusz kalkulacyjny w przeglądarce (Fortune Sheet, licencja MIT). Ładowany
 * leniwie – biblioteka jest duża, a potrzebna tylko w zakładce „Excel”.
 */
import { Workbook, type WorkbookInstance } from '@fortune-sheet/react';
import '@fortune-sheet/react/dist/index.css';
import {
  escapeHTMLTag,
  escapeScriptTag,
  functionHTMLGenerate,
  locale,
  type Sheet,
} from '@fortune-sheet/core';
import { useEffect, useImperativeHandle, useMemo, useRef, type Ref } from 'react';
import {
  ENGLISH_FUNCTIONS,
  toPolishFormula,
  translateInput,
} from '../lib/spreadsheet/formulaLocale';

// Lista funkcji (podpowiedzi przy wpisywaniu, opis argumentów, okno „wstaw
// funkcję”) z polskimi nazwami – wybrana funkcja trafia do formuły po polsku.
for (const item of locale({ lang: 'en' } as Parameters<typeof locale>[0]).functionlist) {
  item.n = ENGLISH_FUNCTIONS[item.n] ?? item.n;
}

/** Edytory, w których arkusz pokazuje formułę: pasek formuły i edytor komórki. */
const EDITORS = '.fortune-fx-input, .luckysheet-cell-input';

/**
 * Po zaznaczeniu komórki albo rozpoczęciu edycji arkusz wpisuje do edytora
 * zapisaną formułę (po angielsku). Zamieniamy ją na polską – tylko wtedy, gdy
 * edytor pokazuje dokładnie zapisaną formułę, więc tekstu wpisywanego przez
 * użytkownika nie ruszamy.
 */
function localizeEditor(editor: Element, formula: string) {
  if (!formula.startsWith('=') || editor.textContent !== formula) return;
  const polish = toPolishFormula(formula);
  if (polish !== formula) {
    editor.innerHTML = functionHTMLGenerate(escapeHTMLTag(escapeScriptTag(polish)));
  }
}

/** Sterowanie arkuszem z zewnątrz (np. „wstaw z zaznaczenia”). */
export interface SpreadsheetHandle {
  /** Wartości zaznaczonego zakresu tak, jak są wyświetlane; `null` – brak zaznaczenia. */
  getSelectionValues(): string[][] | null;
  /** Aktualna zawartość wszystkich kart (np. do eksportu); `null` – arkusz niegotowy. */
  getSheets(): Sheet[] | null;
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
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const observer = new MutationObserver((mutations) => {
      const editors = new Set(
        mutations
          .map(({ target }) => target)
          .filter(
            (target): target is Element => target instanceof Element && target.matches(EDITORS),
          ),
      );
      if (editors.size === 0) return;
      const api = workbook.current;
      const range = api?.getSelection()?.[0];
      const [row] = range?.row ?? [];
      const [column] = range?.column ?? [];
      if (!api || row === undefined || column === undefined) return;
      // Surowa formuła z komórki (getCellValue zwraca ją pokolorowaną, jako HTML).
      const formula = api.getCellsByRange({ row: [row, row], column: [column, column] })[0]?.[0]?.f;
      if (typeof formula !== 'string') return;
      for (const editor of editors) localizeEditor(editor, formula);
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useImperativeHandle(ref, () => ({
    getSelectionValues() {
      const api = workbook.current;
      const range = api?.getSelection()?.[0];
      if (!api || !range) return null;
      const cells = api.getCellsByRange({ row: range.row, column: range.column });
      return cells.map((row) => row.map(cellText));
    },
    getSheets() {
      return workbook.current?.getAllSheets() ?? null;
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
    <div ref={container} className="xl-workbook-host">
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
    </div>
  );
}
