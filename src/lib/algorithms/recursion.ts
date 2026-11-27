import type { AlgorithmDef, Frame, TreeNode } from './types';

/** Pomocnik do budowania drzewa wywołań: węzły pojawiają się w kolejności wywołań. */
function treeRecorder() {
  const nodes: TreeNode[] = [];
  const frames: Frame[] = [];
  return {
    nodes,
    frames,
    call(parent: number | null, label: string) {
      const id = nodes.length;
      if (parent !== null) nodes[parent]!.state = 'waiting';
      nodes.push({ id, parent, label, state: 'active' });
      return id;
    },
    finish(id: number, result: string) {
      nodes[id] = { ...nodes[id]!, state: 'done', result };
      const parent = nodes[id]!.parent;
      if (parent !== null) nodes[parent]!.state = 'active';
    },
    snap(line: number, note: string, vars: Record<string, string | number> = {}) {
      frames.push({
        view: { kind: 'tree', nodes: nodes.map((n) => ({ ...n })) },
        line,
        note,
        vars,
      });
    },
  };
}

export const factorial: AlgorithmDef = {
  id: 'silnia',
  title: 'Silnia rekurencyjnie',
  category: 'Rekurencja',
  intro: [
    'Funkcja rekurencyjna wywołuje samą siebie dla mniejszego argumentu i ma **warunek stopu**. n! = n · (n − 1)!, a 0! = 1. Wywołania czekają na stosie, aż najgłębsze zwróci wynik – potem wyniki „wracają” w górę.',
  ],
  complexity: 'O(n) wywołań i O(n) pamięci na stosie wywołań.',
  code: ['def silnia(n):', '    if n == 0:', '        return 1', '    return n * silnia(n - 1)'],
  inputs: [{ name: 'n', label: 'n', kind: 'int', min: 0, max: 10, default: 5 }],
  run({ n }) {
    const rec = treeRecorder();
    const go = (k: number, parent: number | null): number => {
      const id = rec.call(parent, `silnia(${k})`);
      rec.snap(
        k === 0 ? 1 : 3,
        k === 0 ? 'silnia(0) – warunek stopu.' : `silnia(${k}) potrzebuje silnia(${k - 1}).`,
        { n: k },
      );
      const value = k === 0 ? 1 : k * go(k - 1, id);
      rec.finish(id, String(value));
      rec.snap(
        k === 0 ? 2 : 3,
        k === 0 ? 'Zwracamy 1.' : `silnia(${k}) = ${k} · ${value / k} = ${value}.`,
        { n: k },
      );
      return value;
    };
    go(n as number, null);
    return rec.frames;
  },
};

export const fibonacci: AlgorithmDef = {
  id: 'fibonacci',
  title: 'Ciąg Fibonacciego – drzewo rekurencji',
  category: 'Rekurencja',
  intro: [
    'F(0) = 0, F(1) = 1, F(n) = F(n − 1) + F(n − 2). Naiwna rekurencja liczy te same wartości wiele razy – w drzewie widać, że np. F(2) pojawia się wielokrotnie, a liczba wywołań rośnie wykładniczo.',
    'Rozwiązania: wersja iteracyjna (pętla z dwiema zmiennymi) albo zapamiętywanie wyników (spamiętywanie, programowanie dynamiczne) – wtedy O(n).',
  ],
  complexity: 'O(2ⁿ) wywołań (dokładniej ok. 1,6ⁿ) dla wersji naiwnej.',
  code: ['def fib(n):', '    if n <= 1:', '        return n', '    return fib(n - 1) + fib(n - 2)'],
  inputs: [{ name: 'n', label: 'n', kind: 'int', min: 0, max: 7, default: 5 }],
  run({ n }) {
    const rec = treeRecorder();
    let calls = 0;
    const go = (k: number, parent: number | null): number => {
      calls += 1;
      const id = rec.call(parent, `fib(${k})`);
      rec.snap(
        k <= 1 ? 1 : 3,
        k <= 1 ? `fib(${k}) – warunek stopu.` : `fib(${k}) wywołuje fib(${k - 1}) i fib(${k - 2}).`,
        { n: k, wywolania: calls },
      );
      const value = k <= 1 ? k : go(k - 1, id) + go(k - 2, id);
      rec.finish(id, String(value));
      rec.snap(k <= 1 ? 2 : 3, `fib(${k}) = ${value}.`, { n: k, wywolania: calls });
      return value;
    };
    const value = go(n as number, null);
    rec.snap(-1, `fib(${n}) = ${value}; łącznie ${calls} wywołań.`, { wywolania: calls });
    return rec.frames;
  },
};

export const hanoi: AlgorithmDef = {
  id: 'hanoi',
  title: 'Wieże Hanoi',
  category: 'Rekurencja',
  intro: [
    'Przenosimy n krążków z pręta A na C (z pomocą B), nigdy nie kładąc większego na mniejszy. Rekurencyjnie: przenieś n − 1 krążków na pręt pomocniczy, przenieś największy na docelowy, a potem n − 1 krążków na niego.',
  ],
  complexity: '2ⁿ − 1 ruchów.',
  code: [
    'def hanoi(n, z, na, przez):',
    '    if n == 0:',
    '        return',
    '    hanoi(n - 1, z, przez, na)',
    '    print(z, "->", na)',
    '    hanoi(n - 1, przez, na, z)',
  ],
  inputs: [{ name: 'n', label: 'Liczba krążków', kind: 'int', min: 1, max: 5, default: 3 }],
  run({ n: nRaw }) {
    const n = nRaw as number;
    const pegs: number[][] = [Array.from({ length: n }, (_, i) => n - i), [], []];
    const names = ['A', 'B', 'C'];
    const frames: Frame[] = [
      {
        view: { kind: 'hanoi', pegs: pegs.map((p) => [...p]), n },
        line: 0,
        note: `${n} krążków na pręcie A.`,
      },
    ];
    let moves = 0;
    const go = (k: number, from: number, to: number, via: number) => {
      if (k === 0) return;
      go(k - 1, from, via, to);
      pegs[to]!.push(pegs[from]!.pop()!);
      moves += 1;
      frames.push({
        view: { kind: 'hanoi', pegs: pegs.map((p) => [...p]), n },
        line: 4,
        note: `Ruch ${moves}: krążek ${k} z ${names[from]} na ${names[to]}.`,
        vars: { ruchy: moves },
      });
      go(k - 1, via, to, from);
    };
    go(n, 0, 2, 1);
    frames.push({
      view: { kind: 'hanoi', pegs: pegs.map((p) => [...p]), n },
      line: -1,
      note: `Gotowe w ${moves} = 2^${n} − 1 ruchach.`,
    });
    return frames;
  },
};

export const RECURSION = [factorial, fibonacci, hanoi];
