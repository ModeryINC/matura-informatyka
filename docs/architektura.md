# Architektura

## Założenia

- **Statyczna strona** – pliki na GitHub Pages; Python (Pyodide), arkusz kalkulacyjny
  (Fortune Sheet) i baza danych (sql.js) działają w przeglądarce. Jedyny element po stronie
  serwera to opcjonalny pośrednik podpowiedzi AI (Cloudflare Worker).
- **Dane użytkownika tylko lokalnie** – rozwiązania i odpowiedzi są w `localStorage`; nie ma
  kont ani synchronizacji między urządzeniami.
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

| Moduł                    | Odpowiedzialność                                                         |
| ------------------------ | ------------------------------------------------------------------------ |
| `src/types.ts`           | model domenowy: sesje, zadania (`program` / `function`), wyniki, tematy  |
| `src/lib/sessions.ts`    | rozpoznawanie rodzaju sesji z nazwy folderu, sortowanie                  |
| `src/lib/compare.ts`     | porównywanie wyjścia programu z kluczem                                  |
| `src/lib/search.ts`      | filtrowanie zadań i synchronizacja filtrów z adresem URL                 |
| `src/lib/storage.ts`     | zapis rozwiązań w `localStorage` + zdarzenia zmian                       |
| `src/lib/validate.ts`    | walidacja plików zadań                                                   |
| `src/python/protocol.ts` | typy wiadomości wątek główny ↔ worker                                    |
| `src/python/worker.ts`   | ładowanie Pyodide, wirtualny system plików, wywołanie harnessu           |
| `src/python/harness.py`  | wykonanie kodu użytkownika, przechwycenie stdout, porównanie wyników     |
| `src/python/runner.ts`   | cykl życia workera, limit czasu, budowanie `SubmissionResult`            |
| `src/lib/spreadsheet/`   | zadania z Excela: wczytanie danych, formuły po polsku, sprawdzanie, xlsx |
| `src/lib/sql/tables.ts`  | pliki z danymi → tabele (kodowanie, separator, typy pól, daty)           |
| `src/lib/sql/engine.ts`  | baza SQLite (sql.js), tłumaczenie składni Accessa, wykonanie zapytań     |
| `src/lib/sql/client.ts`  | worker z bazą, limit czasu zapytania, odtwarzanie danych                 |
| `src/components/Layout`  | nagłówek, nawigacja (na telefonie – dolny pasek), stopka                 |

## Decyzje projektowe

- **HashRouter** – GitHub Pages nie przepisuje adresów, więc trasy są po `#`
  (np. `#/zadanie/2024-maj-3.2`). Dzięki temu odświeżenie strony i linki działają zawsze.
- **Pyodide z CDN** – paczka ma kilkanaście MB; ładujemy ją leniwie przy pierwszym
  uruchomieniu kodu, a przeglądarka trzyma ją w pamięci podręcznej.
- **Web Worker + limit czasu** – jedyny niezawodny sposób przerwania nieskończonej pętli
  w Pyodide to zakończenie workera; `PythonRunner` robi to automatycznie.
- **Konsola z wejściem podanym z góry** – „Uruchom” wysyła wyjście na bieżąco (komunikaty
  `output`, grupowane w harnessie po pełnych liniach). Prawdziwie interaktywne `input()`
  wymagałoby zatrzymania workera (`SharedArrayBuffer` + `Atomics.wait`), a to wymaga
  nagłówków COOP/COEP, których GitHub Pages nie wysyła. Dlatego dane dla `input()` wpisuje
  się w pole „Wejście” przed uruchomieniem; harness podmienia `input` i `sys.stdin`, a wpisane
  wartości pokazuje w konsoli. Przy „Sprawdź” wejście jest puste, a wyjście nie jest
  przesyłane na bieżąco.
- **Rozwiązania wzorcowe w CI** – każde oczekiwane `expected` jest potwierdzone uruchomieniem
  programu w prawdziwym CPythonie (`npm run verify:solutions`), więc literówka w kluczu nie
  przejdzie niezauważona.
- **Tolerancyjne porównywanie** – na maturze liczy się wynik, nie format; sprawdzarka
  akceptuje opisy, różne układy linii i dłuższe rozwinięcia dziesiętne.
- **SQLite w Web Workerze** – zapytania z pętlą bez końca (np. rekurencyjne `WITH`) nie
  blokują strony; po 10 s worker jest kończony, a baza wczytywana od nowa z plików.
- **Dolny pasek na telefonie** – poniżej 640 px nawigacja jest renderowana poza nagłówkiem
  jako stały pasek u dołu (`useMediaQuery`), bo przypięty nagłówek z `backdrop-filter`
  byłby blokiem zawierającym dla `position: fixed`.
- **Ładowanie w tle** (`src/lib/preload.ts`) – lista zadań danego rodzaju w czasie
  bezczynności (`requestIdleCallback`) uruchamia Pyodide (`getRunner().init()`), moduł
  Fortune Sheet (ten sam `import()` co `lazy()`) albo „zapasowego” workera z załadowanym
  SQLite, którego przejmuje pierwsze otwarte zadanie. Pomijane przy `saveData`.
- **Panel od dołu na telefonie** – `ActionSheet` to modalny `<dialog>` z animacją
  `@starting-style`; konsola i podpowiedzi są w nim stale zamontowane, więc ich stan
  (wejście, historia podpowiedzi) przetrwa zamknięcie panelu.
- **Czysty CSS** – tokeny w zmiennych CSS, motyw jasny/ciemny przez
  `prefers-color-scheme` i atrybut `data-theme`, właściwości logiczne, `clamp()`,
  `color-mix()`, `:focus-visible`, `prefers-reduced-motion`.

## Dostępność

- link „Przejdź do treści”, semantyczne nagłówki i punkty orientacyjne (`header`, `nav`,
  `main`, `search`),
- przełączniki tematów jako przyciski z `aria-pressed`,
- wyniki sprawdzania w regionie `aria-live`, stan interpretera w `role="status"`,
- pełna obsługa klawiaturą (w edytorze: <kbd>Esc</kbd>, potem <kbd>Tab</kbd> wychodzi z pola).
