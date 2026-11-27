/** Wszystkie algorytmy z wizualizacją, w kolejności na stronie. */
import { GREEDY } from './greedy';
import { NUMBERS } from './numbers';
import { NUMERIC } from './numeric';
import { RECURSION } from './recursion';
import { SEARCHING } from './searching';
import { SORTING } from './sorting';
import { TEXT } from './text';
import type { AlgorithmDef, InputField, InputValue } from './types';

export const ALGORITHMS: AlgorithmDef[] = [
  ...SORTING,
  ...SEARCHING,
  ...NUMBERS,
  ...RECURSION,
  ...TEXT,
  ...NUMERIC,
  ...GREEDY,
];

export const algorithmsById = new Map(ALGORITHMS.map((a) => [a.id, a]));

export type ParsedInput = { value: InputValue } | { error: string };

/** Wartość pola z tekstu wpisanego przez ucznia albo komunikat błędu. */
export function parseInput(field: InputField, text: string): ParsedInput {
  const range = (n: number) =>
    (field.min === undefined || n >= field.min) && (field.max === undefined || n <= field.max);
  const rangeText = `od ${field.min} do ${field.max}`;
  if (field.kind === 'text') {
    const value = text.trim();
    if (value === '') return { error: 'Wpisz tekst.' };
    if (value.length > 24) return { error: 'Najwyżej 24 znaki.' };
    return { value };
  }
  if (field.kind === 'int') {
    if (!/^-?\d+$/.test(text.trim())) return { error: 'Wpisz liczbę całkowitą.' };
    const n = Number(text);
    return range(n) ? { value: n } : { error: `Liczba ${rangeText}.` };
  }
  const parts = text.split(/[\s,;]+/).filter(Boolean);
  if (!parts.every((p) => /^-?\d+$/.test(p)))
    return { error: 'Wpisz liczby całkowite oddzielone przecinkami.' };
  const values = parts.map(Number);
  if (values.length < (field.minLength ?? 1) || values.length > (field.maxLength ?? 20))
    return { error: `Od ${field.minLength ?? 1} do ${field.maxLength ?? 20} liczb.` };
  return values.every(range) ? { value: values } : { error: `Liczby ${rangeText}.` };
}

export const formatInput = (value: InputValue) =>
  Array.isArray(value) ? value.join(', ') : String(value);
