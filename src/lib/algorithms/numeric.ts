import type { AlgorithmDef, Frame, TableView } from './types';

const fmt = (x: number) => String(Number(x.toPrecision(8)));
const table = (head: string[], rows: (string | number)[][], current?: number): TableView => ({
  kind: 'table',
  head,
  rows: rows.map((r) => [...r]),
  current,
});

export const bisection: AlgorithmDef = {
  id: 'bisekcja',
  title: 'Miejsce zerowe – metoda połowienia (bisekcja)',
  category: 'Metody numeryczne',
  intro: [
    'Jeśli funkcja ciągła ma na końcach przedziału [a, b] wartości o różnych znakach, to ma w nim miejsce zerowe. Dzielimy przedział na pół i zostawiamy tę połowę, na której końcach znaki nadal są różne – aż przedział będzie dostatecznie krótki.',
    'Tu: f(x) = x³ − x − 2 (miejsce zerowe ok. 1,5214) albo dowolne x² − c (wtedy liczymy √c).',
  ],
  complexity: 'Każdy krok połowi przedział: do dokładności ε potrzeba ok. log₂((b − a)/ε) kroków.',
  code: [
    'def bisekcja(f, a, b, eps):',
    '    while b - a > eps:',
    '        s = (a + b) / 2',
    '        if f(a) * f(s) <= 0:',
    '            b = s',
    '        else:',
    '            a = s',
    '    return (a + b) / 2',
  ],
  inputs: [
    {
      name: 'c',
      label: 'c w f(x) = x² − c (0 – użyj x³ − x − 2)',
      kind: 'int',
      min: 0,
      max: 1000,
      default: 0,
    },
    { name: 'kroki', label: 'Liczba kroków', kind: 'int', min: 1, max: 30, default: 12 },
  ],
  run({ c, kroki }) {
    const f = (x: number) => ((c as number) === 0 ? x ** 3 - x - 2 : x * x - (c as number));
    let a = 0;
    let b = (c as number) === 0 ? 2 : Math.max(1, c as number);
    const head = ['krok', 'a', 'b', 's', 'f(s)', 'nowy przedział'];
    const rows: (string | number)[][] = [];
    const frames: Frame[] = [];
    for (let k = 1; k <= (kroki as number); k += 1) {
      const s = (a + b) / 2;
      const left = f(a) * f(s) <= 0;
      rows.push([k, fmt(a), fmt(b), fmt(s), fmt(f(s)), left ? '[a, s]' : '[s, b]']);
      frames.push({
        view: table(head, rows, rows.length - 1),
        line: left ? 4 : 6,
        note: `f(${fmt(a)}) i f(${fmt(s)}) ${left ? 'mają różne znaki – zostaje lewa połowa' : 'mają ten sam znak – zostaje prawa połowa'}.`,
        vars: { a: fmt(a), b: fmt(b), s: fmt(s) },
      });
      if (left) b = s;
      else a = s;
    }
    frames.push({
      view: table(head, rows),
      line: 7,
      note: `Przybliżenie miejsca zerowego: ${fmt((a + b) / 2)} (przedział długości ${fmt(b - a)}).`,
    });
    return frames;
  },
};

export const heron: AlgorithmDef = {
  id: 'heron',
  title: 'Pierwiastek kwadratowy – metoda Herona',
  category: 'Metody numeryczne',
  intro: [
    'Szukamy √c. Zaczynamy od dowolnego przybliżenia x > 0 i zastępujemy je średnią z x i c/x: jeśli x jest za duże, c/x jest za małe, więc średnia jest bliżej wyniku. Zbieżność jest bardzo szybka – liczba poprawnych cyfr mniej więcej podwaja się w każdym kroku (to metoda Newtona dla x² − c).',
  ],
  complexity: 'Kilka kroków do pełnej dokładności liczb typu float.',
  code: [
    'def pierwiastek(c, eps):',
    '    x = c',
    '    while abs(x * x - c) > eps:',
    '        x = (x + c / x) / 2',
    '    return x',
  ],
  inputs: [{ name: 'c', label: 'c', kind: 'int', min: 1, max: 1_000_000, default: 10 }],
  run({ c: cRaw }) {
    const c = cRaw as number;
    let x = c;
    const head = ['krok', 'x', 'c / x', 'x²'];
    const rows: (string | number)[][] = [[0, fmt(x), fmt(c / x), fmt(x * x)]];
    const frames: Frame[] = [
      { view: table(head, rows, 0), line: 1, note: `Start: x = c = ${c}.`, vars: { x: fmt(x) } },
    ];
    for (let k = 1; k <= 30 && Math.abs(x * x - c) > 1e-9 * Math.max(1, c); k += 1) {
      x = (x + c / x) / 2;
      rows.push([k, fmt(x), fmt(c / x), fmt(x * x)]);
      frames.push({
        view: table(head, rows, rows.length - 1),
        line: 3,
        note: `x = (x + c/x) / 2 = ${fmt(x)}.`,
        vars: { x: fmt(x) },
      });
    }
    frames.push({ view: table(head, rows), line: 4, note: `√${c} ≈ ${fmt(x)}.` });
    return frames;
  },
};

export const rectangles: AlgorithmDef = {
  id: 'pole-prostokaty',
  title: 'Pole pod wykresem – metoda prostokątów i trapezów',
  category: 'Metody numeryczne',
  intro: [
    'Przybliżamy pole pod wykresem funkcji f na [a, b], dzieląc przedział na n równych części szerokości h = (b − a)/n. Metoda prostokątów sumuje h · f(środek części), metoda trapezów – h · (f(lewy) + f(prawy)) / 2. Im większe n, tym dokładniej.',
    'Tu: f(x) = x² na [0, 2] – dokładne pole to 8/3 ≈ 2,6667.',
  ],
  complexity: 'O(n) obliczeń wartości funkcji.',
  code: [
    'def pole(f, a, b, n):',
    '    h = (b - a) / n',
    '    prostokaty = trapezy = 0',
    '    for i in range(n):',
    '        x = a + i * h',
    '        prostokaty += h * f(x + h / 2)',
    '        trapezy += h * (f(x) + f(x + h)) / 2',
    '    return prostokaty, trapezy',
  ],
  inputs: [{ name: 'n', label: 'Liczba części n', kind: 'int', min: 1, max: 20, default: 4 }],
  run({ n: nRaw }) {
    const n = nRaw as number;
    const f = (x: number) => x * x;
    const h = 2 / n;
    let rect = 0;
    let trap = 0;
    const head = ['i', 'x', 'prostokąt h·f(x+h/2)', 'trapez', 'suma (prost.)', 'suma (trap.)'];
    const rows: (string | number)[][] = [];
    const frames: Frame[] = [];
    for (let i = 0; i < n; i += 1) {
      const x = i * h;
      const r = h * f(x + h / 2);
      const t = (h * (f(x) + f(x + h))) / 2;
      rect += r;
      trap += t;
      rows.push([i, fmt(x), fmt(r), fmt(t), fmt(rect), fmt(trap)]);
      frames.push({
        view: table(head, rows, rows.length - 1),
        line: 5,
        note: `Część ${i + 1}: [${fmt(x)}, ${fmt(x + h)}].`,
        vars: { h: fmt(h), x: fmt(x) },
      });
    }
    frames.push({
      view: table(head, rows),
      line: 7,
      note: `Prostokąty: ${fmt(rect)}, trapezy: ${fmt(trap)}; dokładnie 8/3 ≈ 2,666667.`,
    });
    return frames;
  },
};

export const NUMERIC = [bisection, heron, rectangles];
