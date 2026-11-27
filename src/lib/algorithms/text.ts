import type { AlgorithmDef, Frame, Role } from './types';

export const palindrome: AlgorithmDef = {
  id: 'palindrom',
  title: 'Palindrom',
  category: 'Teksty',
  intro: [
    'Słowo jest palindromem, gdy czytane od końca jest takie samo (kajak, potop). Porównujemy znaki parami od zewnątrz: pierwszy z ostatnim, drugi z przedostatnim…, aż wskaźniki się spotkają.',
  ],
  complexity: 'O(n), najwyżej n/2 porównań.',
  code: [
    'def czy_palindrom(s):',
    '    i, j = 0, len(s) - 1',
    '    while i < j:',
    '        if s[i] != s[j]:',
    '            return False',
    '        i += 1',
    '        j -= 1',
    '    return True',
  ],
  inputs: [{ name: 's', label: 'Słowo', kind: 'text', default: 'kobylamamalybok' }],
  run({ s }) {
    const chars = [...(s as string)];
    const frames: Frame[] = [];
    let i = 0;
    let j = chars.length - 1;
    const ok: Partial<Record<number, Role>> = {};
    while (i < j) {
      const same = chars[i] === chars[j];
      frames.push({
        view: {
          kind: 'text',
          rows: [
            { chars, roles: { ...ok, [i]: same ? 'found' : 'swap', [j]: same ? 'found' : 'swap' } },
          ],
        },
        line: 3,
        note: same
          ? `s[${i}] = s[${j}] = „${chars[i]}”.`
          : `s[${i}] = „${chars[i]}” ≠ s[${j}] = „${chars[j]}” – to nie palindrom.`,
        vars: { i, j },
      });
      if (!same) return frames;
      ok[i] = 'sorted';
      ok[j] = 'sorted';
      i += 1;
      j -= 1;
    }
    frames.push({
      view: {
        kind: 'text',
        rows: [{ chars, roles: Object.fromEntries(chars.map((_, k) => [k, 'sorted'])) }],
      },
      line: 7,
      note: `„${s}” jest palindromem.`,
    });
    return frames;
  },
};

export const patternSearch: AlgorithmDef = {
  id: 'wzorzec',
  title: 'Wyszukiwanie wzorca w tekście',
  category: 'Teksty',
  intro: [
    'Metoda naiwna: przykładamy wzorzec do kolejnych pozycji tekstu i porównujemy znak po znaku. Przy niezgodności przesuwamy wzorzec o jedno miejsce w prawo.',
    'Szybsze algorytmy (np. KMP) korzystają z tego, co już wiadomo o dopasowanych znakach, i nie cofają się w tekście.',
  ],
  complexity: 'O(n · m) w najgorszym przypadku (n – długość tekstu, m – wzorca).',
  code: [
    'def szukaj_wzorca(tekst, wzorzec):',
    '    n, m = len(tekst), len(wzorzec)',
    '    wynik = []',
    '    for i in range(n - m + 1):',
    '        j = 0',
    '        while j < m and tekst[i + j] == wzorzec[j]:',
    '            j += 1',
    '        if j == m:',
    '            wynik.append(i)',
    '    return wynik',
  ],
  inputs: [
    { name: 'tekst', label: 'Tekst', kind: 'text', default: 'abrakadabra' },
    { name: 'wzorzec', label: 'Wzorzec', kind: 'text', default: 'abra' },
  ],
  run({ tekst, wzorzec }) {
    const t = [...(tekst as string)];
    const p = [...(wzorzec as string)];
    const frames: Frame[] = [];
    const found: number[] = [];
    const foundRoles = () =>
      Object.fromEntries(found.flatMap((f) => p.map((_, k) => [f + k, 'sorted']))) as Partial<
        Record<number, Role>
      >;
    for (let i = 0; i + p.length <= t.length; i += 1) {
      let j = 0;
      while (j < p.length && t[i + j] === p[j]) j += 1;
      const roles: Partial<Record<number, Role>> = { ...foundRoles() };
      const proles: Partial<Record<number, Role>> = {};
      for (let k = 0; k < j; k += 1) {
        roles[i + k] = 'found';
        proles[k] = 'found';
      }
      if (j < p.length) {
        roles[i + j] = 'swap';
        proles[j] = 'swap';
      }
      if (j === p.length) found.push(i);
      frames.push({
        view: {
          kind: 'text',
          rows: [
            { label: 'tekst', chars: t, roles },
            { label: 'wzorzec', chars: p, roles: proles, offset: i },
          ],
        },
        line: j === p.length ? 8 : 5,
        note:
          j === p.length
            ? `Pozycja ${i}: cały wzorzec pasuje!`
            : `Pozycja ${i}: zgodnych ${j} znaków, potem „${t[i + j]}” ≠ „${p[j]}”.`,
        vars: { i, j },
      });
    }
    frames.push({
      view: { kind: 'text', rows: [{ label: 'tekst', chars: t, roles: foundRoles() }] },
      line: 9,
      note: found.length
        ? `Wzorzec występuje na pozycjach: ${found.join(', ')}.`
        : 'Wzorzec nie występuje w tekście.',
    });
    return frames;
  },
};

