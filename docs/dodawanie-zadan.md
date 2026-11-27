# Jak dodać zadanie

Zadania jednej sesji są w pliku `src/data/tasks/<rok>-<sesja>.json` (tablica obiektów).
Sesja musi istnieć w `public/arkusze/<rok>/<sesja>/` – katalog generuje się sam.

## 1. Opis zadania

Wspólne pola:

| Pole          | Opis                                                      |
| ------------- | --------------------------------------------------------- |
| `id`          | `<rok>-<sesja>-<numer>`, np. `2024-maj-3.2` (unikalne)    |
| `sessionId`   | `<rok>/<sesja>`, np. `2024/maj`                           |
| `number`      | numer z arkusza, np. `3.2`                                |
| `title`       | krótki tytuł                                              |
| `part`        | `1` (część pisemna) albo `2` (przy komputerze)            |
| `points`      | maksymalna liczba punktów                                 |
| `topics`      | lista tematów – klucze z `TOPICS` w `src/types.ts`        |
| `summary`     | własne streszczenie polecenia (akapity oddzielone `\n\n`) |
| `starterCode` | kod wstawiany do edytora                                  |
| `kind`        | `program` albo `function`                                 |

### Zadanie typu `program`

```json
{
  "kind": "program",
  "checks": [
    {
      "label": "Dane przykładowe (przyklad.txt)",
      "files": { "liczby.txt": "arkusze/2024/maj/pliki/Dane/przyklad.txt" },
      "expected": "199"
    },
    {
      "label": "Dane egzaminacyjne (liczby.txt)",
      "files": { "liczby.txt": "arkusze/2024/maj/pliki/Dane/liczby.txt" },
      "expected": "212",
      "alternatives": ["213"]
    }
  ]
}
```

- `files` – klucz to nazwa pliku widoczna dla programu, wartość – ścieżka względem `public/`,
- `expected` – odpowiedź z klucza CKE (zasady porównywania: `src/lib/compare.ts`),
- `alternatives` – opcjonalnie inne odpowiedzi uznawane przez klucz.

### Zadanie typu `function`

```json
{
  "kind": "function",
  "functionName": "skrot",
  "tests": [
    { "args": [294762], "expected": 97 },
    { "args": [39101], "expected": 3911 }
  ]
}
```

`args` i `expected` to wartości JSON. Liczby całkowite w testach muszą mieścić się w zakresie
bezpiecznym dla JavaScriptu (|x| < 2⁵³).

### Ograniczenia z arkusza (opcjonalnie)

Gdy arkusz zabrania funkcji wbudowanych („w zapisie możesz wykorzystać tylko operacje
arytmetyczne…”), dodaj pole `restrictions`:

```json
"restrictions": {
  "note": "Na maturze wolno tu używać tylko operacji arytmetycznych… bez funkcji wbudowanych.",
  "also": ["**", "[:]", "[]"]
}
```

`note` jest pokazywany na stronie zadania, a `also` (opcjonalne) dodaje zakazy potęgowania,
wycinków list i list w ogóle. Strona ostrzega, gdy kod ucznia używa zakazanych konstrukcji
(`src/lib/restrictions.ts`) – nie wpływa to na zaliczenie testów.

## 2. Rozwiązanie wzorcowe

Dodaj `solutions/<rok>-<sesja>/<numer>.py`:

- dla `program` – pełny program czytający pliki z bieżącego katalogu i wypisujący wynik,
- dla `function` – definicja funkcji o nazwie `functionName`.

## 3. Sprawdzenie

```bash
npm run verify:solutions -- 2024-maj   # tylko zadania o id zaczynającym się od 2024-maj
npm test                               # walidacja JSON, istnienie plików, unikalność id
```

Oba polecenia działają też w CI – pull request z błędnym kluczem nie przejdzie.

## 4. Strona w arkuszu

Podgląd PDF otwiera się na stronie z zadaniem. Po dodaniu zadań odśwież mapowanie
(wymaga `pdftotext` z pakietu poppler):

```bash
python scripts/find_sheet_pages.py   # zapisuje src/data/sheet-pages.json
```

## Zadania z arkusza kalkulacyjnego (Zadania → Excel)

Plik `src/data/spreadsheet/<rok>-<sesja>.json` to tablica zadań; jedno zadanie obejmuje
całe zadanie z arkusza (np. „Zadanie 6. Konfitury owocowe”) z podpunktami:

```json
{
  "id": "2023-maj-6",
  "sessionId": "2023/maj",
  "number": "6",
  "title": "Konfitury owocowe",
  "summary": "Wprowadzenie z arkusza (akapity oddzielone \n\n)",
  "files": [
    { "sheet": "owoce", "path": "arkusze/2023/maj/pliki/Dane_2305/owoce.txt", "hasHeader": true }
  ],
  "parts": [
    {
      "number": "6.2",
      "points": 1,
      "prompt": "…",
      "fields": [{ "label": "Liczba dni", "expected": "19" }]
    },
    {
      "number": "6.3",
      "points": 3,
      "prompt": "…",
      "chart": "opis wykresu (nie jest sprawdzany)",
      "table": { "rows": ["…"], "columns": ["…"], "expected": [["41"], ["72"], ["40"]] }
    }
  ]
}
```

