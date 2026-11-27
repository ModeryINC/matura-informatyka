import type { AlgorithmDef, Frame, Role } from './types';

const ARRAY_INPUT = {
  name: 't',
  label: 'Tablica (liczby oddzielone przecinkami)',
  kind: 'ints' as const,
  min: 0,
  max: 99,
  minLength: 2,
  maxLength: 14,
};

const sortedRoles = (from: number, to: number): Partial<Record<number, Role>> =>
  Object.fromEntries(
    Array.from({ length: Math.max(0, to - from) }, (_, k) => [from + k, 'sorted']),
  );

export const bubbleSort: AlgorithmDef = {
  id: 'babelkowe',
  title: 'Sortowanie bąbelkowe',
  category: 'Sortowanie',
  intro: [
    'Porównujemy sąsiednie elementy i zamieniamy je, gdy są w złej kolejności. Po każdym przejściu największy z nieposortowanych elementów „wypływa” jak bąbelek na koniec tablicy.',
    'Jeśli w całym przejściu nie było zamiany, tablica jest już posortowana i można przerwać.',
  ],
  complexity: 'O(n²) porównań; O(n) dla tablicy już posortowanej (z flagą zamiany).',
  code: [
    'def sortuj_babelkowo(t):',
    '    n = len(t)',
    '    for i in range(n - 1):',
    '        zamiana = False',
    '        for j in range(n - 1 - i):',
    '            if t[j] > t[j + 1]:',
    '                t[j], t[j + 1] = t[j + 1], t[j]',
    '                zamiana = True',
    '        if not zamiana:',
    '            break',
  ],
  inputs: [{ ...ARRAY_INPUT, default: [29, 10, 14, 37, 13, 5, 42, 21] }],
  run({ t }) {
    const a = [...(t as number[])];
    const n = a.length;
    const frames: Frame[] = [];
    const push = (line: number, note: string, roles: Partial<Record<number, Role>>, vars = {}) =>
      frames.push({ view: { kind: 'array', values: [...a], roles }, line, note, vars });
    push(1, `Tablica ma ${n} elementów.`, {});
    let sortedFrom = n;
    for (let i = 0; i < n - 1; i += 1) {
      let swapped = false;
      push(
        2,
        `Przejście nr ${i + 1}: ostatnie ${i} elementów jest już na swoim miejscu.`,
        sortedRoles(sortedFrom, n),
        { i },
      );
      for (let j = 0; j < n - 1 - i; j += 1) {
        const roles = {
          ...sortedRoles(sortedFrom, n),
          [j]: 'compare' as Role,
          [j + 1]: 'compare' as Role,
        };
        push(5, `Porównujemy t[${j}] = ${a[j]} i t[${j + 1}] = ${a[j + 1]}.`, roles, { i, j });
        if (a[j]! > a[j + 1]!) {
          [a[j], a[j + 1]] = [a[j + 1]!, a[j]!];
          swapped = true;
          push(
            6,
            `${a[j + 1]} > ${a[j]} – zamieniamy je miejscami.`,
            { ...roles, [j]: 'swap', [j + 1]: 'swap' },
            { i, j },
          );
        }
      }
      sortedFrom = n - 1 - i;
      if (!swapped) {
        push(
          9,
          'W tym przejściu nie było żadnej zamiany – tablica jest posortowana.',
          sortedRoles(0, n),
          { i },
        );
        return frames;
      }
    }
    push(-1, 'Tablica jest posortowana.', sortedRoles(0, n));
    return frames;
  },
};

