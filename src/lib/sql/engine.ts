/**
 * Baza danych SQLite (sql.js, licencja MIT) z tabelami z plików zadania.
 *
 * Na maturze najczęściej używa się Accessa, więc oprócz zwykłego SQL-a (SQLite)
 * rozumiemy też typowe elementy jego dialektu: `SELECT TOP n`, daty `#2020-05-01#`,
 * łączenie tekstów `&`, wzorce `LIKE "*abc*"`, funkcje `Year()`, `Month()`, `Day()`,
 * `Left()`, `Right()`, `Mid()`, `Len()`, `UCase()`, `LCase()`, `Int()`, `IIf()`,
 * `DateDiff()` i `Weekday()`.
 */
import type { Database, SqlJsStatic, SqlValue as SqlJsValue } from 'sql.js';
import type { SqlType, SqlValue, TableData } from './tables';

export interface QueryResult {
  columns: string[];
  rows: SqlValue[][];
  /** Wierszy było więcej niż `MAX_ROWS` – pokazujemy początek. */
  truncated: boolean;
}

export interface QueryOutcome {
  results: QueryResult[];
  error: string | null;
  /** Wiersze zmienione przez ostatnie polecenie INSERT/UPDATE/DELETE. */
  changes: number;
}

export const MAX_ROWS = 5000;

/**
 * Konfiguracja sql.js: bez dawnych funkcji rozszerzeń biblioteki (będą wyłączone
 * w kolejnej wersji) – działają natywne funkcje SQLite i nasze funkcje z Accessa.
 */
export const SQL_JS_CONFIG = { useOldExtensionFunctions: false } as Record<string, unknown>;

const quoteId = (name: string) => `"${name.replace(/"/g, '""')}"`;

/** Data jako `[rok, miesiąc, dzień]` (z `rrrr-mm-dd` lub `dd.mm.rrrr`) albo `null`. */
function dateParts(value: unknown): [number, number, number] | null {
  if (typeof value !== 'string') return null;
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(value);
  if (iso) return [Number(iso[1]), Number(iso[2]), Number(iso[3])];
  const pl = /^(\d{1,2})[.-](\d{1,2})[.-](\d{4})/.exec(value);
  if (pl) return [Number(pl[3]), Number(pl[2]), Number(pl[1])];
  return null;
}

function timeParts(value: unknown): [number, number, number] | null {
  if (typeof value !== 'string') return null;
  const match = /(?:^|[ T])(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3] ?? 0)] : null;
}

const toDate = (value: unknown) => {
  const parts = dateParts(value);
  if (!parts) return null;
  const time = timeParts(value) ?? [0, 0, 0];
  return Date.UTC(parts[0], parts[1] - 1, parts[2], ...time);
};

const text = (value: unknown) => (value === null || value === undefined ? null : String(value));

/** `DateDiff("d", od, do)` z Accessa: d – dni, m – miesiące, yyyy – lata, h – godziny, n – minuty. */
function dateDiff(interval: unknown, from: unknown, to: unknown): number | null {
  const a = toDate(from);
  const b = toDate(to);
  if (a === null || b === null) return null;
  const da = new Date(a);
  const db = new Date(b);
  switch (String(interval).toLowerCase()) {
    case 'yyyy':
      return db.getUTCFullYear() - da.getUTCFullYear();
    case 'q':
      return (
        Math.floor(db.getUTCMonth() / 3) -
        Math.floor(da.getUTCMonth() / 3) +
        4 * (db.getUTCFullYear() - da.getUTCFullYear())
      );
    case 'm':
      return db.getUTCMonth() - da.getUTCMonth() + 12 * (db.getUTCFullYear() - da.getUTCFullYear());
    case 'ww':
    case 'w':
      return Math.trunc((b - a) / (7 * 86_400_000));
    case 'h':
      return Math.trunc((b - a) / 3_600_000);
    case 'n':
      return Math.trunc((b - a) / 60_000);
    case 's':
      return Math.trunc((b - a) / 1000);
    default:
      return Math.round(
        (Date.UTC(db.getUTCFullYear(), db.getUTCMonth(), db.getUTCDate()) -
          Date.UTC(da.getUTCFullYear(), da.getUTCMonth(), da.getUTCDate())) /
          86_400_000,
      );
  }
}

