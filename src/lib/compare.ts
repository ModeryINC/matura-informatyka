/**
 * Porównywanie wyniku programu z oczekiwaną odpowiedzią.
 *
 * Zasady (opisane także w README):
 * 1. Wielkość liter, nadmiarowe spacje i puste linie są ignorowane.
 * 2. Przecinek dziesiętny jest traktowany jak kropka (`2,5` == `2.5`).
 * 3. Wynik jest poprawny, jeżeli każda linia oczekiwanej odpowiedzi występuje
 *    (w tej samej kolejności) w kolejnych liniach wyjścia programu – jako
 *    ciągły fragment tokenów. Dzięki temu `print("Odpowiedź:", 42)` zostanie
 *    zaliczone dla oczekiwanego `42`, ale `420` już nie.
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

function containsSequence(haystack: string[], needle: string[]): boolean {
  if (needle.length === 0) return true;
  for (let start = 0; start + needle.length <= haystack.length; start++) {
    if (needle.every((token, i) => haystack[start + i] === token)) return true;
  }
  return false;
}

/** Sprawdza, czy wyjście programu zawiera oczekiwaną odpowiedź. */
export function outputMatches(actual: string, expected: string): boolean {
  const expectedLines = normalizeLines(expected);
  const actualLines = normalizeLines(actual);
  if (expectedLines.length === 0) return actualLines.length === 0;

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