export const selectionSort: AlgorithmDef = {
  id: 'wybieranie',
  title: 'Sortowanie przez wybieranie',
  category: 'Sortowanie',
  intro: [
    'W każdym kroku szukamy najmniejszego elementu w nieposortowanej części tablicy i zamieniamy go z pierwszym elementem tej części. Posortowany fragment rośnie od lewej.',
  ],
  complexity: 'O(n²) porównań zawsze, ale tylko n − 1 zamian.',
  code: [
    'def sortuj_wybieraniem(t):',
    '    n = len(t)',
    '    for i in range(n - 1):',
    '        m = i',
    '        for j in range(i + 1, n):',
    '            if t[j] < t[m]:',
    '                m = j',
    '        t[i], t[m] = t[m], t[i]',
  ],
  inputs: [{ ...ARRAY_INPUT, default: [29, 10, 14, 37, 13, 5, 42, 21] }],
  run({ t }) {
    const a = [...(t as number[])];
    const n = a.length;
    const frames: Frame[] = [];
    const push = (line: number, note: string, roles: Partial<Record<number, Role>>, vars = {}) =>
      frames.push({ view: { kind: 'array', values: [...a], roles }, line, note, vars });
    for (let i = 0; i < n - 1; i += 1) {
      let m = i;
      push(
        3,
        `Szukamy minimum w t[${i}..${n - 1}]; na razie najmniejszy jest t[${i}] = ${a[i]}.`,
        { ...sortedRoles(0, i), [m]: 'min' },
        { i, m },
      );
      for (let j = i + 1; j < n; j += 1) {
        push(
          5,
          `Porównujemy t[${j}] = ${a[j]} z minimum t[${m}] = ${a[m]}.`,
          { ...sortedRoles(0, i), [m]: 'min', [j]: 'compare' },
          { i, j, m },
        );
        if (a[j]! < a[m]!) {
          m = j;
          push(
            6,
            `Nowe minimum: t[${m}] = ${a[m]}.`,
            { ...sortedRoles(0, i), [m]: 'min' },
            { i, j, m },
          );
        }
      }
      [a[i], a[m]] = [a[m]!, a[i]!];
      push(
        7,
        m === i ? `Minimum jest już na pozycji ${i}.` : `Zamieniamy t[${i}] z minimum t[${m}].`,
        { ...sortedRoles(0, i), [i]: 'swap', [m]: 'swap' },
        { i, m },
      );
    }
    push(-1, 'Tablica jest posortowana.', sortedRoles(0, n));
    return frames;
  },
};

export const insertionSort: AlgorithmDef = {
  id: 'wstawianie',
  title: 'Sortowanie przez wstawianie',
  category: 'Sortowanie',
  intro: [
    'Lewa część tablicy jest posortowana. Bierzemy kolejny element (klucz) i przesuwamy większe od niego elementy o jedno miejsce w prawo, aż znajdziemy miejsce, w które klucz wstawiamy – jak przy układaniu kart w ręce.',
  ],
  complexity: 'O(n²) w najgorszym przypadku, O(n) dla danych prawie posortowanych.',
  code: [
    'def sortuj_wstawianiem(t):',
    '    for i in range(1, len(t)):',
    '        klucz = t[i]',
    '        j = i - 1',
    '        while j >= 0 and t[j] > klucz:',
    '            t[j + 1] = t[j]',
    '            j -= 1',
    '        t[j + 1] = klucz',
  ],
  inputs: [{ ...ARRAY_INPUT, default: [29, 10, 14, 37, 13, 5, 42, 21] }],
  run({ t }) {
    const a = [...(t as number[])];
    const frames: Frame[] = [];
    const push = (line: number, note: string, roles: Partial<Record<number, Role>>, vars = {}) =>
      frames.push({ view: { kind: 'array', values: [...a], roles }, line, note, vars });
    for (let i = 1; i < a.length; i += 1) {
      const key = a[i]!;
      let j = i - 1;
      push(
        2,
        `Klucz = t[${i}] = ${key}. Elementy t[0..${i - 1}] są posortowane.`,
        { ...sortedRoles(0, i), [i]: 'active' },
        { i, klucz: key },
      );
      while (j >= 0 && a[j]! > key) {
        push(
          4,
          `t[${j}] = ${a[j]} > ${key} – przesuwamy go w prawo.`,
          { ...sortedRoles(0, i + 1), [j]: 'compare', [j + 1]: 'active' },
          { i, j, klucz: key },
        );
        a[j + 1] = a[j]!;
        a[j] = key;
        j -= 1;
      }
      a[j + 1] = key;
      push(
        7,
        `Wstawiamy klucz ${key} na pozycję ${j + 1}.`,
        { ...sortedRoles(0, i + 1), [j + 1]: 'found' },
        { i, j, klucz: key },
      );
    }
    push(-1, 'Tablica jest posortowana.', sortedRoles(0, a.length));
    return frames;
  },
};

