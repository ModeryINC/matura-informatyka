/**
 * Obliczenia do interaktywnych narzędzi w „Podstawach teorii”: systemy liczbowe,
 * kod U2, adresacja IPv4, kolory, szyfr Cezara, RSA na małych liczbach i bramki
 * logiczne. Czyste funkcje – testowane w `tools.test.ts`.
 */

const DIGITS = '0123456789ABCDEF';

/** Liczba naturalna zapisana w systemie o podstawie 2–16 albo `null`, gdy zapis jest błędny. */
export function parseInBase(text: string, base: number): number | null {
  const clean = text.trim().toUpperCase().replace(/\s+/g, '');
  if (clean === '' || clean.length > 40) return null;
  let value = 0;
  for (const ch of clean) {
    const digit = DIGITS.indexOf(ch);
    if (digit < 0 || digit >= base) return null;
    value = value * base + digit;
  }
  return Number.isSafeInteger(value) ? value : null;
}

export function toBase(value: number, base: number): string {
  return value.toString(base).toUpperCase();
}

/** Kolejne dzielenia przez podstawę (zamiana z systemu dziesiętnego): [iloraz, reszta]. */
export function divisionSteps(
  value: number,
  base: number,
): { quotient: number; remainder: number }[] {
  const steps: { quotient: number; remainder: number }[] = [];
  let n = value;
  do {
    steps.push({ quotient: Math.floor(n / base), remainder: n % base });
    n = Math.floor(n / base);
  } while (n > 0);
  return steps;
}

/** Rozwinięcie liczby jako suma cyfr razy potęgi podstawy, np. `1·2³ + 0·2² + …`. */
export function positionalTerms(text: string): { digit: number; power: number }[] {
  const clean = text.trim().toUpperCase();
  return [...clean].map((ch, i) => ({ digit: DIGITS.indexOf(ch), power: clean.length - 1 - i }));
}

/** Kod uzupełnień do dwóch na `bits` bitach (`null`, gdy liczba się nie mieści). */
export function toU2(value: number, bits: number): string | null {
  const min = -(2 ** (bits - 1));
  const max = 2 ** (bits - 1) - 1;
  if (!Number.isInteger(value) || value < min || value > max) return null;
  const unsigned = value < 0 ? 2 ** bits + value : value;
  return unsigned.toString(2).padStart(bits, '0');
}

/** Wartość liczby zapisanej w kodzie U2 (pierwszy bit ma wagę ujemną). */
export function fromU2(bitsText: string): number | null {
  if (!/^[01]{2,32}$/.test(bitsText)) return null;
  const n = bitsText.length;
  const unsigned = parseInt(bitsText, 2);
  return bitsText[0] === '1' ? unsigned - 2 ** n : unsigned;
}

// --- Adresacja IPv4 -------------------------------------------------------

export function parseIPv4(text: string): number | null {
  const parts = text.trim().split('.');
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part) || Number(part) > 255) return null;
    value = value * 256 + Number(part);
  }
  return value;
}

export function formatIPv4(value: number): string {
  return [24, 16, 8, 0].map((shift) => Math.floor(value / 2 ** shift) % 256).join('.');
}

export const ipv4Binary = (value: number) =>
  [24, 16, 8, 0]
    .map((shift) => (Math.floor(value / 2 ** shift) % 256).toString(2).padStart(8, '0'))
    .join('.');

/** Długość prefiksu z maski (`255.255.255.0` → 24) albo `null`, gdy maska jest niepoprawna. */
export function prefixFromMask(mask: string): number | null {
  const value = parseIPv4(mask);
  if (value === null) return null;
  const bits = value.toString(2).padStart(32, '0');
  return /^1*0*$/.test(bits) ? (bits.indexOf('0') === -1 ? 32 : bits.indexOf('0')) : null;
}

export const maskFromPrefix = (prefix: number) => (prefix === 0 ? 0 : 2 ** 32 - 2 ** (32 - prefix));

export interface SubnetInfo {
  prefix: number;
  mask: string;
  network: string;
  broadcast: string;
  firstHost: string | null;
  lastHost: string | null;
  /** Liczba adresów dla hostów (bez adresu sieci i rozgłoszeniowego). */
  hosts: number;
}

