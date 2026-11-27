/**
 * Treść podstrony „Podstawy SQL”: krótkie wyjaśnienia i zapytania, które można
 * zmienić i uruchomić na małej przykładowej bazie (public/podstawy/sql).
 *
 * Każde zapytanie jest wykonywane w testach (`src/data/sqlBasics.test.ts`),
 * więc nie może kończyć się błędem ani zwracać pustego wyniku.
 */
import type { SqlTable } from '../types';

export interface SqlBasicsExample {
  sql: string;
}

export interface SqlBasicsSection {
  id: string;
  title: string;
  /** Akapity wprowadzenia; `kod` w odwrotnych apostrofach. */
  intro: string[];
  examples: SqlBasicsExample[];
  /** Wskazówki maturalne / typowe pułapki. */
  tips?: string[];
}

/** Przykładowa baza: uczniowie, klasy i oceny (jak w zadaniach maturalnych – pliki tekstowe). */
export const SQL_BASICS_TABLES: SqlTable[] = [
  { name: 'uczniowie', path: 'podstawy/sql/uczniowie.txt' },
  { name: 'klasy', path: 'podstawy/sql/klasy.txt' },
  { name: 'oceny', path: 'podstawy/sql/oceny.txt' },
];

export const SQL_BASICS: SqlBasicsSection[] = [
  {
    id: 'select',
    title: 'Wybieranie danych: SELECT i WHERE',
    intro: [
      'Zapytanie `SELECT` wybiera kolumny z tabeli (`*` – wszystkie), a `WHERE` zostawia tylko wiersze spełniające warunek. Warunki łączy się przez `AND`, `OR` i `NOT`.',
      "Teksty zapisuje się w apostrofach (`'3a'`), liczby bez nich. Zakres sprawdza `BETWEEN a AND b`, listę wartości – `IN (…)`.",
    ],
    examples: [
      {
        sql: `SELECT imie, nazwisko, klasa
FROM uczniowie
WHERE plec = 'K' AND klasa IN ('3a', '3b');`,
      },
      {
        sql: `SELECT *
FROM oceny
WHERE ocena >= 5 AND przedmiot = 'informatyka';`,
      },
    ],
    tips: [
      'Na maturze tabele powstają z plików tekstowych – najpierw obejrzyj nazwy pól (tu: panel „Tabele” w zadaniu albo `SELECT * … LIMIT 5`).',
      'Porównanie z `NULL` (pustą wartością) robi się przez `IS NULL` / `IS NOT NULL`, nie przez `=`.',
    ],
  },
  {
    id: 'sortowanie',
    title: 'Sortowanie i pierwsze wiersze',
    intro: [
      '`ORDER BY` sortuje rosnąco, `ORDER BY … DESC` – malejąco; można podać kilka kolumn (najpierw według pierwszej, przy remisie według kolejnej).',
      '`LIMIT n` zostawia pierwsze `n` wierszy. W Accessie to samo robi `SELECT TOP n …` (tutaj też działa).',
    ],
    examples: [
      {
        sql: `SELECT imie, nazwisko, data_urodzenia
FROM uczniowie
ORDER BY data_urodzenia
LIMIT 3;`,
      },
      {
        sql: `SELECT TOP 5 id_ucznia, przedmiot, ocena, data
FROM oceny
ORDER BY ocena DESC, data;`,
      },
    ],
    tips: [
      'Pytanie „kto ma najwięcej…” to zwykle `ORDER BY … DESC LIMIT 1` – ale sprawdź, czy nie ma remisu na pierwszym miejscu (wtedy pokaż wszystkie osoby z wynikiem równym maksimum).',
    ],
  },
  {
    id: 'agregacja',
    title: 'Funkcje agregujące',
    intro: [
      '`COUNT(*)` liczy wiersze, `SUM`, `AVG`, `MIN`, `MAX` – sumę, średnią, minimum i maksimum kolumny. Bez `GROUP BY` dają jeden wiersz dla całej tabeli (po `WHERE`).',
      '`ROUND(x, 2)` zaokrągla do dwóch miejsc po przecinku. Kolumnie wyniku można nadać nazwę przez `AS`.',
    ],
    examples: [
      {
        sql: `SELECT COUNT(*) AS liczba_ocen,
       ROUND(AVG(ocena), 2) AS srednia,
       MIN(ocena) AS najgorsza,
       MAX(ocena) AS najlepsza
FROM oceny;`,
      },
    ],
    tips: [
      '`COUNT(kolumna)` pomija puste wartości, a `COUNT(DISTINCT kolumna)` liczy różne wartości.',
    ],
  },
  {
    id: 'grupowanie',
    title: 'Grupowanie: GROUP BY i HAVING',
    intro: [
      '`GROUP BY` dzieli wiersze na grupy o tej samej wartości (np. przedmiotu) i liczy funkcję agregującą osobno dla każdej grupy.',
      '`WHERE` filtruje wiersze przed grupowaniem, `HAVING` – całe grupy po policzeniu (np. tylko przedmioty ze średnią powyżej 4).',
    ],
    examples: [
      {
        sql: `SELECT przedmiot, COUNT(*) AS ile, ROUND(AVG(ocena), 2) AS srednia
FROM oceny
GROUP BY przedmiot
ORDER BY srednia DESC;`,
      },
      {
        sql: `SELECT id_ucznia, COUNT(*) AS ile_ocen
FROM oceny
GROUP BY id_ucznia
HAVING COUNT(*) >= 4;`,
      },
    ],
    tips: [
      'Każda kolumna w `SELECT` musi być albo w `GROUP BY`, albo w funkcji agregującej – inaczej Access zgłosi błąd (SQLite zwróci przypadkową wartość z grupy).',
    ],
  },
  {
    id: 'join',
    title: 'Łączenie tabel: JOIN',
    intro: [
      'Dane są zwykle w kilku tabelach połączonych wspólnym polem (tu: `id_ucznia` w `uczniowie` i `oceny`, `klasa` w `uczniowie` i `klasy`). `JOIN … ON` łączy wiersze, w których te pola są równe.',
      'Gdy dwie tabele mają kolumnę o tej samej nazwie, poprzedź ją nazwą tabeli (`u.klasa`) – krótkie aliasy nadaje się po nazwie tabeli.',
    ],
    examples: [
      {
        sql: `SELECT u.imie, u.nazwisko, o.przedmiot, o.ocena
FROM uczniowie AS u
JOIN oceny AS o ON o.id_ucznia = u.id_ucznia
WHERE o.ocena = 6;`,
      },
      {
        sql: `SELECT k.wychowawca, ROUND(AVG(o.ocena), 2) AS srednia_klasy
FROM klasy AS k
JOIN uczniowie AS u ON u.klasa = k.klasa
JOIN oceny AS o ON o.id_ucznia = u.id_ucznia
GROUP BY k.klasa, k.wychowawca
ORDER BY srednia_klasy DESC;`,
      },
    ],
    tips: [
      'Zapomniany warunek `ON` daje iloczyn kartezjański – każdy wiersz z każdym. Wynik jest wtedy podejrzanie duży (albo zapytanie przekracza limit czasu).',
    ],
  },
  {
    id: 'brakujace',
    title: 'Czego brakuje: LEFT JOIN i NOT IN',
    intro: [
      'Zwykły `JOIN` pomija wiersze bez pary. `LEFT JOIN` zostawia wszystkie wiersze z lewej tabeli – tam, gdzie pary nie ma, kolumny z prawej są puste (`NULL`).',
      'Pytania typu „którzy uczniowie nie mają żadnej oceny” rozwiązuje `LEFT JOIN … WHERE prawa.kolumna IS NULL` albo `NOT IN (podzapytanie)`.',
    ],
    examples: [
      {
        sql: `SELECT u.imie, u.nazwisko
FROM uczniowie AS u
LEFT JOIN oceny AS o ON o.id_ucznia = u.id_ucznia
WHERE o.id_oceny IS NULL;`,
      },
      {
        sql: `SELECT imie, nazwisko
FROM uczniowie
WHERE id_ucznia NOT IN (SELECT id_ucznia FROM oceny WHERE przedmiot = 'informatyka');`,
      },
    ],
  },
  {
    id: 'teksty',
    title: 'Teksty i wzorce: LIKE',
    intro: [
      '`LIKE` porównuje ze wzorcem: `%` to dowolny ciąg znaków, `_` – jeden znak. W Accessie odpowiednikami są `*` i `?` (tu też działają).',
      'Przydatne funkcje: `length(t)`, `substr(t, od, ile)`, `upper(t)`, `lower(t)`; teksty łączy `||` (w Accessie `&`).',
    ],
    examples: [
      {
        sql: `SELECT imie, nazwisko
FROM uczniowie
WHERE nazwisko LIKE '%ska' OR imie LIKE 'O%';`,
      },
      {
        sql: `SELECT imie || ' ' || nazwisko AS osoba,
       substr(imie, 1, 1) || '.' AS inicjal,
       length(nazwisko) AS dlugosc
FROM uczniowie
ORDER BY dlugosc DESC
LIMIT 5;`,
      },
    ],
    tips: [
      '`LIKE` w SQLite nie rozróżnia wielkości liter (dla liter łacińskich), tak jak w Accessie.',
    ],
  },
  {
    id: 'daty',
    title: 'Daty',
    intro: [
      "Daty są zapisane jako `rrrr-mm-dd`, więc porównuje się je i sortuje jak tekst: `data >= '2025-10-01'`. Rok i miesiąc wyciąga `strftime('%Y', data)` i `strftime('%m', data)` albo – jak w Accessie – `Year(data)` i `Month(data)`.",
      'Liczbę dni między datami daje `julianday(do) - julianday(od)` (w Accessie `DateDiff("d", od, do)`), a przesunięcie daty – `date(data, \'+7 days\')`.',
    ],
    examples: [
      {
        sql: `SELECT Month(data) AS miesiac, COUNT(*) AS ile_ocen
FROM oceny
GROUP BY Month(data)
ORDER BY miesiac;`,
      },
      {
        sql: `SELECT imie, nazwisko, data_urodzenia,
       CAST(julianday('2026-05-04') - julianday(data_urodzenia) AS INTEGER) AS dni_do_matury
FROM uczniowie
WHERE strftime('%m', data_urodzenia) IN ('01', '02', '03');`,
      },
    ],
    tips: [
      "`strftime` zwraca tekst (`'03'`), a `Month()` liczbę (`3`) – porównuj z wartością tego samego typu.",
    ],
  },
  {
    id: 'podzapytania',
    title: 'Podzapytania i WITH',
    intro: [
      'Zapytanie można wstawić w inne: w `WHERE` (np. porównanie ze średnią), w `FROM` (jak tymczasową tabelę) albo nazwać je przez `WITH nazwa AS (…)` i używać jak tabeli.',
      'Na maturze w Accessie to zwykle dwie zapisane kwerendy – druga korzysta z wyniku pierwszej. `WITH` robi to samo w jednym zapytaniu.',
    ],
    examples: [
      {
        sql: `SELECT id_ucznia, przedmiot, ocena
FROM oceny
WHERE ocena > (SELECT AVG(ocena) FROM oceny)
ORDER BY ocena DESC
LIMIT 5;`,
      },
      {
        sql: `WITH srednie AS (
  SELECT id_ucznia, AVG(ocena) AS srednia
  FROM oceny
  GROUP BY id_ucznia
)
SELECT u.imie, u.nazwisko, ROUND(s.srednia, 2) AS srednia
FROM srednie AS s
JOIN uczniowie AS u ON u.id_ucznia = s.id_ucznia
WHERE s.srednia = (SELECT MAX(srednia) FROM srednie);`,
      },
    ],
    tips: [
      'Porównanie z maksimum z podzapytania (jak wyżej) pokazuje wszystkich ex aequo – bezpieczniej niż `LIMIT 1`.',
    ],
  },
  {
    id: 'warunki',
    title: 'Wartości warunkowe: CASE i IIf',
    intro: [
      '`CASE WHEN warunek THEN a ELSE b END` wybiera wartość zależnie od warunku – w Accessie służy do tego `IIf(warunek; a; b)` (tu: `IIf(warunek, a, b)`).',
      'Razem z `SUM` pozwala liczyć kilka rzeczy naraz, np. liczbę ocen dobrych i słabych w jednym wierszu.',
    ],
    examples: [
      {
        sql: `SELECT przedmiot,
       SUM(CASE WHEN ocena >= 4 THEN 1 ELSE 0 END) AS dobre,
       SUM(IIf(ocena <= 2, 1, 0)) AS slabe
FROM oceny
GROUP BY przedmiot;`,
      },
    ],
  },
  {
    id: 'distinct',
    title: 'Bez powtórzeń: DISTINCT',
    intro: [
      '`SELECT DISTINCT` usuwa powtarzające się wiersze wyniku – np. lista przedmiotów, z których ktoś dostał szóstkę.',
      'Liczbę różnych wartości daje `COUNT(DISTINCT kolumna)`. W Accessie tego skrótu nie ma – robi się podzapytanie z `SELECT DISTINCT` i liczy jego wiersze.',
    ],
    examples: [
      {
        sql: `SELECT DISTINCT przedmiot
FROM oceny
WHERE ocena = 6;`,
      },
      {
        sql: `SELECT klasa, COUNT(DISTINCT o.przedmiot) AS ile_przedmiotow
FROM uczniowie AS u
JOIN oceny AS o ON o.id_ucznia = u.id_ucznia
GROUP BY klasa;`,
      },
    ],
  },
];
