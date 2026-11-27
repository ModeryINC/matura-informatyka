import type { AlgorithmDef, Frame, Role } from './types';

export const linearSearch: AlgorithmDef = {
  id: 'liniowe',
  title: 'Wyszukiwanie liniowe',
  category: 'Wyszukiwanie',
  intro: [
    'Sprawdzamy elementy po kolei, aż znajdziemy szukaną wartość albo dojdziemy do końca tablicy. Działa dla dowolnej (także nieposortowanej) tablicy.',
  ],
  complexity: 'O(n).',
  code: [
    'def szukaj(t, x):',
    '    for i in range(len(t)):',
    '        if t[i] == x:',
    '            return i',
    '    return -1',
  ],
  inputs: [
    {
      name: 't',
      label: 'Tablica',
      kind: 'ints',
      min: 0,
      max: 99,
      minLength: 2,
      maxLength: 14,
      default: [12, 7, 31, 5, 18, 26, 9, 40],
    },
    { name: 'x', label: 'Szukana wartość', kind: 'int', min: 0, max: 99, default: 26 },
  ],
  run({ t, x }) {
    const a = t as number[];
    const frames: Frame[] = [];
    for (let i = 0; i < a.length; i += 1) {
      const roles: Partial<Record<number, Role>> = Object.fromEntries(
        Array.from({ length: i }, (_, k) => [k, 'muted']),
      );
      frames.push({
        view: { kind: 'array', values: a, roles: { ...roles, [i]: 'compare' }, pointers: { i } },
        line: 2,
        note: `Czy t[${i}] = ${a[i]} jest równe ${x}?`,
        vars: { i, x: x as number },
      });
      if (a[i] === x) {
        frames.push({
          view: { kind: 'array', values: a, roles: { ...roles, [i]: 'found' }, pointers: { i } },
          line: 3,
          note: `Znaleziono ${x} na pozycji ${i} po ${i + 1} porównaniach.`,
          vars: { i },
        });
        return frames;
      }
    }
    frames.push({
      view: { kind: 'array', values: a, roles: Object.fromEntries(a.map((_, k) => [k, 'muted'])) },
      line: 4,
      note: `Wartości ${x} nie ma w tablicy (${a.length} porównań).`,
    });
    return frames;
  },
};

export const binarySearch: AlgorithmDef = {
  id: 'binarne',
  title: 'Wyszukiwanie binarne',
  category: 'Wyszukiwanie',
  intro: [
    'Tablica musi być **posortowana**. Porównujemy szukaną wartość ze środkowym elementem przedziału: jeśli jest mniejsza, szukamy w lewej połowie, jeśli większa – w prawej. W każdym kroku przedział zmniejsza się o połowę.',
    'Ta sama idea (połowienie przedziału) to metoda bisekcji szukania miejsca zerowego.',
  ],
  complexity: 'O(log n) – dla miliona elementów wystarczy ok. 20 porównań.',
  code: [
    'def szukaj_binarnie(t, x):',
    '    lewy, prawy = 0, len(t) - 1',
    '    while lewy <= prawy:',
    '        srodek = (lewy + prawy) // 2',
    '        if t[srodek] == x:',
    '            return srodek',
    '        if t[srodek] < x:',
    '            lewy = srodek + 1',
    '        else:',
    '            prawy = srodek - 1',
    '    return -1',
  ],
  inputs: [
    {
      name: 't',
      label: 'Tablica (zostanie posortowana)',
      kind: 'ints',
      min: 0,
      max: 99,
      minLength: 2,
      maxLength: 14,
      default: [3, 8, 12, 17, 23, 31, 38, 44, 52, 60, 71, 85],
    },
    { name: 'x', label: 'Szukana wartość', kind: 'int', min: 0, max: 99, default: 52 },
  ],
  run({ t, x }) {
    const a = [...(t as number[])].sort((p, q) => p - q);
    const frames: Frame[] = [];
    let l = 0;
    let r = a.length - 1;
    const outside = (lo: number, hi: number) =>
      Object.fromEntries(
        a.map((_, k) => [k, k < lo || k > hi ? 'muted' : undefined]).filter(([, v]) => v),
      ) as Partial<Record<number, Role>>;
    while (l <= r) {
      const m = Math.floor((l + r) / 2);
      frames.push({
        view: {
          kind: 'array',
          values: a,
          roles: { ...outside(l, r), [m]: 'compare' },
          pointers: { lewy: l, srodek: m, prawy: r },
        },
        line: 3,
        note: `Przedział [${l}, ${r}], środek ${m}: t[${m}] = ${a[m]}.`,
        vars: { lewy: l, prawy: r, srodek: m },
      });
      if (a[m] === x) {
        frames.push({
          view: {
            kind: 'array',
            values: a,
            roles: { ...outside(m, m), [m]: 'found' },
            pointers: { srodek: m },
          },
          line: 5,
          note: `Znaleziono ${x} na pozycji ${m}.`,
          vars: { srodek: m },
        });
        return frames;
      }
      if (a[m]! < (x as number)) {
        frames.push({
          view: {
            kind: 'array',
            values: a,
            roles: outside(m + 1, r),
            pointers: { lewy: m + 1, prawy: r },
          },
          line: 7,
          note: `${a[m]} < ${x} – odrzucamy lewą połowę.`,
          vars: { lewy: m + 1, prawy: r },
        });
        l = m + 1;
      } else {
        frames.push({
          view: {
            kind: 'array',
            values: a,
            roles: outside(l, m - 1),
            pointers: { lewy: l, prawy: m - 1 },
          },
          line: 9,
          note: `${a[m]} > ${x} – odrzucamy prawą połowę.`,
          vars: { lewy: l, prawy: m - 1 },
        });
        r = m - 1;
      }
    }
    frames.push({
      view: { kind: 'array', values: a, roles: outside(1, 0) },
      line: 10,
      note: `Przedział jest pusty – wartości ${x} nie ma w tablicy.`,
    });
    return frames;
  },
};

