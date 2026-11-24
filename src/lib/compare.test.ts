import { normalizeLines, outputMatches, outputMatchesAny, tokenize, tokensEqual } from './compare';

describe('normalizeLines', () => {
  it('usuwa puste linie, spacje i zamienia przecinek dziesiętny', () => {
    expect(normalizeLines('  Wynik:   2,5 \r\n\r\n ABC  ')).toEqual(['wynik: 2.5', 'abc']);
  });
});

describe('tokenize', () => {
  it('dzieli po spacjach i interpunkcji', () => {
    expect(tokenize('odpowiedź: 42, (7)')).toEqual(['odpowiedź', '42', '7']);
  });
  it('zachowuje liczby ujemne i dziesiętne', () => {
    expect(tokenize('-3.5 i 10.')).toEqual(['-3.5', 'i', '10']);
  });
});

describe('outputMatches', () => {
  it('akceptuje identyczny wynik', () => {
    expect(outputMatches('42\n', '42')).toBe(true);
  });

  it('akceptuje wynik z opisem', () => {
    expect(outputMatches('Odpowiedź: 42', '42')).toBe(true);
  });

  it('nie akceptuje liczby, która tylko zawiera oczekiwaną', () => {
    expect(outputMatches('420', '42')).toBe(false);
  });

  it('wymaga zachowania kolejności linii', () => {
    expect(outputMatches('1\n2\n3', '1\n3')).toBe(true);
    expect(outputMatches('3\n1', '1\n3')).toBe(false);
  });

  it('ignoruje wielkość liter i przecinek dziesiętny', () => {
    expect(outputMatches('ALA MA KOTA\n3.75', 'ala ma kota\n3,75')).toBe(true);
  });

  it('dla odpowiedzi tekstowych wymaga całej linii w jednej linii wyjścia', () => {
    expect(outputMatches('ala ma\nkota', 'ala ma kota')).toBe(false);
  });

  it('dla odpowiedzi liczbowych ignoruje podział na linie i opisy', () => {
    expect(outputMatches('12\n7', '12 7')).toBe(true);
    expect(outputMatches('Średnia: 5.52\nLiczba: 50\nPoczątek: 5', '5,52 50 5')).toBe(true);
    expect(outputMatches('4.3\n10\n12\n14', '10 12 14')).toBe(true);
    expect(outputMatches('10 14 12', '10 12 14')).toBe(false);
  });

  it('obsługuje pusty oczekiwany wynik', () => {
    expect(outputMatches('', '')).toBe(true);
    expect(outputMatches('coś', '')).toBe(false);
  });
});

describe('tokensEqual', () => {
  it('porównuje liczby dziesiętne z dokładnością oczekiwanej odpowiedzi', () => {
    expect(tokensEqual('5.5216', '5.52')).toBe(true);
    expect(tokensEqual('1200.704918032787', '1200.70')).toBe(true);
    expect(tokensEqual('1200.7', '1200.70')).toBe(true);
    expect(tokensEqual('5.53', '5.52')).toBe(false);
  });

  it('liczby całkowite i tekst muszą być identyczne', () => {
    expect(tokensEqual('42.0', '42')).toBe(false);
    expect(tokensEqual('abc', '1.5')).toBe(false);
  });
});

test('outputMatches toleruje dłuższe rozwinięcie dziesiętne', () => {
  expect(outputMatches('Średnia: 5.5199999 50 5', '5,52 50 5')).toBe(true);
});

test('outputMatchesAny akceptuje odpowiedzi alternatywne', () => {
  expect(outputMatchesAny('20992 10', '99792 10', ['20992 10', '56064 10'])).toBe(true);
  expect(outputMatchesAny('12345 10', '99792 10', ['20992 10'])).toBe(false);
  expect(outputMatchesAny('99792 10', '99792 10')).toBe(true);
});
