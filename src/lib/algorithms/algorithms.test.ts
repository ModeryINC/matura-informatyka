import { ALGORITHMS, algorithmsById, parseInput } from './index';
import type { ArrayView, Frame, InputValue, TableView, TextView, TreeView } from './types';

const defaults = (id: string) =>
  Object.fromEntries(algorithmsById.get(id)!.inputs.map((f) => [f.name, f.default]));
const run = (id: string, input: Record<string, InputValue> = defaults(id)) =>
  algorithmsById.get(id)!.run(input);
const last = (frames: Frame[]) => frames.at(-1)!;

describe.each(ALGORITHMS.map((a) => [a.id, a] as const))('%s', (_, algorithm) => {
  it('daje klatki z poprawnymi numerami linii i domyślnymi danymi w zakresie', () => {
    const frames = algorithm.run(
      Object.fromEntries(algorithm.inputs.map((f) => [f.name, f.default])),
    );
    expect(frames.length).toBeGreaterThan(1);
    for (const frame of frames) {
      expect(frame.line).toBeGreaterThanOrEqual(-1);
      expect(frame.line).toBeLessThan(algorithm.code.length);
      expect(frame.note).not.toBe('');
    }
    for (const field of algorithm.inputs) {
      const text = Array.isArray(field.default) ? field.default.join(', ') : String(field.default);
      expect(parseInput(field, text)).toEqual({ value: field.default });
    }
  });
});

test('identyfikatory są unikalne', () => {
  expect(algorithmsById.size).toBe(ALGORITHMS.length);
});

test('sortowania kończą się posortowaną tablicą', () => {
  const input = { t: [5, 3, 9, 1, 5, 0, 7, 2] };
  for (const id of ['babelkowe', 'wybieranie', 'wstawianie', 'scalanie', 'szybkie', 'zliczanie']) {
    const view = last(run(id, input)).view as ArrayView;
    expect(view.values, id).toEqual([0, 1, 2, 3, 5, 5, 7, 9]);
  }
});

test('wyszukiwanie znajduje element albo go nie znajduje', () => {
  const t = [3, 8, 12, 17, 23];
  expect(last(run('liniowe', { t, x: 17 })).note).toMatch(/pozycji 3/);
  expect(last(run('binarne', { t, x: 17 })).note).toMatch(/pozycji 3/);
  expect(last(run('binarne', { t, x: 4 })).note).toMatch(/nie ma/);
  expect(last(run('min-max', { t: [4, 9, 1, 7] })).note).toMatch(/Minimum = 1, maksimum = 9/);
});

test('algorytmy na liczbach dają poprawne wyniki', () => {
  expect(last(run('euklides', { a: 1071, b: 462 })).note).toMatch(/NWD = 21/);
  expect(last(run('sito', { n: 30 })).note).toMatch(/\(10\): 2, 3, 5, 7, 11, 13, 17, 19, 23, 29/);
  expect(last(run('pierwszosc', { n: 221 })).note).toMatch(/13 · 17/);
  expect(last(run('pierwszosc', { n: 97 })).note).toMatch(/pierwsza/);
  expect(last(run('czynniki', { n: 360 })).note).toBe('360 = 2 · 2 · 2 · 3 · 3 · 5.');
  expect(last(run('zamiana-systemu', { n: 186, p: 16 })).note).toMatch(/= BA /);
  expect(last(run('horner', { wsp: [2, -6, 2, -1], x: 3 })).note).toMatch(/wynosi 5\./);
  expect(last(run('szybkie-potegowanie', { a: 3, n: 13 })).note).toMatch(/3\^13 = 1594323/);
});

test('rekurencja buduje drzewo wywołań', () => {
  const fib = last(run('fibonacci', { n: 5 })).view as TreeView;
  expect(fib.nodes).toHaveLength(15);
  expect(fib.nodes[0]!.result).toBe('5');
  expect(fib.nodes.every((n) => n.state === 'done')).toBe(true);
  const fact = last(run('silnia', { n: 5 })).view as TreeView;
  expect(fact.nodes[0]!.result).toBe('120');
  const frames = run('hanoi', { n: 3 });
  expect(last(frames).note).toMatch(/7 = 2\^3 − 1/);
  expect(last(frames).view).toMatchObject({ pegs: [[], [], [3, 2, 1]] });
});

test('algorytmy tekstowe', () => {
  expect(last(run('palindrom', { s: 'kajak' })).note).toMatch(/jest palindromem/);
  expect(last(run('palindrom', { s: 'kajaki' })).note).toMatch(/nie palindrom/);
  expect(last(run('wzorzec', { tekst: 'abrakadabra', wzorzec: 'abra' })).note).toMatch(/0, 7/);
  expect(last(run('anagram', { a: 'karma', b: 'marka' })).note).toMatch(/to anagramy/);
  expect(last(run('anagram', { a: 'karma', b: 'marki' })).note).toMatch(/nie anagramy/);
  expect((last(run('palindrom', { s: 'oko' })).view as TextView).rows[0]!.chars).toEqual([
    'o',
    'k',
    'o',
  ]);
});

test('metody numeryczne i zachłanne', () => {
  expect(last(run('bisekcja', { c: 2, kroki: 25 })).note).toMatch(/1\.41421/);
  expect(last(run('bisekcja', { c: 0, kroki: 25 })).note).toMatch(/1\.52137/);
  expect(last(run('heron', { c: 10 })).note).toMatch(/3\.162277/);
  expect(last(run('pole-prostokaty', { n: 4 })).note).toMatch(/Prostokąty: 2\.625, trapezy: 2\.75/);
  const change = last(run('reszta', { kwota: 289, nominaly: [1, 2, 5, 10, 20, 50, 100, 200] }));
  expect((change.view as TableView).rows.map((r) => r[0])).toEqual([200, 50, 20, 10, 5, 2, 2]);
});

test('parseInput sprawdza dane', () => {
  const ints = {
    name: 't',
    label: 't',
    kind: 'ints' as const,
    min: 0,
    max: 9,
    minLength: 2,
    maxLength: 3,
    default: [1],
  };
  expect(parseInput(ints, '1, 2;3')).toEqual({ value: [1, 2, 3] });
  expect(parseInput(ints, '1')).toMatchObject({ error: expect.stringMatching(/Od 2 do 3/) });
  expect(parseInput(ints, '1, 20')).toMatchObject({ error: expect.stringMatching(/od 0 do 9/) });
  expect(parseInput(ints, '1, x')).toMatchObject({ error: expect.stringMatching(/oddzielone/) });
  const int = { name: 'n', label: 'n', kind: 'int' as const, min: 1, max: 5, default: 1 };
  expect(parseInput(int, '7')).toMatchObject({ error: expect.stringMatching(/od 1 do 5/) });
  expect(parseInput(int, 'a')).toMatchObject({ error: expect.stringMatching(/całkowitą/) });
  const text = { name: 's', label: 's', kind: 'text' as const, default: 'a' };
  expect(parseInput(text, '  ')).toMatchObject({ error: expect.stringMatching(/Wpisz/) });
  expect(parseInput(text, 'x'.repeat(30))).toMatchObject({ error: expect.stringMatching(/24/) });
});
