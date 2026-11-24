/**
 * Porównywanie wyniku programu z oczekiwaną odpowiedzią.
 *
 * Zasady (opisane także w README):
 * 1. Wielkość liter, nadmiarowe spacje i puste linie są ignorowane.
 * 2. Przecinek dziesiętny jest traktowany jak kropka (`2,5` == `2.5`).
 * 3. Liczby dziesiętne są porównywane z dokładnością oczekiwanej odpowiedzi:
 *    oczekiwane `5.52` akceptuje `5.5216…` (różnica ≤ pół jednostki ostatniej cyfry).
 *    Liczby całkowite muszą zgadzać się dokładnie.
 * 4. Wynik jest poprawny, jeżeli każda linia oczekiwanej odpowiedzi występuje
 *    (w tej samej kolejności) w kolejnych liniach wyjścia programu – jako
 *    ciągły fragment tokenów. Dzięki temu `print("Odpowiedź:", 42)` zostanie
 *    zaliczone dla oczekiwanego `42`, ale `420` już nie.
 * 5. Jeśli odpowiedź składa się wyłącznie z liczb, układ linii nie ma znaczenia:
 *    wystarczy, że oczekiwane liczby występują w wyjściu kolejno, jedna po drugiej
 *    (opisy między nimi są pomijane). `10 12 14` == `10
12
14`.
 */

/** Normalizuje pojedynczą linię tekstu. */
export function normalizeLine(line: string): string {
  return line
    .toLowerCase()
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Dzieli tekst na znormalizowane, niepuste linie. */
export function normalizeLines(text: string): string[] {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(normalizeLine)
    .filter((line) => line.length > 0);
}

/** Dzieli linię na tokeny: słowa i liczby, bez znaków interpunkcyjnych na brzegach. */
export function tokenize(line: string): string[] {
  return line
    .split(/[\s:;,=()[\]{}'"]+/)
    .map((token) => token.replace(/^[.!?-]+(?=\D)|[.!?]+$/g, ''))
    .filter((token) => token.length > 0);
}

const DECIMAL = /^-?\d+\.(\d+)$/;
const NUMBER = /^-?\d+(\.\d+)?(e[+-]?\d+)?$/;

/**
 * Porównuje dwa tokeny. Jeśli oczekiwany jest liczbą dziesiętną, akceptuje
 * wartość, która po zaokrągleniu do tylu samo miejsc daje oczekiwany wynik.
 */
export function tokensEqual(actual: string, expected: string): boolean {
  if (actual === expected) return true;
  const decimal = DECIMAL.exec(expected);
  if (!decimal || !NUMBER.test(actual)) return false;
  const places = decimal[1]!.length;
  const tolerance = 0.5 * 10 ** -places + 1e-9;
  return Math.abs(Number(actual) - Number(expected)) <= tolerance;
}

function containsSequence(haystack: string[], needle: string[]): boolean {
  if (needle.length === 0) return true;
  for (let start = 0; start + needle.length <= haystack.length; start++) {
    if (needle.every((token, i) => tokensEqual(haystack[start + i]!, token))) return true;
  }
  return false;
}

const isNumber = (token: string) => NUMBER.test(token);

/** Dopasowanie samych liczb, niezależnie od podziału na linie (zasada 5). */
function numbersMatch(actualLines: string[], expectedLines: string[]): boolean {
  const expected = expectedLines.flatMap(tokenize);
  if (expected.length === 0 || !expected.every(isNumber)) return false;
  const actual = actualLines.flatMap(tokenize).filter(isNumber);
  return containsSequence(actual, expected);
}

/** Sprawdza, czy wyjście programu zawiera oczekiwaną odpowiedź. */
export function outputMatches(actual: string, expected: string): boolean {
  const expectedLines = normalizeLines(expected);
  const actualLines = normalizeLines(actual);
  if (expectedLines.length === 0) return actualLines.length === 0;
  return linesMatch(actualLines, expectedLines) || numbersMatch(actualLines, expectedLines);
}

/** Dopasowanie linia po linii (zasada 4). */
function linesMatch(actualLines: string[], expectedLines: string[]): boolean {
  let cursor = 0;
  for (const line of expectedLines) {
    const needle = tokenize(line);
    let found = false;
    while (cursor < actualLines.length) {
      const candidate = tokenize(actualLines[cursor]!);
      cursor++;
      if (containsSequence(candidate, needle)) {
        found = true;
        break;
      }
    }
    if (!found) return false;
  }
  return true;
}
