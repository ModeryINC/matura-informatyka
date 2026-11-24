import { normalizeLines, outputMatches, tokenize } from './compare';

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

  it('wymaga wszystkich tokenów linii w jednej linii wyjścia', () => {
    expect(outputMatches('12 7', '12 7')).toBe(true);
    expect(outputMatches('12\n7', '12 7')).toBe(false);
  });

  it('obsługuje pusty oczekiwany wynik', () => {
    expect(outputMatches('', '')).toBe(true);
    expect(outputMatches('coś', '')).toBe(false);
  });
});
