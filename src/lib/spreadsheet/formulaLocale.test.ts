import { translateFormula, translateInput } from './formulaLocale';

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
