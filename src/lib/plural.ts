/**
 * Polska odmiana rzeczownika po liczebniku: 1 podpunkt, 2–4 podpunkty, 5 podpunktów
 * (także 12–14 → „podpunktów”, 22–24 → „podpunkty”).
 */
export function plural(count: number, one: string, few: string, many: string): string {
  if (count === 1) return one;
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  return lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14) ? few : many;
}
