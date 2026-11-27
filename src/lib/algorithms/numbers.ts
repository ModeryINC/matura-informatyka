import type { AlgorithmDef, Frame, GridView, TableView } from './types';

const table = (head: string[], rows: (string | number)[][], current?: number): TableView => ({
  kind: 'table',
  head,
  rows: rows.map((r) => [...r]),
  current,
});

export const euclid: AlgorithmDef = {
  id: 'euklides',
  title: 'NWD – algorytm Euklidesa',
  category: 'Liczby',
  intro: [
    'Największy wspólny dzielnik liczb a i b się nie zmienia, gdy większą liczbę zastąpimy resztą z dzielenia jej przez mniejszą: NWD(a, b) = NWD(b, a mod b). Kończymy, gdy reszta jest równa 0.',
    'Wersja z odejmowaniem (NWD(a, b) = NWD(a − b, b) dla a > b) działa tak samo, ale może wymagać wielu kroków. NWW(a, b) = a · b / NWD(a, b).',
  ],
  complexity: 'O(log min(a, b)) dzieleń.',
  code: ['def nwd(a, b):', '    while b != 0:', '        a, b = b, a % b', '    return a'],
  inputs: [
    { name: 'a', label: 'a', kind: 'int', min: 1, max: 1_000_000, default: 1071 },
    { name: 'b', label: 'b', kind: 'int', min: 1, max: 1_000_000, default: 462 },
  ],
  run({ a: a0, b: b0 }) {
    let a = a0 as number;
    let b = b0 as number;
    const rows: (string | number)[][] = [];
    const frames: Frame[] = [];
    const head = ['a', 'b', 'a mod b'];
    frames.push({
      view: table(head, [[a, b, '']], 0),
      line: 1,
      note: `Zaczynamy od a = ${a}, b = ${b}.`,
      vars: { a, b },
    });
    while (b !== 0) {
      rows.push([a, b, a % b]);
      frames.push({
        view: table(head, rows, rows.length - 1),
        line: 2,
        note: `${a} mod ${b} = ${a % b}; nowa para: (${b}, ${a % b}).`,
        vars: { a, b },
      });
      [a, b] = [b, a % b];
    }
    rows.push([a, 0, '–']);
    frames.push({
      view: table(head, rows, rows.length - 1),
      line: 3,
      note: `b = 0, więc NWD = ${a}. NWW = ${((a0 as number) * (b0 as number)) / a}.`,
      vars: { a, b },
    });
    return frames;
  },
};

export const sieve: AlgorithmDef = {
  id: 'sito',
  title: 'Sito Eratostenesa',
  category: 'Liczby',
  intro: [
    'Wypisujemy liczby od 2 do n. Bierzemy najmniejszą nieskreśloną liczbę – jest pierwsza – i skreślamy wszystkie jej wielokrotności (zaczynając od jej kwadratu). Powtarzamy, dopóki kwadrat liczby nie przekroczy n; nieskreślone liczby to liczby pierwsze.',
  ],
  complexity: 'O(n log log n) – szybkie wyznaczenie wszystkich liczb pierwszych do n.',
  code: [
    'def sito(n):',
    '    pierwsza = [True] * (n + 1)',
    '    pierwsza[0] = pierwsza[1] = False',
    '    p = 2',
    '    while p * p <= n:',
    '        if pierwsza[p]:',
    '            for k in range(p * p, n + 1, p):',
    '                pierwsza[k] = False',
    '        p += 1',
    '    return [i for i in range(n + 1) if pierwsza[i]]',
  ],
  inputs: [{ name: 'n', label: 'n', kind: 'int', min: 10, max: 120, default: 60 }],
  run({ n: nRaw }) {
    const n = nRaw as number;
    const state: GridView['cells'] = Array.from({ length: n - 1 }, (_, i) => ({
      value: i + 2,
      state: 'none' as const,
    }));
    const frames: Frame[] = [];
    const snap = (line: number, note: string, vars = {}) =>
      frames.push({
        view: { kind: 'grid', cells: state.map((c) => ({ ...c })) },
        line,
        note,
        vars,
      });
    snap(1, `Liczby od 2 do ${n}; na początku żadna nie jest skreślona.`);
    for (let p = 2; p * p <= n; p += 1) {
      const cell = state[p - 2]!;
      if (cell.state === 'crossed') continue;
      cell.state = 'current';
      snap(
        5,
        `${p} nie jest skreślona – to liczba pierwsza. Skreślamy jej wielokrotności od ${p * p}.`,
        { p },
      );
      const marked: number[] = [];
      for (let k = p * p; k <= n; k += p) {
        state[k - 2]!.state = 'marking';
        marked.push(k);
      }
      snap(7, `Skreślamy: ${marked.join(', ')}.`, { p });
      marked.forEach((k) => (state[k - 2]!.state = 'crossed'));
      cell.state = 'prime';
    }
    state.forEach((c) => {
      if (c.state === 'none') c.state = 'prime';
    });
    const primes = state.filter((c) => c.state === 'prime').map((c) => c.value);
    snap(9, `Nieskreślone liczby są pierwsze (${primes.length}): ${primes.join(', ')}.`);
    return frames;
  },
};

