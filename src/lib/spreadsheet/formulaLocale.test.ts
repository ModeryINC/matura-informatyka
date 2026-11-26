import { toPolishFormula, translateFormula, translateInput } from './formulaLocale';

describe('translateFormula', () => {
  it.each([
    ['=SUMA(B2:B10)', '=SUM(B2:B10)'],
    ['=LICZ.WARUNKI(D2:D154;">100";B2:B154;"<300")', '=COUNTIFS(D2:D154,">100",B2:B154,"<300")'],
    ['=JEŻELI(ORAZ(D2>B2;D2>C2);1;0)', '=IF(AND(D2>B2,D2>C2),1,0)'],
    ['=zaokr(średnia(B2:B32);1)', '=ROUND(AVERAGE(B2:B32),1)'],
    ['=JEŻELI(A1>0,5;PRAWDA;FAŁSZ)', '=IF(A1>0.5,TRUE,FALSE)'],
    ['=MIESIĄC(A2)&"-"&DZIEŃ.TYG(A2;2)', '=MONTH(A2)&"-"&WEEKDAY(A2,2)'],
    ['=WYSZUKAJ.PIONOWO(B2;cennik!A:B;2;0)', '=VLOOKUP(B2,cennik!A:B,2,0)'],
  ])('%s → %s', (polish, english) => {
    expect(translateFormula(polish)).toBe(english);
  });

  it('nie zmienia tekstów w cudzysłowach ani formuł po angielsku', () => {
    expect(translateFormula('=JEŻELI(A1="SUMA(1;2)";1;0)')).toBe('=IF(A1="SUMA(1;2)",1,0)');
    expect(translateFormula('=SUM(A1,B1)')).toBe('=SUM(A1,B1)');
    expect(translateFormula('tekst')).toBe('tekst');
  });
});

describe('translateInput', () => {
  it('zamienia formuły po polsku i liczby z przecinkiem', () => {
    expect(translateInput('=SUMA(A1:A3)')).toBe('=SUM(A1:A3)');
    expect(translateInput('2,5')).toBe(2.5);
  });

  it('zwraca null, gdy nic nie trzeba zmieniać', () => {
    expect(translateInput('=SUM(A1:A3)')).toBeNull();
    expect(translateInput('Reneta')).toBeNull();
    expect(translateInput('12')).toBeNull();
    expect(translateInput(5)).toBeNull();
  });
});

describe('toPolishFormula', () => {
  it.each([
    ['=SUM(B2:B10)', '=SUMA(B2:B10)'],
    ['=COUNTIFS(D2:D154,">100",B2:B154,"<300")', '=LICZ.WARUNKI(D2:D154;">100";B2:B154;"<300")'],
    ['=IF(A1>0.5,TRUE,FALSE)', '=JEŻELI(A1>0,5;PRAWDA;FAŁSZ)'],
    ['=VLOOKUP(B2,cennik!A:B,2,0)', '=WYSZUKAJ.PIONOWO(B2;cennik!A:B;2;0)'],
    ['=CONCATENATE(A1,"; ",B1)', '=ZŁĄCZ.TEKSTY(A1;"; ";B1)'],
    ["=SUM('dane 1.5'!A:A)", "=SUMA('dane 1.5'!A:A)"],
    ['=CEILING(A1,2)', '=CEILING(A1;2)'],
    ['=A1*1.5', '=A1*1,5'],
  ])('%s → %s', (english, polish) => {
    expect(toPolishFormula(english)).toBe(polish);
  });

  it('nie zmienia wartości, które nie są formułą', () => {
    expect(toPolishFormula('1.5')).toBe('1.5');
    expect(toPolishFormula('SUM(1,2)')).toBe('SUM(1,2)');
  });

  it.each([
    '=SUM(B2:B10)',
    '=IF(AND(D2>B2,D2>C2),1,0)',
    '=IF(A1>0.5,TRUE,FALSE)',
    '=A1*1.5',
    '=MAX(A1*1.5)',
    '=MAX(1,5)',
    '=ROUND(AVERAGE(B2:B32),1)&" zł"',
    '=CEILING(A1,2)',
    '=A1+B1',
  ])('formuła wyświetlona po polsku wraca do tej samej: %s', (english) => {
    expect(translateFormula(toPolishFormula(english))).toBe(english);
  });
});

describe('rozpoznawanie języka formuły', () => {
  it('formuła bez wskazówek jest traktowana jak polska', () => {
    expect(translateFormula('=A1*1,5')).toBe('=A1*1.5');
    expect(translateFormula('=MAX(A1;B1)')).toBe('=MAX(A1,B1)');
  });

  it('angielska nazwa funkcji albo TRUE/FALSE oznacza formułę po angielsku', () => {
    expect(translateFormula('=SUM(1,5)')).toBe('=SUM(1,5)');
    expect(translateFormula('=IF(A1,TRUE,0)')).toBe('=IF(A1,TRUE,0)');
  });
});