export function subnet(address: number, prefix: number): SubnetInfo {
  const size = 2 ** (32 - prefix);
  const network = Math.floor(address / size) * size;
  const broadcast = network + size - 1;
  const usable = prefix >= 31;
  return {
    prefix,
    mask: formatIPv4(maskFromPrefix(prefix)),
    network: formatIPv4(network),
    broadcast: formatIPv4(broadcast),
    firstHost: usable ? null : formatIPv4(network + 1),
    lastHost: usable ? null : formatIPv4(broadcast - 1),
    hosts: usable ? 0 : size - 2,
  };
}

// --- Kolory -----------------------------------------------------------------

export function parseHexColor(text: string): [number, number, number] | null {
  const match = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(text.trim());
  if (!match) return null;
  const hex = match[1]!.length === 3 ? [...match[1]!].map((c) => c + c).join('') : match[1]!;
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

export const toHexColor = (rgb: [number, number, number]) =>
  `#${rgb
    .map((c) => c.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;

// --- Szyfry ------------------------------------------------------------------

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Szyfr Cezara na alfabecie łacińskim (26 liter); inne znaki zostają bez zmian. */
export function caesar(text: string, shift: number): string {
  const k = ((shift % 26) + 26) % 26;
  return [...text]
    .map((ch) => {
      const upper = ch.toUpperCase();
      const index = ALPHABET.indexOf(upper);
      if (index < 0) return ch;
      const out = ALPHABET[(index + k) % 26]!;
      return ch === upper ? out : out.toLowerCase();
    })
    .join('');
}

export function gcd(a: number, b: number): number {
  while (b !== 0) [a, b] = [b, a % b];
  return Math.abs(a);
}

export function isPrime(n: number): boolean {
  if (n < 2 || !Number.isInteger(n)) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
}

/** Odwrotność `a` modulo `m` (rozszerzony algorytm Euklidesa) albo `null`. */
export function modInverse(a: number, m: number): number | null {
  let [oldR, r] = [a, m];
  let [oldS, s] = [1, 0];
  while (r !== 0) {
    const q = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  return oldR === 1 ? ((oldS % m) + m) % m : null;
}

/** `base^exp mod m` (szybkie potęgowanie; liczby do ok. 10⁷, bez przepełnienia). */
export function modPow(base: number, exp: number, m: number): number {
  let result = 1;
  let b = base % m;
  let e = exp;
  while (e > 0) {
    if (e % 2 === 1) result = (result * b) % m;
    b = (b * b) % m;
    e = Math.floor(e / 2);
  }
  return result;
}

export interface RsaKeys {
  n: number;
  phi: number;
  e: number;
  d: number;
}

/** Klucze RSA dla małych liczb pierwszych `p`, `q` (najmniejsze `e` względnie pierwsze z φ). */
export function rsaKeys(p: number, q: number): RsaKeys | null {
  if (!isPrime(p) || !isPrime(q) || p === q || p * q > 10_000) return null;
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  let e = 3;
  while (e < phi && gcd(e, phi) !== 1) e += 2;
  const d = modInverse(e, phi);
  return d === null ? null : { n, phi, e, d };
}

// --- Bramki logiczne --------------------------------------------------------

export const GATES = {
  AND: (a: boolean, b: boolean) => a && b,
  OR: (a: boolean, b: boolean) => a || b,
  XOR: (a: boolean, b: boolean) => a !== b,
  NAND: (a: boolean, b: boolean) => !(a && b),
  NOR: (a: boolean, b: boolean) => !(a || b),
} as const;

export type GateName = keyof typeof GATES;

// --- Rozmiar obrazu ---------------------------------------------------------

/** Rozmiar nieskompresowanej bitmapy w bajtach. */
export const bitmapBytes = (width: number, height: number, bitsPerPixel: number) =>
  (width * height * bitsPerPixel) / 8;

/** Liczba bitów potrzebna do zakodowania `n` różnych symboli: ⌈log₂ n⌉. */
export const bitsForSymbols = (n: number) => (n <= 1 ? 0 : Math.ceil(Math.log2(n)));
