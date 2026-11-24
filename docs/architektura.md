# Architektura

## Założenia

- **Bez serwera** – statyczne pliki na GitHub Pages; cała logika (w tym Python) działa
  w przeglądarce.
- **Dane jako pliki** – katalog arkuszy jest generowany z drzewa `public/arkusze`, zadania są
  opisane w plikach JSON i walidowane w testach.
- **Logika oddzielona od UI** – wszystko, co da się przetestować bez przeglądarki, jest
  w `src/lib` (czyste funkcje) i `src/python/runner.ts` (z możliwością podmiany workera).

## Przepływ danych

```
public/arkusze/**  ──(scripts/build-catalog.ts)──▶  src/data/catalog.generated.json ─┐
src/data/tasks/*.json ───────────────(import.meta.glob + validateTask)───────────────┤
                                                                                    ▼
                                                                         src/data/index.ts
                                                                                    │
                                     ┌──────────────────────────────────────────────┤
                                     ▼                                              ▼
                       pages/TasksPage (filterTasks)                 pages/TaskPage + CodeEditor
                                                                                    │ kod
                                                                                    ▼
                                                                    python/runner.ts (PythonRunner)
                                                                      │ postMessage    ▲ wyniki
                                                                      ▼                │
                                                              python/worker.ts ── Pyodide + harness.py
                                                                                    │
                                                                lib/compare.ts ◀────┘ (wyjście programu)
                                                                                    │
                                                                lib/storage.ts (localStorage)
```

## Najważniejsze moduły

| Moduł                    | Odpowiedzialność                                                        |
| ------------------------ | ----------------------------------------------------------------------- |
| `src/types.ts`           | model domenowy: sesje, zadania (`program` / `function`), wyniki, tematy |
| `src/lib/sessions.ts`    | rozpoznawanie rodzaju sesji z nazwy folderu, sortowanie                 |
| `src/lib/compare.ts`     | porównywanie wyjścia programu z kluczem                                 |
| `src/lib/search.ts`      | filtrowanie zadań i synchronizacja filtrów z adresem URL                |
| `src/lib/storage.ts`     | zapis rozwiązań w `localStorage` + zdarzenia zmian                      |
| `src/lib/validate.ts`    | walidacja plików zadań                                                  |
| `src/python/protocol.ts` | typy wiadomości wątek główny ↔ worker                                   |
| `src/python/worker.ts`   | ładowanie Pyodide, wirtualny system plików, wywołanie harnessu          |
| `src/python/harness.py`  | wykonanie kodu użytkownika, przechwycenie stdout, porównanie wyników    |
| `src/python/runner.ts`   | cykl życia workera, limit czasu, budowanie `SubmissionResult`           |

## Decyzje projektowe

- **HashRouter** – GitHub Pages nie przepisuje adresów, więc trasy są po `#`
  (np. `#/zadanie/2024-maj-3.2`). Dzięki temu odświeżenie strony i linki działają zawsze.
- **Pyodide z CDN** – paczka ma kilkanaście MB; ładujemy ją leniwie przy pierwszym
  uruchomieniu kodu, a przeglądarka trzyma ją w pamięci podręcznej.
- **Web Worker + limit czasu** – jedyny niezawodny sposób przerwania nieskończonej pętli
  w Pyodide to zakończenie workera; `PythonRunner` robi to automatycznie.
- **Rozwiązania wzorcowe w CI** – każde oczekiwane `expected` jest potwierdzone uruchomieniem
  programu w prawdziwym CPythonie (`npm run verify:solutions`), więc literówka w kluczu nie
  przejdzie niezauważona.
- **Tolerancyjne porównywanie** – na maturze liczy się wynik, nie format; sprawdzarka
  akceptuje opisy, różne układy linii i dłuższe rozwinięcia dziesiętne.
- **Czysty CSS** – tokeny w zmiennych CSS, motyw jasny/ciemny przez
  `prefers-color-scheme` i atrybut `data-theme`, właściwości logiczne, `clamp()`,
  `color-mix()`, `:focus-visible`, `prefers-reduced-motion`.

## Dostępność

- link „Przejdź do treści”, semantyczne nagłówki i punkty orientacyjne (`header`, `nav`,
  `main`, `search`),
- przełączniki tematów jako przyciski z `aria-pressed`,
- wyniki sprawdzania w regionie `aria-live`, stan interpretera w `role="status"`,
- pełna obsługa klawiaturą (w edytorze: <kbd>Esc</kbd>, potem <kbd>Tab</kbd> wychodzi z pola).