export const primeTest: AlgorithmDef = {
  id: 'pierwszosc',
  title: 'Sprawdzanie, czy liczba jest pierwsza',
  category: 'Liczby',
  intro: [
    'Liczba n > 1 jest pierwsza, gdy nie dzieli jej żadna liczba od 2 do √n. Wystarczy sprawdzać do pierwiastka, bo jeśli n = a · b i a ≤ b, to a ≤ √n.',
  ],
  complexity: 'O(√n) dzieleń.',
  code: [
    'def czy_pierwsza(n):',
    '    if n < 2:',
    '        return False',
    '    d = 2',
    '    while d * d <= n:',
    '        if n % d == 0:',
    '            return False',
    '        d += 1',
    '    return True',
  ],
  inputs: [{ name: 'n', label: 'n', kind: 'int', min: 1, max: 100_000_000, default: 221 }],
  run({ n: nRaw }) {
    const n = nRaw as number;
    const head = ['d', 'd · d', 'n mod d'];
    const rows: (string | number)[][] = [];
    const frames: Frame[] = [];
    if (n < 2)
      return [{ view: table(head, []), line: 2, note: `${n} < 2 – nie jest liczbą pierwszą.` }];
    for (let d = 2; d * d <= n; d += 1) {
      rows.push([d, d * d, n % d]);
      if (n % d === 0) {
        frames.push({
          view: table(head, rows, rows.length - 1),
          line: 6,
          note: `${n} = ${d} · ${n / d} – liczba złożona.`,
          vars: { d },
        });
        return frames;
      }
      if (rows.length <= 40)
        frames.push({
          view: table(head, rows, rows.length - 1),
          line: 5,
          note: `${d} nie dzieli ${n}.`,
          vars: { d },
        });
    }
    frames.push({
      view: table(head, rows.slice(-40)),
      line: 8,
      note: `Żadna liczba od 2 do ⌊√${n}⌋ = ${Math.floor(Math.sqrt(n))} nie dzieli ${n} – liczba pierwsza.`,
    });
    return frames;
  },
};