export const minMax: AlgorithmDef = {
  id: 'min-max',
  title: 'Minimum i maksimum jednocześnie',
  category: 'Wyszukiwanie',
  intro: [
    'Zwykle szukanie minimum i maksimum to 2(n − 1) porównań. Jeśli bierzemy elementy **parami**, najpierw porównujemy je ze sobą, a potem mniejszy z minimum, a większy z maksimum – to tylko ok. 3n/2 porównań.',
  ],
  complexity: 'O(n), ok. 3n/2 porównań.',
  code: [
    'def min_max(t):',
    '    mn = mx = t[0]',
    '    for i in range(1, len(t) - 1, 2):',
    '        a, b = t[i], t[i + 1]',
    '        if a > b: a, b = b, a',
    '        if a < mn: mn = a',
    '        if b > mx: mx = b',
    '    if len(t) % 2 == 0:',
    '        mn, mx = min(mn, t[-1]), max(mx, t[-1])',
    '    return mn, mx',
  ],
  inputs: [
    {
      name: 't',
      label: 'Tablica',
      kind: 'ints',
      min: 0,
      max: 99,
      minLength: 2,
      maxLength: 14,
      default: [41, 17, 63, 8, 55, 29, 90, 12, 34],
    },
  ],
  run({ t }) {
    const a = t as number[];
    const frames: Frame[] = [];
    let mn = 0;
    let mx = 0;
    let comparisons = 0;
    const roles = (extra: Partial<Record<number, Role>> = {}) => ({
      [mn]: 'min' as Role,
      [mx]: 'max' as Role,
      ...extra,
    });
    frames.push({
      view: { kind: 'array', values: a, roles: roles() },
      line: 1,
      note: `Na początek minimum = maksimum = t[0] = ${a[0]}.`,
      vars: { mn: a[mn]!, mx: a[mx]! },
    });
    let i = 1;
    for (; i + 1 < a.length; i += 2) {
      let lo = i;
      let hi = i + 1;
      comparisons += 1;
      if (a[lo]! > a[hi]!) [lo, hi] = [hi, lo];
      frames.push({
        view: { kind: 'array', values: a, roles: roles({ [i]: 'compare', [i + 1]: 'compare' }) },
        line: 4,
        note: `Para (${a[i]}, ${a[i + 1]}): mniejszy ${a[lo]} porównamy z minimum, większy ${a[hi]} z maksimum.`,
        vars: { mn: a[mn]!, mx: a[mx]!, porownania: comparisons },
      });
      comparisons += 2;
      if (a[lo]! < a[mn]!) mn = lo;
      if (a[hi]! > a[mx]!) mx = hi;
      frames.push({
        view: { kind: 'array', values: a, roles: roles() },
        line: 6,
        note: `Minimum = ${a[mn]}, maksimum = ${a[mx]}.`,
        vars: { mn: a[mn]!, mx: a[mx]!, porownania: comparisons },
      });
    }
    if (i < a.length) {
      comparisons += 2;
      if (a[i]! < a[mn]!) mn = i;
      if (a[i]! > a[mx]!) mx = i;
      frames.push({
        view: { kind: 'array', values: a, roles: roles({ [i]: 'compare' }) },
        line: 8,
        note: `Został ostatni element ${a[i]} bez pary – porównujemy go z obydwoma.`,
        vars: { mn: a[mn]!, mx: a[mx]!, porownania: comparisons },
      });
    }
    frames.push({
      view: { kind: 'array', values: a, roles: roles() },
      line: 9,
      note: `Minimum = ${a[mn]}, maksimum = ${a[mx]} po ${comparisons} porównaniach (zwykła metoda: ${2 * (a.length - 1)}).`,
      vars: { mn: a[mn]!, mx: a[mx]! },
    });
    return frames;
  },
};

export const SEARCHING = [linearSearch, binarySearch, minMax];
