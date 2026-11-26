/**
 * Sprawdzanie odpowiedzi do zadań z arkusza kalkulacyjnego.
 *
 * Odpowiedź może być liczbą, datą albo tekstem – rodzaj wynika z odpowiedzi oczekiwanej:
 * - liczby: spacje (separator tysięcy) i jednostki (`zł`, `kg`, `razy`) są pomijane,
 *   przecinek dziesiętny = kropka; liczby całkowite muszą się zgadzać dokładnie,
 *   ułamki – z dokładnością do pół jednostki ostatniej cyfry klucza (`1,1` akceptuje `1,13`),
 * - daty: `2035-12-13`, `13.12.2035`, `13-12-2035`, `13/12/2035` i numer seryjny daty
 *   z arkusza (np. `49291`) oznaczają to samo; podobnie daty z godziną
 *   (`2019-05-22 16:00`, `22.05.2019 16:00`),
 * - tekst: bez względu na wielkość liter, nadmiarowe spacje i polskie znaki.
 */
import type { AnswerList, SpreadsheetField, SpreadsheetTable } from '../../types';

const ISO_DATE = /^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/;
const PL_DATE = /^(\d{1,2})[-./](\d{1,2})[-./](\d{4})$/;
/** Liczba z opcjonalnymi spacjami tysięcy i jednostką na końcu. */
const NUMBER =
  /^([-+]?\d{1,3}(?:\s\d{3})+|[-+]?\d+)([.,]\d+)?\s*(?:zł|zl|kg|m2|m²|%|razy|dni|dzień)?\.?$/i;

/** Dzień 0 numeracji dat w arkuszach (1899-12-30, jak w Excelu). */
const SERIAL_EPOCH = Date.UTC(1899, 11, 30);
const DAY_MS = 86_400_000;

export function parseNumber(text: string): number | null {
  const match = NUMBER.exec(text.trim());
  if (!match) return null;
  const value = Number(`${match[1]!.replace(/\s/g, '')}${(match[2] ?? '').replace(',', '.')}`);
  return Number.isFinite(value) ? value : null;
}

/** Liczba cyfr po przecinku w zapisie liczby. */
function decimals(text: string): number {
  return /[.,](\d+)/.exec(text.trim())?.[1]?.length ?? 0;
}

/** Data jako `rrrr-mm-dd` albo `null`. */
export function parseDate(text: string): string | null {
  const value = text.trim();
  let y: number, m: number, d: number;
  const iso = ISO_DATE.exec(value);
  const pl = PL_DATE.exec(value);
  if (iso) [y, m, d] = [Number(iso[1]), Number(iso[2]), Number(iso[3])];
  else if (pl) [y, m, d] = [Number(pl[3]), Number(pl[2]), Number(pl[1])];
  else return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return date.toISOString().slice(0, 10);
}