export const factorize: AlgorithmDef = {
  id: 'czynniki',
  title: 'Rozkład na czynniki pierwsze',
  category: 'Liczby',
  intro: [
    'Dzielimy liczbę przez kolejne dzielniki d = 2, 3, 4, …, dopóki się dzieli; każdy udany podział to czynnik pierwszy. Gdy d · d > n, a n > 1, to pozostałe n też jest czynnikiem pierwszym.',
  ],
  complexity: 'O(√n).',
  code: [
    'def czynniki(n):',
    '    wynik, d = [], 2',
    '    while d * d <= n:',
    '        while n % d == 0:',
    '            wynik.append(d)',
    '            n //= d',
    '        d += 1',
    '    if n > 1:',
    '        wynik.append(n)',
    '    return wynik',
  ],
  inputs: [{ name: 'n', label: 'n', kind: 'int', min: 2, max: 100_000_000, default: 360 }],
  run({ n: nRaw }) {
    let n = nRaw as number;
    const head = ['n', 'dzielnik', 'czynniki'];
    const rows: (string | number)[][] = [];
    const factors: number[] = [];
    const frames: Frame[] = [];
    for (let d = 2; d * d <= n; d += 1) {
      while (n % d === 0) {
        factors.push(d);
        rows.push([n, d, factors.join(' · ')]);
        frames.push({
          view: table(head, rows, rows.length - 1),
          line: 4,
          note: `${n} dzieli się przez ${d} → ${n / d}.`,
          vars: { n, d },
        });
        n /= d;
      }
    }
    if (n > 1) {
      factors.push(n);
      rows.push([n, n, factors.join(' · ')]);
      frames.push({
        view: table(head, rows, rows.length - 1),
        line: 8,
        note: `Zostało ${n} > 1 – to ostatni czynnik pierwszy.`,
        vars: { n },
      });
    }
    frames.push({ view: table(head, rows), line: 9, note: `${nRaw} = ${factors.join(' · ')}.` });
    return frames;
  },
};

export const toBinary: AlgorithmDef = {
  id: 'zamiana-systemu',
  title: 'Zamiana na system o podstawie p',
  category: 'Liczby',
  intro: [
    'Dzielimy liczbę przez podstawę p i zapisujemy reszty; dzielimy dalej iloraz, aż będzie równy 0. Cyfry wyniku to reszty czytane od ostatniej do pierwszej.',
  ],
  complexity: 'O(log n) dzieleń.',
  code: [
    'def zamien(n, p):',
    '    cyfry = "0123456789ABCDEF"',
    '    wynik = ""',
    '    while n > 0:',
    '        wynik = cyfry[n % p] + wynik',
    '        n //= p',
    '    return wynik or "0"',
  ],
  inputs: [
    {
      name: 'n',
      label: 'Liczba dziesiętna',
      kind: 'int',
      min: 0,
      max: 1_000_000_000,
      default: 186,
    },
    { name: 'p', label: 'Podstawa p', kind: 'int', min: 2, max: 16, default: 2 },
  ],
  run({ n: nRaw, p: pRaw }) {
    let n = nRaw as number;
    const p = pRaw as number;
    const digits = '0123456789ABCDEF';
    const head = ['n', `n div ${p}`, `n mod ${p}`, 'wynik'];
    const rows: (string | number)[][] = [];
    const frames: Frame[] = [];
    let result = '';
    if (n === 0)
      return [{ view: table(head, [[0, 0, 0, '0']]), line: 6, note: 'Zero zapisuje się jako 0.' }];
    while (n > 0) {
      result = digits[n % p] + result;
      rows.push([n, Math.floor(n / p), digits[n % p]!, result]);
      frames.push({
        view: table(head, rows, rows.length - 1),
        line: 4,
        note: `${n} = ${Math.floor(n / p)} · ${p} + ${n % p}; dopisujemy cyfrę ${digits[n % p]} z lewej.`,
        vars: { n, wynik: result },
      });
      n = Math.floor(n / p);
    }
    frames.push({
      view: table(head, rows),
      line: 6,
      note: `${nRaw}₁₀ = ${result} w systemie o podstawie ${p}.`,
    });
    return frames;
  },
};

