# Matura z informatyki – arkusze i zadania z automatycznym sprawdzaniem

Strona z arkuszami maturalnymi z informatyki (poziom rozszerzony, 2018–2026), na której można
**rozwiązywać zadania algorytmiczne w Pythonie** i od razu sprawdzać je z kluczem CKE.
Wszystko działa w przeglądarce – strona nie ma serwera i jest hostowana na GitHub Pages.

**Strona: <https://moderyinc.github.io/matura-informatyka/>**

## Co potrafi

- **Strona startowa** z animowanym przykładem rozwiązania (Python i Excel) i skrótem
  możliwości; menu: **Zadania** (podział: Python, Excel, SQL – wkrótce), **Arkusze**, **Pomoc**.
- **Przegląd arkuszy** – 39 sesji (główne, dodatkowe, próbne, stara formuła) z podglądem PDF,
  przyciskami do zadań z danego arkusza, kluczem odpowiedzi i plikami z danymi (podgląd
  w oknie z przyciskiem pobierania).
- **Zadania ze sprawdzarką** – 230 zadań ze wszystkich 39 sesji 2018–2026 (główne, dodatkowe,
  stara formuła, próbne CKE i Politechniki Łódzkiej, przykładowy arkusz CKE):
  - _programy_ (część 2) – kod czyta plik z danymi i wypisuje odpowiedź; jest uruchamiany
    na danych przykładowych z arkusza i na pełnych danych egzaminacyjnych,
  - _funkcje_ (część 1, „zapisz algorytm”) – funkcja sprawdzana zestawem testów.