export const mergeSort: AlgorithmDef = {
  id: 'scalanie',
  title: 'Sortowanie przez scalanie',
  category: 'Sortowanie',
  intro: [
    'Metoda **dziel i zwyciężaj**: dzielimy tablicę na dwie połowy, każdą sortujemy rekurencyjnie, a potem scalamy dwie posortowane połowy – porównując ich pierwsze elementy i przepisując mniejszy.',
  ],
  complexity: 'O(n log n) zawsze; potrzebuje dodatkowej pamięci O(n).',
  code: [
    'def sortuj_scalaniem(t, lewy, prawy):',
    '    if lewy >= prawy:',
    '        return',
    '    srodek = (lewy + prawy) // 2',
    '    sortuj_scalaniem(t, lewy, srodek)',
    '    sortuj_scalaniem(t, srodek + 1, prawy)',
    '    pom = []',
    '    i, j = lewy, srodek + 1',
    '    while i <= srodek and j <= prawy:',
    '        if t[i] <= t[j]: pom.append(t[i]); i += 1',
    '        else: pom.append(t[j]); j += 1',
    '    pom += t[i:srodek + 1] + t[j:prawy + 1]',
    '    t[lewy:prawy + 1] = pom',
  ],
  inputs: [{ ...ARRAY_INPUT, default: [38, 27, 43, 3, 9, 82, 10, 15] }],
  run({ t }) {
    const a = [...(t as number[])];
    const frames: Frame[] = [];
    const range = (l: number, r: number, role: Role = 'active') =>
      Object.fromEntries(Array.from({ length: r - l + 1 }, (_, k) => [l + k, role])) as Partial<
        Record<number, Role>
      >;
    const sort = (l: number, r: number) => {
      if (l >= r) return;
      const m = Math.floor((l + r) / 2);
      frames.push({
        view: { kind: 'array', values: [...a], roles: range(l, r) },
        line: 3,
        note: `Dzielimy t[${l}..${r}] na t[${l}..${m}] i t[${m + 1}..${r}].`,
        vars: { lewy: l, srodek: m, prawy: r },
      });
      sort(l, m);
      sort(m + 1, r);
      const merged: number[] = [];
      let i = l;
      let j = m + 1;
      while (i <= m && j <= r) {
        frames.push({
          view: {
            kind: 'array',
            values: [...a],
            roles: { ...range(l, r, 'muted'), [i]: 'compare', [j]: 'compare' },
            aux: { label: 'pom', values: [...merged], offset: l },
          },
          line: 9,
          note: `Scalamy: porównujemy ${a[i]} i ${a[j]}, mniejszy trafia do tablicy pomocniczej.`,
          vars: { i, j },
        });
        if (a[i]! <= a[j]!) merged.push(a[i++]!);
        else merged.push(a[j++]!);
      }
      while (i <= m) merged.push(a[i++]!);
      while (j <= r) merged.push(a[j++]!);
      for (let k = 0; k < merged.length; k += 1) a[l + k] = merged[k]!;
      frames.push({
        view: {
          kind: 'array',
          values: [...a],
          roles: range(l, r, 'sorted'),
          aux: { label: 'pom', values: [...merged], offset: l },
        },
        line: 12,
        note: `Fragment t[${l}..${r}] jest posortowany.`,
        vars: { lewy: l, prawy: r },
      });
    };
    sort(0, a.length - 1);
    frames.push({
      view: { kind: 'array', values: [...a], roles: range(0, a.length - 1, 'sorted') },
      line: -1,
      note: 'Tablica jest posortowana.',
    });
    return frames;
  },
};