export const anagram: AlgorithmDef = {
  id: 'anagram',
  title: 'Anagramy',
  category: 'Teksty',
  intro: [
    'Dwa słowa są anagramami, gdy składają się z tych samych liter w tej samej liczbie (np. „karma” i „marka”, „kot” i „tok”). Najprościej policzyć wystąpienia każdej litery w obu słowach i porównać liczniki – albo posortować litery obu słów.',
  ],
  complexity: 'O(n) ze zliczaniem, O(n log n) z sortowaniem.',
  code: [
    'def czy_anagramy(a, b):',
    '    if len(a) != len(b):',
    '        return False',
    '    licz = {}',
    '    for z in a:',
    '        licz[z] = licz.get(z, 0) + 1',
    '    for z in b:',
    '        licz[z] = licz.get(z, 0) - 1',
    '    return all(v == 0 for v in licz.values())',
  ],
  inputs: [
    { name: 'a', label: 'Pierwsze słowo', kind: 'text', default: 'karma' },
    { name: 'b', label: 'Drugie słowo', kind: 'text', default: 'marka' },
  ],
  run({ a, b }) {
    const s = [...(a as string)];
    const t = [...(b as string)];
    const counts = new Map<string, number>();
    const frames: Frame[] = [];
    const table = (current?: string) => ({
      kind: 'table' as const,
      head: ['litera', 'licznik'],
      rows: [...counts.entries()].map(([k, v]) => [k, v]),
      current: current === undefined ? undefined : [...counts.keys()].indexOf(current),
    });
    if (s.length !== t.length) {
      return [
        {
          view: table(),
          line: 2,
          note: `Słowa mają różne długości (${s.length} i ${t.length}) – to nie anagramy.`,
        },
      ];
    }
    s.forEach((z) => {
      counts.set(z, (counts.get(z) ?? 0) + 1);
      frames.push({
        view: table(z),
        line: 5,
        note: `Pierwsze słowo: litera „${z}” → +1.`,
        vars: { z },
      });
    });
    t.forEach((z) => {
      counts.set(z, (counts.get(z) ?? 0) - 1);
      frames.push({
        view: table(z),
        line: 7,
        note: `Drugie słowo: litera „${z}” → −1.`,
        vars: { z },
      });
    });
    const ok = [...counts.values()].every((v) => v === 0);
    frames.push({
      view: table(),
      line: 8,
      note: ok
        ? 'Wszystkie liczniki są równe 0 – to anagramy.'
        : 'Któryś licznik jest różny od 0 – to nie anagramy.',
    });
    return frames;
  },
};

export const TEXT = [palindrome, patternSearch, anagram];
