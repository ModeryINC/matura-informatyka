import type { AlgorithmDef, Frame } from './types';

export const coinChange: AlgorithmDef = {
  id: 'reszta',
  title: 'Wydawanie reszty (algorytm zachłanny)',
  category: 'Algorytmy zachłanne',
  intro: [
    'Algorytm zachłanny w każdym kroku wybiera to, co w tej chwili wygląda najlepiej. Przy wydawaniu reszty bierzemy największy nominał, który nie przekracza pozostałej kwoty, dopóki kwota nie spadnie do zera.',
    'Dla polskich nominałów (1, 2, 5, 10, 20, 50…) daje to najmniejszą liczbę monet, ale nie dla każdego zestawu – np. dla nominałów 1, 3, 4 i kwoty 6 zachłannie wyjdzie 4 + 1 + 1, a optymalnie 3 + 3 (to już zadanie na programowanie dynamiczne).',
  ],
  complexity: 'O(k + liczba monet) dla k nominałów posortowanych malejąco.',
  code: [
    'def reszta(kwota, nominaly):',
    '    wynik = []',
    '    for m in sorted(nominaly, reverse=True):',
    '        while kwota >= m:',
    '            wynik.append(m)',
    '            kwota -= m',
    '    return wynik',
  ],
  inputs: [
    { name: 'kwota', label: 'Kwota', kind: 'int', min: 1, max: 1000, default: 289 },
    {
      name: 'nominaly',
      label: 'Nominały',
      kind: 'ints',
      min: 1,
      max: 500,
      minLength: 1,
      maxLength: 12,
      default: [1, 2, 5, 10, 20, 50, 100, 200],
    },
  ],
  run({ kwota, nominaly }) {
    let left = kwota as number;
    const coins = [...new Set(nominaly as number[])].sort((a, b) => b - a);
    const used: number[] = [];
    const head = ['nominał', 'pozostało przed', 'pozostało po', 'wydane'];
    const rows: (string | number)[][] = [];
    const frames: Frame[] = [];
    for (const m of coins) {
      while (left >= m) {
        rows.push([m, left, left - m, [...used, m].join(' + ')]);
        used.push(m);
        left -= m;
        frames.push({
          view: { kind: 'table', head, rows: rows.map((r) => [...r]), current: rows.length - 1 },
          line: 4,
          note: `Największy nominał ≤ ${left + m} to ${m}.`,
          vars: { kwota: left },
        });
      }
    }
    frames.push({
      view: { kind: 'table', head, rows: rows.map((r) => [...r]) },
      line: 6,
      note:
        left === 0
          ? `Wydano ${used.length} monet/banknotów.`
          : `Zostało ${left} – tej kwoty nie da się wydać podanymi nominałami.`,
    });
    return frames;
  },
};

export const GREEDY = [coinChange];
