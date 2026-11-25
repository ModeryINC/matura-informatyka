import { describe, expect, it } from 'vitest';
import { findForbidden, stripCommentsAndStrings } from './restrictions';

const base = { note: 'Bez funkcji wbudowanych.' };

describe('findForbidden', () => {
  it('bez ograniczeń niczego nie zgłasza', () => {
    expect(findForbidden('print(sorted(t))', undefined)).toEqual([]);
  });

  it('wykrywa funkcje wbudowane i metody w kolejności użycia', () => {
    const code = 'def f(n):\n    s = str(n)\n    t = sorted(s)\n    return "".join(t).count("1")';
    expect(findForbidden(code, base)).toEqual(['str()', 'sorted()', '.join()', '.count()']);
  });

  it('pozwala na range, len, print i własne funkcje o tej samej nazwie', () => {
    const code =
      'def min(a, b):\n    return a if a < b else b\n\ndef f(t):\n    for i in range(len(t)):\n        print(min(t[i], 0))';
    expect(findForbidden(code, base)).toEqual([]);
  });

  it('pomija komentarze i napisy', () => {
    const code = "# sorted(t) byłoby prościej\nx = \"max(1, 2)\"\ny = '''sum(t)'''";
    expect(findForbidden(code, base)).toEqual([]);
  });

  it('zgłasza import i dodatkowe zakazy z zadania', () => {
    const code = 'import math\ndef f(t, n):\n    return t[1:] == t[:-1] and n ** 2';
    expect(findForbidden(code, { ...base, also: ['**', '[:]'] })).toEqual([
      'import',
      'wycinki t[a:b]',
      'potęgowanie **',
    ]);
    expect(findForbidden('def f(a):\n    return [a]', { ...base, also: ['[]'] })).toEqual([
      'listy/tablice [ ]',
    ]);
    // Bez zakazu w zadaniu wycinki i potęgowanie nie są zgłaszane.
    expect(findForbidden('x = t[1:] or 2 ** 3', base)).toEqual([]);
  });
});

describe('stripCommentsAndStrings', () => {
  it('zostawia kod, a usuwa treść napisów i komentarze', () => {
    expect(stripCommentsAndStrings('a = "x # y"  # komentarz\nb = \'z\'')).toBe('a = ""  \nb = ""');
  });
});