export const quickSort: AlgorithmDef = {
  id: 'szybkie',
  title: 'Sortowanie szybkie (quicksort)',
  category: 'Sortowanie',
  intro: [
    'Wybieramy element osiowy (tu: ostatni w zakresie) i przestawiamy tablicę tak, by mniejsze od niego były po lewej, a większe po prawej (podział Lomuto). Element osiowy jest wtedy na swoim ostatecznym miejscu; obie części sortujemy rekurencyjnie.',
  ],
  complexity:
    'O(n log n) średnio, O(n²) w najgorszym przypadku (np. tablica już posortowana przy osi = ostatni element).',
  code: [
    'def sortuj_szybko(t, lewy, prawy):',
    '    if lewy >= prawy:',
    '        return',
    '    os = t[prawy]',
    '    i = lewy',
    '    for j in range(lewy, prawy):',
    '        if t[j] < os:',
    '            t[i], t[j] = t[j], t[i]',
    '            i += 1',
    '    t[i], t[prawy] = t[prawy], t[i]',
    '    sortuj_szybko(t, lewy, i - 1)',
    '    sortuj_szybko(t, i + 1, prawy)',
  ],
  inputs: [{ ...ARRAY_INPUT, default: [29, 10, 14, 37, 13, 5, 42, 21] }],
  run({ t }) {
    const a = [...(t as number[])];
    const frames: Frame[] = [];
    const done = new Set<number>();
    const base = () =>
      Object.fromEntries([...done].map((k) => [k, 'sorted'])) as Partial<Record<number, Role>>;
    const sort = (l: number, r: number) => {
      if (l > r) return;
      if (l === r) {
        done.add(l);
        return;
      }
      const pivot = a[r]!;
      let i = l;
      frames.push({
        view: {
          kind: 'array',
          values: [...a],
          roles: { ...base(), [r]: 'pivot' },
          pointers: { i, j: l },
        },
        line: 3,
        note: `Zakres t[${l}..${r}], element osiowy = ${pivot}.`,
        vars: { lewy: l, prawy: r, os: pivot },
      });
      for (let j = l; j < r; j += 1) {
        frames.push({
          view: {
            kind: 'array',
            values: [...a],
            roles: { ...base(), [r]: 'pivot', [j]: 'compare' },
            pointers: { i, j },
          },
          line: 6,
          note: `Czy t[${j}] = ${a[j]} < ${pivot}?`,
          vars: { i, j, os: pivot },
        });
        if (a[j]! < pivot) {
          [a[i], a[j]] = [a[j]!, a[i]!];
          frames.push({
            view: {
              kind: 'array',
              values: [...a],
              roles: { ...base(), [r]: 'pivot', [i]: 'swap', [j]: 'swap' },
              pointers: { i, j },
            },
            line: 7,
            note: `Tak – przenosimy go na lewą stronę (pozycja ${i}).`,
            vars: { i, j, os: pivot },
          });
          i += 1;
        }
      }
      [a[i], a[r]] = [a[r]!, a[i]!];
      done.add(i);
      frames.push({
        view: {
          kind: 'array',
          values: [...a],
          roles: { ...base(), [i]: 'pivot' },
          pointers: { i },
        },
        line: 9,
        note: `Element osiowy ${pivot} trafia na pozycję ${i} – na swoje ostateczne miejsce.`,
        vars: { i },
      });
      sort(l, i - 1);
      sort(i + 1, r);
    };
    sort(0, a.length - 1);
    frames.push({
      view: { kind: 'array', values: [...a], roles: sortedRoles(0, a.length) },
      line: -1,
      note: 'Tablica jest posortowana.',
    });
    return frames;
  },
};

export const countingSort: AlgorithmDef = {
  id: 'zliczanie',
  title: 'Sortowanie przez zliczanie',
  category: 'Sortowanie',
  intro: [
    'Dla małego zakresu wartości (np. oceny 1–6, cyfry) liczymy, ile razy występuje każda wartość, a potem wypisujemy wartości po kolei tyle razy, ile wystąpiły. Nie porównujemy elementów ze sobą.',
  ],
  complexity: 'O(n + k), gdzie k to liczba możliwych wartości.',
  code: [
    'def sortuj_zliczaniem(t, k):',
    '    licz = [0] * (k + 1)',
    '    for x in t:',
    '        licz[x] += 1',
    '    wynik = []',
    '    for w in range(k + 1):',
    '        wynik += [w] * licz[w]',
    '    return wynik',
  ],
  inputs: [
    {
      ...ARRAY_INPUT,
      label: 'Tablica (liczby 0–9)',
      max: 9,
      default: [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5],
    },
  ],
  run({ t }) {
    const a = t as number[];
    const k = Math.max(...a);
    const count = Array<number>(k + 1).fill(0);
    const frames: Frame[] = [];
    a.forEach((x, idx) => {
      count[x]! += 1;
      frames.push({
        view: {
          kind: 'array',
          values: [...a],
          roles: { [idx]: 'active' },
          aux: { label: 'licz[0..k]', values: [...count], roles: { [x]: 'active' } },
        },
        line: 3,
        note: `Element ${x}: zwiększamy licz[${x}] do ${count[x]}.`,
        vars: { x },
      });
    });
    const result: number[] = [];
    for (let w = 0; w <= k; w += 1) {
      if (count[w] === 0) continue;
      for (let c = 0; c < count[w]!; c += 1) result.push(w);
      frames.push({
        view: {
          kind: 'array',
          values: [...result],
          roles: sortedRoles(0, result.length),
          aux: { label: 'licz[0..k]', values: [...count], roles: { [w]: 'found' } },
        },
        line: 6,
        note: `Wartość ${w} występuje ${count[w]} raz(y) – dopisujemy ją do wyniku.`,
        vars: { w },
      });
    }
    return frames;
  },
};

export const SORTING = [
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  countingSort,
];