/** Funkcje znane z Accessa (i MySQL), których SQLite nie ma. */
function registerFunctions(db: Database) {
  const fn = (name: string, impl: (...args: never[]) => SqlJsValue) =>
    db.create_function(name, impl as (...args: SqlJsValue[]) => SqlJsValue);
  fn('YEAR', (v: unknown) => dateParts(v)?.[0] ?? null);
  fn('MONTH', (v: unknown) => dateParts(v)?.[1] ?? null);
  fn('DAY', (v: unknown) => dateParts(v)?.[2] ?? null);
  fn('HOUR', (v: unknown) => timeParts(v)?.[0] ?? null);
  fn('MINUTE', (v: unknown) => timeParts(v)?.[1] ?? null);
  fn('SECOND', (v: unknown) => timeParts(v)?.[2] ?? null);
  // Weekday z Accessa: niedziela = 1, …, sobota = 7.
  fn('WEEKDAY', (v: unknown) => {
    const time = toDate(v);
    return time === null ? null : new Date(time).getUTCDay() + 1;
  });
  fn('LEFT', (v: unknown, n: unknown) => text(v)?.slice(0, Math.max(0, Number(n))) ?? null);
  fn('RIGHT', (v: unknown, n: unknown) => {
    const s = text(v);
    const count = Math.max(0, Number(n));
    return s === null ? null : count === 0 ? '' : s.slice(-count);
  });
  fn(
    'MID',
    (v: unknown, start: unknown, length: unknown) =>
      text(v)?.substr(Math.max(0, Number(start) - 1), Math.max(0, Number(length))) ?? null,
  );
  fn('LEN', (v: unknown) => text(v)?.length ?? null);
  fn('UCASE', (v: unknown) => text(v)?.toLocaleUpperCase('pl') ?? null);
  fn('LCASE', (v: unknown) => text(v)?.toLocaleLowerCase('pl') ?? null);
  fn('INT', (v: unknown) => (v === null ? null : Math.floor(Number(v))));
  fn('DATEDIFF', (interval: unknown, from: unknown, to: unknown) => dateDiff(interval, from, to));
}

/** Tworzy bazę w pamięci z tabelami zadania. */
export function createDatabase(SQL: SqlJsStatic, tables: TableData[]): Database {
  const db = new SQL.Database();
  registerFunctions(db);
  const affinity: Record<SqlType, string> = {
    INTEGER: 'INTEGER',
    REAL: 'REAL',
    DATE: 'DATE',
    DATETIME: 'DATETIME',
    TIME: 'TIME',
    TEXT: 'TEXT',
  };
  db.exec('BEGIN');
  for (const table of tables) {
    const columns = table.columns.map((c, i) => `${quoteId(c)} ${affinity[table.types[i]!]}`);
    db.exec(`CREATE TABLE ${quoteId(table.name)} (${columns.join(', ')})`);
    const insert = db.prepare(
      `INSERT INTO ${quoteId(table.name)} VALUES (${table.columns.map(() => '?').join(', ')})`,
    );
    for (const row of table.rows) insert.run(row);
    insert.free();
  }
  db.exec('COMMIT');
  return db;
}

/**
 * Dzieli tekst na polecenia po średnikach (poza tekstami w cudzysłowach,
 * nazwami w nawiasach kwadratowych i komentarzami).
 */