- `files` – każdy plik trafia do osobnej karty arkusza. `hasHeader: true`, gdy pierwszy wiersz
  pliku to nagłówki; `headers: [...]` dopisuje nagłówki plikowi, który ich nie ma;
  `separator: ";"` (lub `" "`), gdy kolumny nie są rozdzielone tabulatorem. Pusta lista –
  zadanie bez pliku (symulacja), zaczyna się od pustego arkusza. Daty (`rrrr-mm-dd`,
  `dd.mm.rrrr`, `d-mm-rrrr`), godziny i daty z godziną są wczytywane jako wartości czasu.
- podpunkt z samym `chart` (bez `fields` i `table`) to wykres – nie jest sprawdzany i nie liczy
  się do postępu.
- `fields` – pojedyncze odpowiedzi; `alternatives` – inne poprawne zapisy, `tolerance` –
  dopuszczalna różnica liczb (domyślnie: liczby całkowite dokładnie, ułamki z dokładnością
  ostatniej cyfry klucza). Daty zapisuj jako `rrrr-mm-dd`.
- `table` – zestawienie; uczeń może je wstawić z zaznaczenia (z podpisami lub bez, także
  transponowane). Podpunkt może mieć jednocześnie `fields` i `table`.

Klucz potwierdź obliczeniami w `solutions/excel/<id>.py` (opis w `solutions/README.md`)
i uruchom `npm run verify:excel`, a potem `python scripts/find_sheet_pages.py`.

## Zadania z baz danych (Zadania → SQL)

Plik `src/data/sql/<rok>-<sesja>.json` to tablica zadań; jedno zadanie obejmuje całe zadanie
z arkusza (np. „Zadanie 8. Sieć sklepów”):

```json
{
  "id": "2026-maj-8",
  "sessionId": "2026/maj",
  "number": "8",
  "title": "Sieć sklepów",
  "summary": "Wprowadzenie z arkusza (akapity oddzielone

)",
  "tables": [{ "name": "klienci", "path": "arkusze/2026/maj/pliki/Dane-NF-2605/klienci.txt" }],
  "parts": [
    {
      "number": "8.2",
      "points": 2,
      "prompt": "…",
      "list": { "columns": ["płeć", "liczba klientów"], "expected": [["K", "689"], ["M", "651"]] }
    },
    { "number": "8.3", "points": 2, "prompt": "…", "fields": [{ "label": "…", "expected": "28" }] },
    { "number": "8.5", "points": 2, "prompt": "…", "query": "SELECT … (przykład z klucza)" }
  ]
}
```

- `tables` – każdy plik to tabela o podanej nazwie (litery, cyfry, `_`). Pierwszy wiersz to
  nazwy pól; `headers: [...]` podaje je dla pliku bez nagłówka. Separator (tabulator, średnik,
  spacja) i kodowanie (UTF-8, UTF-16, Windows-1250) są wykrywane, a typy pól (liczby, daty,
  godziny, tekst) – rozpoznawane z zawartości.
- `list` – zbiór wierszy bez względu na kolejność wierszy i kolumn; odpowiedź może mieć
  dodatkowe kolumny, ale tyle samo wierszy co klucz. `fields` i `table` działają jak w zadaniach
  z Excela; podpunkt może mieć `fields` i `list` naraz (np. nazwa i lista jej elementów).
- `query` – podpunkt, w którym zapytanie pisze się na kartce (tabel nie ma w plikach): pokazujemy
  przykładowe rozwiązanie z klucza, a podpunkt nie liczy się do postępu.

Klucz potwierdź zapytaniami w `solutions/sql/<id>.sql` – podpunkty oddziela komentarz
`-- 8.1`. Pola dostają kolejne wartości ze wszystkich wyników podpunktu, a `table` i `list` –
wiersze ostatniego wyniku. Uruchom `npm run verify:sql` (zapytania wykonuje ten sam silnik co
strona), a potem `python scripts/find_sheet_pages.py`.

## Zadania otwarte (Zadania → Test)

Podpunkty, których nie da się rozwiązać w edytorze (analiza algorytmu, uzupełnianie
tabeli, złożoność, krótkie odpowiedzi z teorii), trafiają do `src/data/open/<sesja>.json`
– jeden plik na sesję, np. `2024-maj.json`. Każde zadanie z arkusza to jeden obiekt:

```json
{
  "id": "2024-maj-2",
  "sessionId": "2024/maj",
  "number": "2",
  "title": "Cyfry",
  "intro": "Wspólny opis zadania (Markdown: akapity, `kod`, bloki ```, tabele | a | b |).",
  "parts": [
    {
      "number": "2.2",
      "points": 1,
      "prompt": "Treść podpunktu.",
      "answer": "Rozwiązanie z klucza CKE.",
      "accepted": ["111111333333111111"]
    }
  ]
}
```

- `id` to `<sesja z myślnikiem>-<numer zadania>`; test `src/data/open.test.ts` pilnuje formatu.
- `accepted` (opcjonalne) – krótkie odpowiedzi sprawdzane automatycznie (bez wielkości liter
  i odstępów). Bez tego pola zdający po odsłonięciu klucza sam ocenia odpowiedź.
- Rysunki zostają w arkuszu – strona zadania ma przycisk „Pokaż arkusz (PDF)”.
- Po dodaniu zadań uruchom `python scripts/find_sheet_pages.py` i `npx prettier --write
  src/data/sheet-pages.json`, żeby podgląd PDF otwierał się na właściwej stronie.
