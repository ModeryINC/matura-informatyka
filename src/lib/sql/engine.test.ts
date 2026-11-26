// @vitest-environment node
import initSqlJs, { type Database } from 'sql.js';
import {
  createDatabase,
  execute,
  formatValue,
  MAX_ROWS,
  SQL_JS_CONFIG,
  splitStatements,
  translateAccess,
} from './engine';
import { parseTable } from './tables';

let db: Database;

beforeAll(async () => {
  const SQL = await initSqlJs(SQL_JS_CONFIG);
  db = createDatabase(SQL, [
    parseTable(
      { name: 'osoby', path: 'p' },
      'id\timie\turodzony\tkwota\n1\tAnna\t2001-02-03\t10,5\n2\tJan\t1999-12-31\t4\n3\tEla\t2005-07-14\t\n',
    ),
  ]);
});

const values = (sql: string) => {
  const outcome = execute(db, sql);
  expect(outcome.error).toBeNull();
  return outcome.results.at(-1)!.rows;
};

describe('execute', () => {
  it('wykonuje zapytania na tabelach z plików', () => {
    expect(values('SELECT imie FROM osoby WHERE kwota > 5')).toEqual([['Anna']]);
    expect(values('SELECT COUNT(*), SUM(kwota) FROM osoby')).toEqual([[3, 14.5]]);
  });

  it('obsługuje funkcje z Accessa', () => {
    expect(
      values(
        `SELECT Year(urodzony), Month(urodzony), Day(urodzony), Left(imie, 2), Right(imie, 1),
          Mid(imie, 2, 2), Len(imie), UCase(imie), LCase('ĄB'), Int(2.7), IIf(id > 1, 'tak', 'nie'),
          DateDiff('d', '2020-01-01', '2020-03-01'), DateDiff('m', '2020-01-31', '2020-03-01'),
          DateDiff('yyyy', '2019-12-31', '2021-01-01'), Weekday('2024-06-02')
        FROM osoby WHERE id = 1`,
      ),
    ).toEqual([[2001, 2, 3, 'An', 'a', 'nn', 4, 'ANNA', 'ąb', 2, 'nie', 60, 2, 2, 1]]);
    expect(values("SELECT Hour('2019-05-22 16:05:09'), Minute('7:30'), Second('7:30:15')")).toEqual(
      [[16, 30, 15]],
    );
    expect(values("SELECT Year('05.06.2020'), Year('abc'), Right('x', 0)")).toEqual([
      [2020, null, ''],
    ]);
  });

  it('rozumie składnię Accessa: TOP, daty #…#, & i wzorce z *', () => {
    expect(values('SELECT TOP 1 imie FROM osoby ORDER BY urodzony DESC;')).toEqual([['Ela']]);
    expect(values('SELECT imie FROM osoby WHERE urodzony < #2000-01-01#')).toEqual([['Jan']]);
    expect(values('SELECT imie FROM osoby WHERE urodzony > #6/30/2005#')).toEqual([['Ela']]);
    expect(values("SELECT imie & ' ' & id FROM osoby WHERE id = 2")).toEqual([['Jan 2']]);
    expect(values('SELECT imie FROM osoby WHERE imie LIKE "*n*" ORDER BY id')).toEqual([
      ['Anna'],
      ['Jan'],
    ]);
  });

  it('zwraca wynik każdego zapytania, także pustego, i liczbę zmienionych wierszy', () => {
    const outcome = execute(
      db,
      "SELECT 1; SELECT imie FROM osoby WHERE id = 99; -- komentarz; \nSELECT ';' AS tekst",
    );
    expect(outcome.results.map((r) => r.rows.length)).toEqual([1, 0, 1]);
    expect(outcome.results[1]!.columns).toEqual(['imie']);
    expect(outcome.results[2]!.rows).toEqual([[';']]);
    const update = execute(db, 'CREATE TABLE t (x); INSERT INTO t VALUES (1), (2);');
    expect(update).toMatchObject({ results: [], error: null, changes: 2 });
  });

  it('zgłasza błędy i ucina bardzo długie wyniki', () => {
    expect(execute(db, 'SELECT nic FROM osoby').error).toMatch(/no such column/);
    const many = execute(
      db,
      `WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < ${MAX_ROWS + 5}) SELECT i FROM n`,
    );
    expect(many.results[0]!.rows).toHaveLength(MAX_ROWS);
    expect(many.results[0]!.truncated).toBe(true);
  });
});

describe('pomocnicze', () => {
  it('splitStatements dzieli po średnikach poza tekstem i komentarzami', () => {
    expect(splitStatements("SELECT 'a;b'; /* ; */ SELECT [x;y]; -- ;\n ;")).toEqual([
      "SELECT 'a;b'",
      'SELECT [x;y]',
    ]);
  });

  it('translateAccess nie zmienia tekstów w cudzysłowach', () => {
    expect(translateAccess("SELECT 'a & b', x & y FROM t WHERE n LIKE '%*%'")).toBe(
      "SELECT 'a & b', x || y FROM t WHERE n LIKE '%*%'",
    );
    expect(translateAccess('SELECT TOP 3 x FROM t LIMIT 2')).toBe('SELECT TOP 3 x FROM t LIMIT 2');
    expect(translateAccess('select distinct top 2 x from t')).toBe(
      'select distinct x from t LIMIT 2',
    );
    expect(translateAccess('SELECT „a”')).toBe('SELECT "a"');
  });

  it('formatValue usuwa błędy zaokrągleń', () => {
    expect(formatValue(0.1 + 0.2)).toBe('0.3');
    expect(formatValue(null)).toBe('');
    expect(formatValue(5)).toBe('5');
  });
});