/** Godzina `g:mm` lub `g:mm:00` jako liczba minut od północy albo `null`. */
export function parseClock(text: string): number | null {
  const match = /^(\d{1,2}):(\d{2})(?::00)?$/.exec(text.trim());
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

/**
 * Data z godziną jako `rrrr-mm-dd gg:mm` (z `:ss`, gdy sekundy nie są zerowe) albo `null`
 * (np. `22.05.2019 16:00`, `2019-05-22 4:00`, `06-11-2015 12:38:46`).
 */
export function parseDateTime(text: string): string | null {
  const match = /^(\S+)[ T]+(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(text.trim());
  const day = match ? parseDate(match[1]!) : null;
  if (!match || !day || Number(match[2]) > 23 || Number(match[3]) > 59) return null;
  const seconds = match[4] && match[4] !== '00' ? `:${match[4]}` : '';
  return `${day} ${match[2]!.padStart(2, '0')}:${match[3]}${seconds}`;
}

/** Numer seryjny daty (jak w Excelu) → `rrrr-mm-dd`. */
export function serialToIso(serial: number): string {
  return new Date(SERIAL_EPOCH + Math.round(serial) * DAY_MS).toISOString().slice(0, 10);
}

/** `rrrr-mm-dd` → numer seryjny daty. */
export function isoToSerial(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return Math.round((Date.UTC(y, m - 1, d) - SERIAL_EPOCH) / DAY_MS);
}

/** Tekst bez względu na wielkość liter, odstępy i polskie znaki (pliki CKE bywają bez nich). */
const normalizeText = (text: string) =>
  text
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('pl')
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/** Czy odpowiedź `actual` zgadza się z jedną oczekiwaną wartością. */
export function valueMatches(actual: string, expected: string, tolerance?: number): boolean {
  if (actual.trim() === '') return false;

  const expectedTime = parseClock(expected);
  if (expectedTime !== null) {
    const asTime = parseClock(actual);
    if (asTime !== null) return asTime === expectedTime;
    // Komórka z godziną bez formatu pokazuje ułamek doby.
    const fraction = parseNumber(actual);
    return fraction !== null && fraction < 1 && Math.round(fraction * 1440) === expectedTime;
  }

  const expectedDateTime = parseDateTime(expected);
  if (expectedDateTime) {
    const asDateTime = parseDateTime(actual);
    if (asDateTime) return asDateTime === expectedDateTime;
    // Komórka z datą i godziną bez formatu pokazuje numer seryjny z ułamkiem doby.
    const serial = parseNumber(actual);
    if (serial === null) return false;
    const minutes = Math.round((serial - Math.floor(serial)) * 1440);
    const clock = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    return `${serialToIso(Math.floor(serial))} ${clock}` === expectedDateTime;
  }

  const expectedDate = parseDate(expected);
  if (expectedDate) {
    const asDate = parseDate(actual);
    if (asDate) return asDate === expectedDate;
    // Komórka z datą bez formatu pokazuje numer seryjny.
    const serial = parseNumber(actual);
    return serial !== null && Number.isInteger(serial) && serialToIso(serial) === expectedDate;
  }

  const expectedNumber = parseNumber(expected);
  if (expectedNumber !== null) {
    const value = parseNumber(actual);
    if (value === null) return false;
    // Liczby całkowite muszą się zgadzać dokładnie, ułamki – z dokładnością klucza.
    const places = decimals(expected);
    const allowed = tolerance ?? (places === 0 ? 0 : 0.5 * 10 ** -places);
    return Math.abs(value - expectedNumber) <= allowed + 1e-9;
  }

  return normalizeText(actual) === normalizeText(expected);
}

export function fieldMatches(actual: string, field: SpreadsheetField): boolean {
  return [field.expected, ...(field.alternatives ?? [])].some((expected) =>
    valueMatches(actual, expected, field.tolerance),
  );
}

/** Wynik sprawdzenia zestawienia: poprawność każdej komórki. */
export function tableMatches(actual: string[][], table: SpreadsheetTable): boolean[][] {
  return table.expected.map((row, r) =>
    row.map((expected, c) => valueMatches(actual[r]?.[c] ?? '', expected, table.tolerance)),
  );
}

/**
 * Dopasowuje zaznaczony w arkuszu zakres do zestawienia. Zaznaczenie może zawierać
 * podpisy wierszy lub kolumn (są wtedy pomijane) i może być transponowane
 * (miesiące w kolumnach zamiast w wierszach). Zwraca wartości w układzie zestawienia
 * albo `null`, gdy rozmiar zaznaczenia nie pasuje.
 */
export function fitSelection(selection: string[][], table: SpreadsheetTable): string[][] | null {
  const rows = table.rows.length;
  const cols = table.columns.length;
  const transpose = (m: string[][]) => (m[0] ?? []).map((_, c) => m.map((row) => row[c] ?? ''));

  const candidates: string[][][] = [];
  for (const matrix of [selection, transpose(selection)]) {
    const height = matrix.length;
    const width = matrix[0]?.length ?? 0;
    for (const top of [0, 1]) {
      for (const left of [0, 1]) {
        if (height - top !== rows || width - left !== cols) continue;
        candidates.push(matrix.slice(top).map((row) => row.slice(left)));
      }
    }
  }
  if (candidates.length === 0) return null;
  // Gdy pasuje kilka układów, wybieramy ten z największą liczbą trafień.
  const score = (m: string[][]) => tableMatches(m, table).flat().filter(Boolean).length;
  return candidates.reduce((best, m) => (score(m) > score(best) ? m : best));
}

export interface ListCheck {
  passed: boolean;
  /** Liczba oczekiwanych wierszy znalezionych w odpowiedzi. */
  matched: number;
  /** Liczba niepustych wierszy odpowiedzi. */
  rows: number;
}

/** Wszystkie różnowartościowe przyporządkowania `k` kolumn klucza kolumnom odpowiedzi. */
function columnMappings(k: number, width: number): number[][] {
  const result: number[][] = [];
  const pick = (current: number[]) => {
    if (current.length === k) {
      result.push(current);
      return;
    }
    for (let c = 0; c < width; c += 1) if (!current.includes(c)) pick([...current, c]);
  };
  pick([]);
  return result;
}

/**
 * Sprawdza listę wierszy (np. wynik zapytania): kolejność wierszy i kolumn nie ma
 * znaczenia, odpowiedź może mieć dodatkowe kolumny (np. identyfikatory), ale musi
 * mieć dokładnie tyle wierszy, ile klucz.
 */
export function listMatches(actual: string[][], list: AnswerList): ListCheck {
  const rows = actual.filter((row) => row.some((value) => value.trim() !== ''));
  const width = Math.min(10, Math.max(0, ...rows.map((row) => row.length)));
  const k = list.columns.length;
  let best = 0;
  if (width >= k) {
    for (const mapping of columnMappings(k, width)) {
      const used = new Set<number>();
      let matched = 0;
      for (const expected of list.expected) {
        const index = rows.findIndex(
          (row, i) =>
            !used.has(i) &&
            expected.every((value, c) =>
              valueMatches(row[mapping[c]!] ?? '', value, list.tolerance),
            ),
        );
        if (index !== -1) {
          used.add(index);
          matched += 1;
        }
      }
      best = Math.max(best, matched);
      if (best === list.expected.length) break;
    }
  }
  return {
    passed: best === list.expected.length && rows.length === list.expected.length,
    matched: best,
    rows: rows.length,
  };
}
