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
