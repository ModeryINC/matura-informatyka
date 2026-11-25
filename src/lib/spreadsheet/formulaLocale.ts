/**
 * Polskie nazwy funkcji Excela → nazwy w arkuszu na stronie (angielskie).
 *
 * Na maturze zwykle używa się polskiego Excela, więc formułę można wpisać po polsku,
 * np. `=LICZ.WARUNKI(B:B;">100";C:C;"Z")` – przy zatwierdzeniu komórki zamieniamy
 * nazwy funkcji, średniki na przecinki i przecinek dziesiętny na kropkę.
 */
export const POLISH_FUNCTIONS: Record<string, string> = {
  SUMA: 'SUM',
  'SUMA.JEŻELI': 'SUMIF',
  'SUMA.WARUNKÓW': 'SUMIFS',
  'SUMA.ILOCZYNÓW': 'SUMPRODUCT',
  ŚREDNIA: 'AVERAGE',
  'ŚREDNIA.JEŻELI': 'AVERAGEIF',
  'ŚREDNIA.WARUNKÓW': 'AVERAGEIFS',
  'ILE.LICZB': 'COUNT',
  'ILE.NIEPUSTYCH': 'COUNTA',
  'LICZ.PUSTE': 'COUNTBLANK',
  'LICZ.JEŻELI': 'COUNTIF',
  'LICZ.WARUNKI': 'COUNTIFS',
  MAX: 'MAX',
  MIN: 'MIN',
  'MAX.K': 'LARGE',
  'MIN.K': 'SMALL',
  MEDIANA: 'MEDIAN',
  'WYST.NAJCZĘŚCIEJ': 'MODE',
  POZYCJA: 'RANK',
  JEŻELI: 'IF',
  'JEŻELI.BŁĄD': 'IFERROR',
  ORAZ: 'AND',
  LUB: 'OR',
  NIE: 'NOT',
  PRAWDA: 'TRUE',
  FAŁSZ: 'FALSE',
  'CZY.PUSTA': 'ISBLANK',
  'CZY.LICZBA': 'ISNUMBER',
  'CZY.TEKST': 'ISTEXT',
  'CZY.BŁĄD': 'ISERROR',
  ZAOKR: 'ROUND',
  'ZAOKR.DÓŁ': 'ROUNDDOWN',
  'ZAOKR.GÓRA': 'ROUNDUP',
  'ZAOKR.DO.CAŁK': 'INT',
  'LICZBA.CAŁK': 'TRUNC',
  'MODUŁ.LICZBY': 'ABS',
  MOD: 'MOD',
  POTĘGA: 'POWER',
  PIERWIASTEK: 'SQRT',
  ILOCZYN: 'PRODUCT',
  'ZAOKR.DO.TEKST': 'FIXED',
  DATA: 'DATE',
  ROK: 'YEAR',
  MIESIĄC: 'MONTH',
  DZIEŃ: 'DAY',
  'DZIEŃ.TYG': 'WEEKDAY',
  'NUM.TYG': 'WEEKNUM',
  'ISO.NUM.TYG': 'ISOWEEKNUM',
  DNI: 'DAYS',
  'DNI.ROBOCZE': 'NETWORKDAYS',
  'NR.SER.OST.DN.MIES': 'EOMONTH',
  'NR.SER.DATY': 'EDATE',
  DZIŚ: 'TODAY',
  'WYSZUKAJ.PIONOWO': 'VLOOKUP',
  'WYSZUKAJ.POZIOMO': 'HLOOKUP',
  WYSZUKAJ: 'LOOKUP',
  INDEKS: 'INDEX',
  'PODAJ.POZYCJĘ': 'MATCH',
  PRZESUNIĘCIE: 'OFFSET',
  'ADR.POŚR': 'INDIRECT',
  WYBIERZ: 'CHOOSE',
  WIERSZ: 'ROW',
  KOLUMNA: 'COLUMN',
  'ILE.WIERSZY': 'ROWS',
  'LICZBA.KOLUMN': 'COLUMNS',
  UNIKATOWE: 'UNIQUE',
  FILTRUJ: 'FILTER',
  SORTUJ: 'SORT',
  LEWY: 'LEFT',
  PRAWY: 'RIGHT',
  'FRAGMENT.TEKSTU': 'MID',
  DŁ: 'LEN',
  'ZŁĄCZ.TEKSTY': 'CONCATENATE',
  ZŁĄCZTEKSTY: 'CONCATENATE',
  TEKST: 'TEXT',
  WARTOŚĆ: 'VALUE',
  ZNAJDŹ: 'FIND',
  'SZUKAJ.TEKST': 'SEARCH',
  PODSTAW: 'SUBSTITUTE',
  ZASTĄP: 'REPLACE',
  'LITERY.WIELKIE': 'UPPER',
  'LITERY.MAŁE': 'LOWER',
  'Z.WIELKIEJ.LITERY': 'PROPER',
  'USUŃ.ZBĘDNE.ODSTĘPY': 'TRIM',
  POWT: 'REPT',
  KOD: 'CODE',
  ZNAK: 'CHAR',
  'DZIES.NA.DWÓJK': 'DEC2BIN',
  'DWÓJK.NA.DZIES': 'BIN2DEC',
  'DZIES.NA.SZESN': 'DEC2HEX',
  'SZESN.NA.DZIES': 'HEX2DEC',
  'DZIES.NA.ÓSM': 'DEC2OCT',
  'ÓSM.NA.DZIES': 'OCT2DEC',
};

/** Fragmenty formuły: teksty w cudzysłowach zostawiamy bez zmian. */
function splitStrings(formula: string): { text: string; quoted: boolean }[] {
  return formula.split(/("(?:[^"]|"")*")/).map((text, i) => ({ text, quoted: i % 2 === 1 }));
}

const NAME = /([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż][A-Za-z0-9ĄĆĘŁŃÓŚŹŻąćęłńóśźż.]*)(\s*\()/g;
const BOOLEAN = /\b(PRAWDA|FAŁSZ)\b(?!\s*\()/giu;

/** Tłumaczy formułę wpisaną po polsku; formuła po angielsku zostaje bez zmian. */
export function translateFormula(formula: string): string {
  if (!formula.startsWith('=')) return formula;
  const polishSeparators = splitStrings(formula).some(
    (part) => !part.quoted && part.text.includes(';'),
  );
  return splitStrings(formula)
    .map(({ text, quoted }) => {
      if (quoted) return text;
      let out = text.replace(NAME, (match, name: string, paren: string) => {
        const english = POLISH_FUNCTIONS[name.toLocaleUpperCase('pl')];
        return english ? english + paren : match;
      });
      out = out.replace(BOOLEAN, (word: string) => POLISH_FUNCTIONS[word.toLocaleUpperCase('pl')]!);
      if (polishSeparators) out = out.replace(/(\d),(\d)/g, '$1.$2').replace(/;/g, ',');
      return out;
    })
    .join('');
}

/**
 * Wartość wpisana do komórki: formuła po polsku → po angielsku, liczba z przecinkiem
 * dziesiętnym (`2,5`) → liczba. Zwraca `null`, gdy nie trzeba nic zmieniać.
 */
export function translateInput(value: unknown): string | number | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.startsWith('=')) {
    const translated = translateFormula(trimmed);
    return translated === trimmed ? null : translated;
  }
  if (/^-?\d+,\d+$/.test(trimmed)) return Number(trimmed.replace(',', '.'));
  return null;
}
