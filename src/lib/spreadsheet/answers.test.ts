import type { SpreadsheetTable } from '../../types';
import {
  fieldMatches,
  fitSelection,
  isoToSerial,
  parseClock,
  parseDateTime,
  parseDate,
  parseNumber,
  serialToIso,
  tableMatches,
  valueMatches,
} from './answers';

describe('parseNumber', () => {
  it.each([
    ['19', 19],
    ['2 422 669,40', 2422669.4],
    ['2 422 669,40 zł', 2422669.4],
    ['3 089,10 zł', 3089.1],
    ['41498,2 kg', 41498.2],
    ['-1.5', -1.5],
    ['30 razy', 30],
  ])('%s → %d', (text, value) => {
    expect(parseNumber(text)).toBe(value);
  });

  it.each(['', 'Reneta', '164-61-25-530', '1 2', '12,'])('%s nie jest liczbą', (text) => {
    expect(parseNumber(text)).toBeNull();
  });
});

describe('daty', () => {
  it.each(['2035-12-13', '13.12.2035', '13-12-2035', '13/12/2035', '2035.12.13'])(
    '%s → 2035-12-13',
    (text) => expect(parseDate(text)).toBe('2035-12-13'),
  );

  it('odrzuca nieistniejące daty i inne napisy', () => {
    expect(parseDate('31.02.2024')).toBeNull();
    expect(parseDate('Reneta')).toBeNull();
  });

  it('zamienia numer seryjny daty w obie strony', () => {
    expect(isoToSerial('2020-05-01')).toBe(43952);
    expect(serialToIso(43952)).toBe('2020-05-01');
  });
});

describe('valueMatches', () => {
  it('porównuje liczby z dokładnością klucza', () => {
    expect(valueMatches('19', '19')).toBe(true);
    expect(valueMatches('19,4', '19')).toBe(false);
    expect(valueMatches('1,13', '1.1')).toBe(true);
    expect(valueMatches('1,16', '1.1')).toBe(false);
    expect(valueMatches('2 422 669,4', '2422669.40')).toBe(true);
    expect(valueMatches('3092,29', '3092.2943', 0.01)).toBe(true);
    expect(valueMatches('3092', '3092.2943', 0.01)).toBe(false);
    expect(valueMatches('abc', '19')).toBe(false);
  });

  it('porównuje daty w różnych zapisach i jako numer seryjny', () => {
    expect(valueMatches('29.05.2033', '2033-05-29')).toBe(true);
    expect(valueMatches(String(isoToSerial('2033-05-29')), '2033-05-29')).toBe(true);
    expect(valueMatches('30.05.2033', '2033-05-29')).toBe(false);
    expect(valueMatches('maj', '2033-05-29')).toBe(false);
  });

  it('porównuje tekst bez względu na wielkość liter i spacje', () => {
    expect(valueMatches('  reneta ', 'Reneta')).toBe(true);
    expect(valueMatches('Mare  Boreum', 'Mare Boreum')).toBe(true);
    expect(valueMatches('Gala', 'Reneta')).toBe(false);
    expect(valueMatches('', 'Reneta')).toBe(false);
  });

  it('uwzględnia odpowiedzi alternatywne', () => {
    const field = { label: 'Dzień', expected: '167', alternatives: ['2023-08-14'] };
    expect(fieldMatches('167', field)).toBe(true);
    expect(fieldMatches('14.08.2023', field)).toBe(true);
    expect(fieldMatches('166', field)).toBe(false);
  });
});

const table: SpreadsheetTable = {
  rows: ['maj', 'czerwiec'],
  columns: ['maliny', 'truskawki'],
  expected: [
    ['1', '2'],
    ['3', '4'],
  ],
};

describe('zestawienia', () => {
  it('sprawdza każdą komórkę', () => {
    expect(
      tableMatches(
        [
          ['1', '2'],
          ['3', '5'],
        ],
        table,
      ),
    ).toEqual([
      [true, true],
      [true, false],
    ]);
    expect(tableMatches([], table)).toEqual([
      [false, false],
      [false, false],
    ]);
  });

  it('dopasowuje zaznaczenie z podpisami wierszy i kolumn', () => {
    expect(
      fitSelection(
        [
          ['miesiąc', 'maliny', 'truskawki'],
          ['maj', '1', '2'],
          ['czerwiec', '3', '4'],
        ],
        table,
      ),
    ).toEqual(table.expected);
  });

  it('dopasowuje zaznaczenie samych wartości i transponowane', () => {
    expect(fitSelection(table.expected, table)).toEqual(table.expected);
    expect(
      fitSelection(
        [
          ['', 'maj', 'czerwiec'],
          ['maliny', '1', '3'],
          ['truskawki', '2', '4'],
        ],
        table,
      ),
    ).toEqual(table.expected);
  });

  it('odrzuca zaznaczenie złego rozmiaru', () => {
    expect(fitSelection([['1']], table)).toBeNull();
  });
});

describe('godziny, daty z godziną i polskie znaki', () => {
  it('porównuje godziny w różnych zapisach i jako ułamek doby', () => {
    expect(parseClock('9:05')).toBe(545);
    expect(valueMatches('19:54:00', '19:54')).toBe(true);
    expect(valueMatches(String(1194 / 1440), '19:54')).toBe(true);
    expect(valueMatches('19:55', '19:54')).toBe(false);
    expect(valueMatches('abc', '19:54')).toBe(false);
  });

  it('porównuje daty z godziną w różnych zapisach i jako numer seryjny', () => {
    expect(parseDateTime('22.05.2019 16:00')).toBe('2019-05-22 16:00');
    expect(valueMatches('22.05.2019 16:00', '2019-05-22 16:00')).toBe(true);
    expect(valueMatches('2019-05-22 4:00', '2019-05-22 04:00')).toBe(true);
    expect(valueMatches(String(isoToSerial('2019-05-22') + 16 / 24), '2019-05-22 16:00')).toBe(
      true,
    );
    expect(valueMatches('2019-05-22 17:00', '2019-05-22 16:00')).toBe(false);
    expect(valueMatches('jutro', '2019-05-22 16:00')).toBe(false);
  });

  it('pomija polskie znaki w tekście', () => {
    expect(valueMatches('Ciechanów', 'Ciechanow')).toBe(true);
    expect(valueMatches('Łódź', 'lodz')).toBe(true);
  });
});
