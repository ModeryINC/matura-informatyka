# Rozwiązania wzorcowe

Programy w tym katalogu **nie są pokazywane na stronie**. Służą do automatycznej weryfikacji
danych: `npm run verify:solutions` uruchamia każde rozwiązanie prawdziwym Pythonem na plikach
z zadania i sprawdza, czy wynik zgadza się z oczekiwaną odpowiedzią w `src/data/tasks/*.json`.

Nazwa pliku: `<rok>-<sesja>/<numer zadania>.py`, np. `2024-maj/3.2.py`.

## Zadania z arkusza kalkulacyjnego

`solutions/excel/<id zadania>.py` (np. `2024-maj-7.py`) liczy odpowiedzi do zadania z
`src/data/spreadsheet/*.json` i wypisuje je jako JSON: `{"7.2": ["2422669.40", "Reneta"],
"7.3": {"table": [["Gala", "14017"], …]}}`. `npm run verify:excel` uruchamia program w katalogu
z plikami danych zadania i porównuje wynik z kluczem tą samą funkcją, która sprawdza odpowiedzi
na stronie.