- **Zadania z Excela** (Zadania → Excel) – 34 zadania z arkusza kalkulacyjnego ze wszystkich
  arkuszy 2018–2026 (poza próbnymi Politechniki Łódzkiej – skany lub niepełny klucz). Dane są od razu wczytane do arkusza w przeglądarce
  ([Fortune Sheet](https://github.com/ruilisi/fortune-sheet), MIT), formuły można pisać po
  polsku (`=LICZ.JEŻELI(A:A;">5")`), a odpowiedzi – także całe zestawienia wstawiane
  z zaznaczenia – są sprawdzane z kluczem CKE. Wykresów nie sprawdzamy.
- **Wyszukiwanie** po temacie (sortowanie, rekurencja, słowniki, liczby pierwsze, …), roku,
  części arkusza, statusie i dowolnej frazie – bez względu na polskie znaki. Filtry są
  zapisywane w adresie, więc wyszukiwanie można udostępnić linkiem.
- **Konsola** – „Uruchom” pokazuje wyjście `print` na bieżąco; dane dla `input()` wpisuje
  się w pole „Wejście” (po jednej linii na wywołanie).
- **Podpowiedzi AI** (Google Gemini) – naprowadzają na podstawie Twojego kodu i wyniku
  sprawdzenia, bez podawania gotowego rozwiązania. Klucz jest bezpieczny po stronie
  pośrednika na Cloudflare Workers ([konfiguracja](docs/podpowiedzi-ai.md)).
- **Postęp** – rozwiązania i statusy zapisują się lokalnie w przeglądarce.
- Motyw jasny/ciemny, obsługa klawiatury (Ctrl+Enter – sprawdź), układ na telefon.

## Szybki start

Wymagania: Node.js ≥ 22 (patrz `.nvmrc`), Python ≥ 3.12 tylko do testów harnessu i
weryfikacji rozwiązań.

```bash
npm ci
npm run dev          # http://localhost:5173
```

| Skrypt                     | Opis                                                             |
| -------------------------- | ---------------------------------------------------------------- |
| `npm run dev`              | serwer deweloperski (najpierw generuje katalog arkuszy)          |
| `npm run build`            | build produkcyjny do `dist/`                                     |
| `npm run preview`          | podgląd buildu                                                   |
| `npm run catalog`          | generuje `src/data/catalog.generated.json` z `public/arkusze`    |
| `npm test`                 | testy jednostkowe i komponentów (Vitest + Testing Library)       |
| `npm run test:coverage`    | testy z raportem pokrycia (progi w `vite.config.ts`)             |
| `npm run test:python`      | testy `harness.py` (unittest)                                    |
| `npm run verify:solutions` | uruchamia rozwiązania wzorcowe i porównuje je z kluczem w danych |
| `npm run verify:excel`     | obliczenia wzorcowe zadań z Excela kontra klucz w danych         |
| `npm run lint`             | ESLint (bez tolerancji ostrzeżeń)                                |
| `npm run typecheck`        | TypeScript                                                       |
| `npm run format`           | Prettier                                                         |

## Jak działa sprawdzanie

1. Kod trafia do **Web Workera**, który ładuje [Pyodide](https://pyodide.org) (CPython
   skompilowany do WebAssembly) z CDN jsDelivr. Interfejs nie blokuje się nawet przy
   nieskończonej pętli – po przekroczeniu limitu czasu worker jest kończony i tworzony od nowa.
2. Dla zadań typu _program_ pliki z danymi są pobierane z `public/arkusze/…` i zapisywane
   w wirtualnym systemie plików pod nazwą, której oczekuje program (np. `przyklad.txt`
   podstawiony jako `liczby.txt`).
3. Wyjście programu jest porównywane z kluczem (`src/lib/compare.ts`):
   - wielkość liter, spacje, puste linie i przecinek dziesiętny nie mają znaczenia,
   - można dopisywać opisy (`print("Odpowiedź:", x)`),
   - liczby dziesiętne – z dokładnością oczekiwanej odpowiedzi (`5.52` ≈ `5.5216…`),
   - w odpowiedziach liczbowych układ linii jest dowolny,
   - klucz może dopuszczać kilka odpowiedzi (`alternatives`).
4. Dla zadań typu _funkcja_ harness (`src/python/harness.py`) wywołuje funkcję na kopiach
   argumentów i porównuje wyniki (krotki = listy, liczby zmiennoprzecinkowe z tolerancją).

## Struktura projektu

```
public/arkusze/<rok>/<sesja>/{arkusz,odpowiedzi,pliki}/   materiały CKE
src/
  data/tasks/*.json      zadania (po jednym pliku na sesję)
  data/spreadsheet/*.json  zadania z arkusza kalkulacyjnego (Zadania → Excel)
  data/index.ts          dostęp do katalogu i zadań
  lib/                   logika bez Reacta: porównywanie, wyszukiwanie, zapis, walidacja
  python/                worker Pyodide, harness i klient (PythonRunner)
  components/, pages/    interfejs (React 19, React Router – HashRouter)
  styles/global.css      style w czystym CSS (tokeny, motywy, układ)
solutions/<sesja>/*.py   rozwiązania wzorcowe (tylko do weryfikacji w CI)
solutions/excel/*.py     obliczenia wzorcowe do kluczy zadań z Excela
worker/                  pośrednik podpowiedzi AI (Cloudflare Worker, klucz Gemini jako sekret)
scripts/                 generowanie katalogu i weryfikacja rozwiązań
tests/                   konfiguracja testów i testy harnessu Pythona
docs/                    dokumentacja techniczna
```

Więcej: [architektura](docs/architektura.md) · [jak dodać zadanie](docs/dodawanie-zadan.md) ·
[podpowiedzi AI](docs/podpowiedzi-ai.md).

## CI/CD

Workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml):

- przy każdym pushu i pull requeście: lint, formatowanie, typy, testy z pokryciem, build,
  testy harnessu Pythona oraz **weryfikacja wszystkich kluczy odpowiedzi** rozwiązaniami
  wzorcowymi (także zadań z Excela),
- po zmianach na `main`: wdrożenie pośrednika podpowiedzi AI na Cloudflare Workers (klucz
  Gemini jako sekret Workera), build strony z adresem pośrednika i wdrożenie na GitHub Pages
  (strona działa pod `/<nazwa-repo>/`, ścieżkę ustawia zmienna `BASE_PATH`).

Dependabot co tydzień proponuje aktualizacje zależności i akcji.

## Uwagi o danych

- W kilku miejscach klucz lub przykład w arkuszu zawiera błąd – opis zadania mówi wtedy, czego
  wymaga sprawdzarka (np. czerwiec 2023 zad. 3.2, lipiec 2020 zad. 4.2, próbna PŁ październik
  2022 zad. 2.5).
- Arkusze próbne Politechniki Łódzkiej z lat 2021–2022 są skanami, a w marcu 2024 tekst nie ma
  mapowania znaków – ich treść została odczytana z obrazu stron. Gdy klucz był dostępny tylko
  jako skan, oczekiwane wyniki pochodzą z rozwiązań wzorcowych (zaznaczono to w opisie zadania).
- Zadania wymagające arkusza kalkulacyjnego lub bazy danych oraz pytania testowe (P/F) nie mają
  sprawdzarki – są dostępne w arkuszach PDF.

## Źródła i prawa

Arkusze, klucze odpowiedzi i pliki z danymi pochodzą od Centralnej Komisji Egzaminacyjnej
oraz Politechniki Łódzkiej (pobrane z serwisu arkusze.pl) i pozostają ich własnością.
Streszczenia poleceń, testy funkcji i rozwiązania wzorcowe zostały przygotowane na potrzeby
tego projektu – pełna treść zadań jest zawsze w arkuszu PDF.