export function splitStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  for (let i = 0; i < sql.length; i += 1) {
    const ch = sql[i]!;
    const close = ch === "'" || ch === '"' || ch === '`' ? ch : ch === '[' ? ']' : null;
    if (close) {
      const end = sql.indexOf(close, i + 1);
      const stop = end === -1 ? sql.length : end + 1;
      current += sql.slice(i, stop);
      i = stop - 1;
    } else if (ch === '-' && sql[i + 1] === '-') {
      const end = sql.indexOf('\n', i);
      i = end === -1 ? sql.length : end;
      current += '\n';
    } else if (ch === '/' && sql[i + 1] === '*') {
      const end = sql.indexOf('*/', i + 2);
      i = end === -1 ? sql.length : end + 1;
      current += ' ';
    } else if (ch === ';') {
      statements.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  statements.push(current);
  return statements.map((s) => s.trim()).filter((s) => s !== '');
}

/** Zamienia fragmenty poza tekstami w cudzysłowach (`'…'`, `"…"`). */
function outsideStrings(sql: string, replace: (code: string) => string): string {
  return sql
    .split(/('(?:[^']|'')*'|"(?:[^"]|"")*")/)
    .map((part, i) => (i % 2 === 1 ? part : replace(part)))
    .join('');
}

/** Elementy dialektu Accessa zamienione na SQLite (jedno polecenie). */
export function translateAccess(statement: string): string {
  let sql = statement.replace(/[„“”]/g, '"').replace(/[‘’]/g, "'");
  // Wzorce LIKE z Accessa: * → %, ? → _ (tylko gdy wzorzec nie używa % ani _).
  sql = sql.replace(
    /(\bLIKE\s+)(['"])((?:(?!\2).)*)\2/gi,
    (match, like: string, quote: string, pattern: string) =>
      /[%_]/.test(pattern) || !/[*?]/.test(pattern)
        ? match
        : `${like}${quote}${pattern.replace(/\*/g, '%').replace(/\?/g, '_')}${quote}`,
  );
  sql = outsideStrings(sql, (code) =>
    code
      // Daty w Accessie: #2020-05-01# lub #5/1/2020# (miesiąc/dzień/rok).
      .replace(
        /#(\d{4})-(\d{1,2})-(\d{1,2})#/g,
        (_, y: string, m: string, d: string) =>
          `'${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}'`,
      )
      .replace(
        /#(\d{1,2})\/(\d{1,2})\/(\d{4})#/g,
        (_, m: string, d: string, y: string) =>
          `'${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}'`,
      )
      .replace(/&/g, '||'),
  );
  // SELECT TOP n … → SELECT … LIMIT n (tylko w zapytaniu głównym).
  const top = /^(\s*SELECT\s+(?:DISTINCT\s+)?)TOP\s+(\d+)\s+/i.exec(sql);
  if (top && !/\bLIMIT\s+\d+\s*$/i.test(sql)) {
    sql = `${top[1]}${sql.slice(top[0].length)} LIMIT ${top[2]}`;
  }
  return sql;
}

/** Wykonuje polecenia i zbiera wyniki wszystkich zapytań zwracających wiersze. */
export function execute(db: Database, sql: string): QueryOutcome {
  const results: QueryResult[] = [];
  let changes = 0;
  try {
    for (const statement of splitStatements(sql)) {
      const translated = translateAccess(statement);
      for (const stmt of db.iterateStatements(translated)) {
        try {
          const columns = stmt.getColumnNames();
          const rows: SqlValue[][] = [];
          let truncated = false;
          while (stmt.step()) {
            if (rows.length >= MAX_ROWS) {
              truncated = true;
              break;
            }
            rows.push(stmt.get().map((v) => (v instanceof Uint8Array ? '[dane binarne]' : v)));
          }
          if (columns.length > 0) results.push({ columns, rows, truncated });
          else changes = db.getRowsModified();
        } finally {
          stmt.free();
        }
      }
    }
    return { results, error: null, changes };
  } catch (error) {
    return { results, error: error instanceof Error ? error.message : String(error), changes };
  }
}

/** Wartość z wyniku jako tekst (liczby bez błędów zaokrągleń typu 0,30000000000000004). */
export function formatValue(value: SqlValue): string {
  if (value === null) return '';
  if (typeof value === 'number' && !Number.isInteger(value)) {
    return String(Number(value.toPrecision(12)));
  }
  return String(value);
}
