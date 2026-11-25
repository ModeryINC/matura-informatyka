/**
 * Wykrywanie w kodzie ucznia konstrukcji zakazanych w treści zadania
 * („zabronione jest używanie funkcji wbudowanych…”).
 *
 * To heurystyka na tekście (bez parsera Pythona): pomija komentarze i napisy,
 * a funkcje zdefiniowane przez ucznia (`def min(...)`) nie są zgłaszane.
 * Wynik służy wyłącznie do ostrzeżenia – nie wpływa na zaliczenie testów.
 * `range`, `len` i `print` są dozwolone: odpowiadają pętlom i wypisywaniu
 * z pseudokodu w arkuszu.
 */
import type { RestrictionToken, TaskRestrictions } from '../types';

/** Funkcje wbudowane wywoływane jako `nazwa(...)`. */
export const FORBIDDEN_FUNCTIONS = [
  'sorted',
  'sum',
  'min',
  'max',
  'pow',
  'abs',
  'divmod',
  'round',
  'str',
  'int',
  'float',
  'bin',
  'oct',
  'hex',
  'reversed',
  'map',
  'filter',
  'list',
  'set',
  'dict',
  'tuple',
  'any',
  'all',
  'zip',
  'format',
  'sqrt',
  'ceil',
  'floor',
  'log',
] as const;

/** Metody wywoływane jako `.nazwa(...)`. */
export const FORBIDDEN_METHODS = [
  'sort',
  'reverse',
  'join',
  'split',
  'count',
  'index',
  'find',
  'replace',
  'format',
  'upper',
  'lower',
  'isdigit',
  'zfill',
] as const;

const TOKEN_LABELS: Record<RestrictionToken, string> = {
  '**': 'potęgowanie **',
  '[:]': 'wycinki t[a:b]',
  '[]': 'listy/tablice [ ]',
};

/** Usuwa komentarze i zawartość napisów (zostawia puste cudzysłowy). */
export function stripCommentsAndStrings(code: string): string {
  return code.replace(
    /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|#[^\n]*)/g,
    (match) => (match.startsWith('#') ? '' : '""'),
  );
}

/**
 * Zwraca listę zakazanych konstrukcji użytych w kodzie (bez powtórzeń,
 * w kolejności wystąpienia), np. `["sorted()", ".split()", "potęgowanie **"]`.
 */
export function findForbidden(code: string, restrictions: TaskRestrictions | undefined): string[] {
  if (!restrictions) return [];
  const source = stripCommentsAndStrings(code);
  const defined = new Set([...source.matchAll(/\bdef\s+(\w+)/g)].map((m) => m[1]));
  const found: { at: number; label: string }[] = [];
  const add = (at: number, label: string) => {
    if (!found.some((item) => item.label === label)) found.push({ at, label });
  };

  for (const match of source.matchAll(/(\.?)\b([A-Za-z_]\w*)\s*\(/g)) {
    const [, dot, name = ''] = match;
    const isMethod = dot === '.';
    if (isMethod && (FORBIDDEN_METHODS as readonly string[]).includes(name)) {
      add(match.index, `.${name}()`);
    } else if (
      !isMethod &&
      !defined.has(name) &&
      (FORBIDDEN_FUNCTIONS as readonly string[]).includes(name)
    ) {
      add(match.index, `${name}()`);
    }
  }
  for (const match of source.matchAll(/^\s*(?:import|from)\s+\w+/gm)) add(match.index, 'import');

  for (const token of restrictions.also ?? []) {
    const pattern = token === '**' ? /\*\*/ : token === '[:]' ? /\[[^\]\n]*:[^\]\n]*\]/ : /\[/;
    const match = pattern.exec(source);
    if (match) add(match.index, TOKEN_LABELS[token]);
  }
  return found.sort((a, b) => a.at - b.at).map((item) => item.label);
}