export const horner: AlgorithmDef = {
  id: 'horner',
  title: 'Schemat Hornera',
  category: 'Liczby',
  intro: [
    'Wartość wielomianu a₀xⁿ + a₁xⁿ⁻¹ + … + aₙ liczymy bez potęgowania: w = a₀, potem w = w · x + aᵢ dla kolejnych współczynników – tylko n mnożeń.',
    'Tak samo zamienia się liczbę z systemu o podstawie p na dziesiętny: cyfry to współczynniki, a x = p (np. 1011₂ = ((1·2 + 0)·2 + 1)·2 + 1 = 11).',
  ],
  complexity: 'O(n) – n mnożeń i n dodawań.',
  code: [
    'def horner(wsp, x):',
    '    w = wsp[0]',
    '    for a in wsp[1:]:',
    '        w = w * x + a',
    '    return w',
  ],
  inputs: [
    {
      name: 'wsp',
      label: 'Współczynniki (od najwyższej potęgi)',
      kind: 'ints',
      min: -99,
      max: 99,
      minLength: 2,
      maxLength: 10,
      default: [2, -6, 2, -1],
    },
    { name: 'x', label: 'x', kind: 'int', min: -20, max: 20, default: 3 },
  ],
  run({ wsp, x: xRaw }) {
    const a = wsp as number[];
    const x = xRaw as number;
    const head = ['krok', 'współczynnik', 'w · x + a', 'w'];
    let w = a[0]!;
    const rows: (string | number)[][] = [[0, a[0]!, '–', w]];
    const frames: Frame[] = [
      {
        view: table(head, rows, 0),
        line: 1,
        note: `w = pierwszy współczynnik = ${w}.`,
        vars: { w },
      },
    ];
    for (let i = 1; i < a.length; i += 1) {
      const next = w * x + a[i]!;
      rows.push([i, a[i]!, `${w} · ${x} + ${a[i]} = ${next}`, next]);
      w = next;
      frames.push({
        view: table(head, rows, rows.length - 1),
        line: 3,
        note: `w = ${rows.at(-1)![2]}.`,
        vars: { w },
      });
    }
    frames.push({
      view: table(head, rows),
      line: 4,
      note: `Wartość wielomianu dla x = ${x} wynosi ${w}.`,
    });
    return frames;
  },
};

export const fastPower: AlgorithmDef = {
  id: 'szybkie-potegowanie',
  title: 'Szybkie potęgowanie',
  category: 'Liczby',
  intro: [
    'Zamiast mnożyć a przez siebie n razy, korzystamy z zapisu dwójkowego wykładnika: aⁿ = (a²)ⁿᐟ² dla parzystego n, a dla nieparzystego mnożymy wynik dodatkowo przez a. Liczba mnożeń to ok. 2 log₂ n.',
    'Z resztą z dzielenia (aⁿ mod m) to podstawa RSA – liczby nie rosną, bo po każdym mnożeniu bierzemy resztę.',
  ],
  complexity: 'O(log n) mnożeń.',
  code: [
    'def potega(a, n):',
    '    wynik = 1',
    '    while n > 0:',
    '        if n % 2 == 1:',
    '            wynik *= a',
    '        a *= a',
    '        n //= 2',
    '    return wynik',
  ],
  inputs: [
    { name: 'a', label: 'Podstawa a', kind: 'int', min: 0, max: 20, default: 3 },
    { name: 'n', label: 'Wykładnik n', kind: 'int', min: 0, max: 40, default: 13 },
  ],
  run({ a: aRaw, n: nRaw }) {
    let a = BigInt(aRaw as number);
    let n = nRaw as number;
    let result = 1n;
    const head = ['n', 'n (dwójkowo)', 'bit', 'wynik', 'a'];
    const rows: (string | number)[][] = [];
    const frames: Frame[] = [];
    while (n > 0) {
      const bit = n % 2;
      if (bit === 1) result *= a;
      rows.push([n, n.toString(2), bit, result.toString(), a.toString()]);
      frames.push({
        view: table(head, rows, rows.length - 1),
        line: bit ? 4 : 5,
        note: bit
          ? `n = ${n} jest nieparzyste – mnożymy wynik przez a.`
          : `n = ${n} jest parzyste – tylko podnosimy a do kwadratu.`,
        vars: { n, wynik: result.toString() },
      });
      a *= a;
      n = Math.floor(n / 2);
    }
    frames.push({
      view: table(head, rows),
      line: 7,
      note: `${aRaw}^${nRaw} = ${result} w ok. ${rows.length * 2} mnożeniach (zamiast ${Math.max(0, (nRaw as number) - 1)}).`,
    });
    return frames;
  },
};

export const NUMBERS = [euclid, sieve, primeTest, factorize, toBinary, horner, fastPower];
