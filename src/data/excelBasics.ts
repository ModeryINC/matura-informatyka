/**
 * Treść podstrony „Podstawy Excela”: wyjaśnienia i małe arkusze z formułami
 * (po polsku, jak w polskim Excelu). Wartości formuł są wpisane ręcznie, a test
 * `src/data/excelBasics.test.ts` sprawdza je, licząc formuły od nowa.
 */

/** Komórka z formułą: `f` – formuła (po polsku), `v` – wynik. */
export interface FormulaCell {
  f: string;
  v: string | number;
}

export type ExcelCell = string | number | null | FormulaCell;

export interface ExcelBasicsSheet {
  /** Wiersze od 1; pierwszy to zwykle nagłówki. */
  rows: ExcelCell[][];
  /** Komórka z formułą pokazywana na początku w pasku formuły (np. `D2`). */
  focus?: string;
}

export interface ExcelBasicsSection {
  id: string;
  title: string;
  /** Akapity wprowadzenia; `kod` w odwrotnych apostrofach. */
  intro: string[];
  sheets: ExcelBasicsSheet[];
  tips?: string[];
}

export const isFormula = (cell: ExcelCell): cell is FormulaCell =>
  typeof cell === 'object' && cell !== null;

export const EXCEL_BASICS: ExcelBasicsSection[] = [
  {
    id: 'formuly',
    title: 'Formuły i adresy komórek',
    intro: [
      'Formuła zaczyna się od `=`, np. `=B2*C2`. Po skopiowaniu w dół adresy się przesuwają (`B3*C3`, `B4*C4`) – to adresy **względne**.',
      'Adres ze znakiem `$` się nie przesuwa: `$B$6` zawsze wskazuje tę samą komórkę (adres **bezwzględny**, skrót klawisz F4). `$B6` blokuje tylko kolumnę, `B$6` – tylko wiersz.',
    ],
    sheets: [
      {
        focus: 'E2',
        rows: [
          ['produkt', 'cena', 'ilość', 'wartość', 'z VAT'],
          ['długopis', 2.5, 4, { f: '=B2*C2', v: 10 }, { f: '=D2*(1+$B$6)', v: 12.3 }],
          ['zeszyt', 4, 3, { f: '=B3*C3', v: 12 }, { f: '=D3*(1+$B$6)', v: 14.76 }],
          ['linijka', 3, 2, { f: '=B4*C4', v: 6 }, { f: '=D4*(1+$B$6)', v: 7.38 }],
          ['razem', null, null, { f: '=SUMA(D2:D4)', v: 28 }, { f: '=SUMA(E2:E4)', v: 34.44 }],
          ['VAT', 0.23, null, null, null],
        ],
      },
    ],
    tips: [
      'Kliknij komórkę z formułą (zielone tło), żeby zobaczyć ją w pasku formuły.',
      'W polskim Excelu argumenty rozdziela średnik (`;`), a ułamki – przecinek (`0,23`).',
    ],
  },
  {
    id: 'funkcje',
    title: 'Podstawowe funkcje',
    intro: [
      '`SUMA`, `ŚREDNIA`, `MIN`, `MAX` działają na zakresie, np. `B2:B6`. `ILE.LICZB` liczy komórki z liczbami, `ILE.NIEPUSTYCH` – wszystkie niepuste.',
      '`ZAOKR(x; 2)` zaokrągla do dwóch miejsc, `ZAOKR.DÓŁ` i `ZAOKR.GÓRA` – zawsze w dół lub w górę. Funkcje można zagnieżdżać: `=ZAOKR(ŚREDNIA(B2:B6); 0)`.',
    ],
    sheets: [
      {
        focus: 'E3',
        rows: [
          ['uczeń', 'punkty', null, 'co liczymy', 'wynik'],
          ['Ola', 45, null, 'suma', { f: '=SUMA(B2:B6)', v: 201 }],
          ['Kuba', 38, null, 'średnia', { f: '=ŚREDNIA(B2:B6)', v: 40.2 }],
          ['Zosia', 50, null, 'najwięcej', { f: '=MAX(B2:B6)', v: 50 }],
          ['Antek', 27, null, 'najmniej', { f: '=MIN(B2:B6)', v: 27 }],
          ['Maja', 41, null, 'średnia (całk.)', { f: '=ZAOKR(ŚREDNIA(B2:B6);0)', v: 40 }],
        ],
      },
    ],
  },
  {
    id: 'jezeli',
    title: 'Warunki: JEŻELI, ORAZ, LUB',
    intro: [
      '`=JEŻELI(warunek; gdy_prawda; gdy_fałsz)` wybiera jedną z dwóch wartości. Teksty pisze się w cudzysłowie: `"zdał"`.',
      'Kilka warunków łączy `ORAZ(…)` (wszystkie muszą być spełnione) i `LUB(…)` (wystarczy jeden). `JEŻELI` można zagnieżdżać, gdy wyników jest więcej niż dwa.',
    ],
    sheets: [
      {
        focus: 'E2',
        rows: [
          ['uczeń', 'matematyka', 'informatyka', 'matematyka ≥ 30', 'oba ≥ 30'],
          [
            'Ola',
            45,
            50,
            { f: '=JEŻELI(B2>=30;"zdał";"nie zdał")', v: 'zdał' },
            { f: '=JEŻELI(ORAZ(B2>=30;C2>=30);"tak";"nie")', v: 'tak' },
          ],
          [
            'Kuba',
            28,
            40,
            { f: '=JEŻELI(B3>=30;"zdał";"nie zdał")', v: 'nie zdał' },
            { f: '=JEŻELI(ORAZ(B3>=30;C3>=30);"tak";"nie")', v: 'nie' },
          ],
          [
            'Zosia',
            33,
            25,
            { f: '=JEŻELI(B4>=30;"zdał";"nie zdał")', v: 'zdał' },
            { f: '=JEŻELI(ORAZ(B4>=30;C4>=30);"tak";"nie")', v: 'nie' },
          ],
          [
            'Antek',
            38,
            31,
            { f: '=JEŻELI(B5>=30;"zdał";"nie zdał")', v: 'zdał' },
            { f: '=JEŻELI(ORAZ(B5>=30;C5>=30);"tak";"nie")', v: 'tak' },
          ],
        ],
      },
    ],
    tips: [
      'Kolumna pomocnicza z `JEŻELI(…;1;0)` i `SUMA` na końcu to najprostszy sposób, by policzyć wiersze spełniające złożony warunek.',
    ],
  },
  {
    id: 'licz-jezeli',
    title: 'Liczenie i sumowanie z warunkiem',
    intro: [
      '`LICZ.JEŻELI(zakres; kryterium)` liczy komórki spełniające kryterium, `SUMA.JEŻELI(zakres; kryterium; suma_zakres)` sumuje wartości z innej kolumny, `ŚREDNIA.JEŻELI` – liczy ich średnią.',
      'Kilka kryteriów naraz: `LICZ.WARUNKI`, `SUMA.WARUNKÓW`, `ŚREDNIA.WARUNKÓW`. Kryterium z porównaniem zapisuje się jako tekst: `">100"`.',
    ],
    sheets: [
      {
        focus: 'F3',
        rows: [
          ['miasto', 'płeć', 'kwota', null, 'co liczymy', 'wynik'],
          ['Łódź', 'K', 120, null, 'zakupy w Łodzi', { f: '=LICZ.JEŻELI(A2:A7;"Łódź")', v: 3 }],
          [
            'Kraków',
            'M',
            80,
            null,
            'kwota z Łodzi',
            { f: '=SUMA.JEŻELI(A2:A7;"Łódź";C2:C7)', v: 350 },
          ],
          [
            'Łódź',
            'M',
            200,
            null,
            'średnia kobiet',
            { f: '=ŚREDNIA.JEŻELI(B2:B7;"K";C2:C7)', v: 75 },
          ],
          [
            'Gdańsk',
            'K',
            50,
            null,
            'kobiety z Łodzi',
            { f: '=LICZ.WARUNKI(A2:A7;"Łódź";B2:B7;"K")', v: 2 },
          ],
          ['Łódź', 'K', 30, null, 'kwoty > 100', { f: '=LICZ.JEŻELI(C2:C7;">100")', v: 2 }],
          ['Kraków', 'K', 100, null, null, null],
        ],
      },
    ],
    tips: [
      'Zestawienie „dla każdego miasta” to lista miast (np. skopiowana i z usuniętymi duplikatami) i obok `LICZ.JEŻELI` z adresem komórki jako kryterium – albo tabela przestawna.',
    ],
  },
  {
    id: 'teksty',
    title: 'Teksty',
    intro: [
      '`LEWY(tekst; n)` i `PRAWY(tekst; n)` zwracają pierwsze / ostatnie `n` znaków, `FRAGMENT.TEKSTU(tekst; od; ile)` – środek, `DŁ(tekst)` – długość.',
      'Teksty łączy `&` (albo `ZŁĄCZ.TEKSTY`), wielkość liter zmieniają `LITERY.WIELKIE` i `LITERY.MAŁE`. Typowe zadanie: imię kończące się na „a” oznacza kobietę.',
    ],
    sheets: [
      {
        focus: 'C2',
        rows: [
          ['imię', 'nazwisko', 'podpis', 'długość', 'płeć'],
          [
            'Anna',
            'Lis',
            { f: '=LEWY(A2;1)&". "&B2', v: 'A. Lis' },
            { f: '=DŁ(B2)', v: 3 },
            { f: '=JEŻELI(PRAWY(A2;1)="a";"K";"M")', v: 'K' },
          ],
          [
            'Jan',
            'Kruk',
            { f: '=LEWY(A3;1)&". "&B3', v: 'J. Kruk' },
            { f: '=DŁ(B3)', v: 4 },
            { f: '=JEŻELI(PRAWY(A3;1)="a";"K";"M")', v: 'M' },
          ],
          [
            'Ewa',
            'Sowa',
            { f: '=LEWY(A4;1)&". "&B4', v: 'E. Sowa' },
            { f: '=DŁ(B4)', v: 4 },
            { f: '=JEŻELI(PRAWY(A4;1)="a";"K";"M")', v: 'K' },
          ],
          [
            'Piotr',
            'Wróbel',
            { f: '=LEWY(A5;1)&". "&B5', v: 'P. Wróbel' },
            { f: '=DŁ(B5)', v: 6 },
            { f: '=JEŻELI(PRAWY(A5;1)="a";"K";"M")', v: 'M' },
          ],
        ],
      },
    ],
  },
  {
    id: 'daty',
    title: 'Daty',
    intro: [
      'Data to w Excelu liczba dni (od 1900 r.) wyświetlana jako data – dlatego różnica dwóch dat to liczba dni między nimi: `=A3-A2`.',
      '`ROK`, `MIESIĄC`, `DZIEŃ` wyciągają części daty, `DZIEŃ.TYG(data; 2)` daje dzień tygodnia (1 – poniedziałek, 7 – niedziela), a `DATA(rok; miesiąc; dzień)` składa datę z części.',
    ],
    sheets: [
      {
        focus: 'D2',
        rows: [
          ['data', 'rok', 'miesiąc', 'dzień tyg.', 'dni od poprz.'],
          [
            '2026-05-04',
            { f: '=ROK(A2)', v: 2026 },
            { f: '=MIESIĄC(A2)', v: 5 },
            { f: '=DZIEŃ.TYG(A2;2)', v: 1 },
            null,
          ],
          [
            '2026-05-05',
            { f: '=ROK(A3)', v: 2026 },
            { f: '=MIESIĄC(A3)', v: 5 },
            { f: '=DZIEŃ.TYG(A3;2)', v: 2 },
            { f: '=A3-A2', v: 1 },
          ],
          [
            '2026-05-11',
            { f: '=ROK(A4)', v: 2026 },
            { f: '=MIESIĄC(A4)', v: 5 },
            { f: '=DZIEŃ.TYG(A4;2)', v: 1 },
            { f: '=A4-A3', v: 6 },
          ],
          [
            '2026-06-02',
            { f: '=ROK(A5)', v: 2026 },
            { f: '=MIESIĄC(A5)', v: 6 },
            { f: '=DZIEŃ.TYG(A5;2)', v: 2 },
            { f: '=A5-A4', v: 22 },
          ],
        ],
      },
    ],
    tips: [
      'Gdy wynik odejmowania dat wyświetla się jako data, zmień format komórki na „Liczbowe”.',
    ],
  },
  {
    id: 'wyszukaj',
    title: 'Wyszukiwanie: WYSZUKAJ.PIONOWO',
    intro: [
      '`WYSZUKAJ.PIONOWO(szukana; tabela; nr_kolumny; FAŁSZ)` znajduje wartość w pierwszej kolumnie tabeli i zwraca komórkę z podanej kolumny tego samego wiersza. `FAŁSZ` oznacza dopasowanie dokładne.',
      'Tabelę podaje się adresem bezwzględnym (`$F$2:$G$4`), żeby nie przesunęła się przy kopiowaniu. Nowsze wersje Excela mają też `X.WYSZUKAJ`.',
    ],
    sheets: [
      {
        focus: 'C2',
        rows: [
          ['kod', 'ilość', 'cena', 'wartość', null, 'kod', 'cena'],
          [
            'P2',
            3,
            { f: '=WYSZUKAJ.PIONOWO(A2;$F$2:$G$4;2;FAŁSZ)', v: 2.5 },
            { f: '=B2*C2', v: 7.5 },
            null,
            'P1',
            5,
          ],
          [
            'P1',
            1,
            { f: '=WYSZUKAJ.PIONOWO(A3;$F$2:$G$4;2;FAŁSZ)', v: 5 },
            { f: '=B3*C3', v: 5 },
            null,
            'P2',
            2.5,
          ],
          [
            'P3',
            2,
            { f: '=WYSZUKAJ.PIONOWO(A4;$F$2:$G$4;2;FAŁSZ)', v: 10 },
            { f: '=B4*C4', v: 20 },
            null,
            'P3',
            10,
          ],
        ],
      },
    ],
  },
  {
    id: 'symulacja',
    title: 'Symulacja dzień po dniu',
    intro: [
      'Częste zadanie maturalne: stan (magazynu, zbiornika, konta) zmienia się codziennie według reguł. Każdy wiersz to jeden dzień, a stan na początku dnia to stan z końca poprzedniego: `B3` = `=E2`.',
      'Tu: codziennie zużywamy 15 l, a gdy rano jest mniej niż 40 l, przyjeżdża dostawa 50 l. Formuły z wiersza 3 kopiuje się w dół na wszystkie dni.',
    ],
    sheets: [
      {
        focus: 'D6',
        rows: [
          ['dzień', 'stan rano', 'zużycie', 'dostawa', 'stan wieczorem'],
          [1, 100, 15, { f: '=JEŻELI(B2<40;50;0)', v: 0 }, { f: '=B2-C2+D2', v: 85 }],
          [
            2,
            { f: '=E2', v: 85 },
            15,
            { f: '=JEŻELI(B3<40;50;0)', v: 0 },
            { f: '=B3-C3+D3', v: 70 },
          ],
          [
            3,
            { f: '=E3', v: 70 },
            15,
            { f: '=JEŻELI(B4<40;50;0)', v: 0 },
            { f: '=B4-C4+D4', v: 55 },
          ],
          [
            4,
            { f: '=E4', v: 55 },
            15,
            { f: '=JEŻELI(B5<40;50;0)', v: 0 },
            { f: '=B5-C5+D5', v: 40 },
          ],
          [
            5,
            { f: '=E5', v: 40 },
            15,
            { f: '=JEŻELI(B6<40;50;0)', v: 0 },
            { f: '=B6-C6+D6', v: 25 },
          ],
          [
            6,
            { f: '=E6', v: 25 },
            15,
            { f: '=JEŻELI(B7<40;50;0)', v: 50 },
            { f: '=B7-C7+D7', v: 60 },
          ],
        ],
      },
    ],
    tips: [
      'Pytanie „którego dnia po raz pierwszy…” rozwiązuje kolumna pomocnicza z warunkiem i `PODAJ.POZYCJĘ(1; kolumna; 0)` albo po prostu filtr.',
    ],
  },
  {
    id: 'bledy',
    title: 'Błędy i JEŻELI.BŁĄD',
    intro: [
      'Najczęstsze błędy: `#DZIEL/0!` (dzielenie przez zero), `#N/D!` (`WYSZUKAJ.PIONOWO` nie znalazł wartości), `#ARG!` (tekst zamiast liczby), `#NAZWA?` (literówka w nazwie funkcji).',
      '`JEŻELI.BŁĄD(formuła; wartość)` zwraca wynik formuły albo podaną wartość, gdy formuła kończy się błędem.',
    ],
    sheets: [
      {
        focus: 'C3',
        rows: [
          ['liczba', 'dzielnik', 'iloraz'],
          [10, 4, { f: '=JEŻELI.BŁĄD(A2/B2;"brak")', v: 2.5 }],
          [5, 0, { f: '=JEŻELI.BŁĄD(A3/B3;"brak")', v: 'brak' }],
          [9, 3, { f: '=JEŻELI.BŁĄD(A4/B4;"brak")', v: 3 }],
        ],
      },
    ],
  },
  {
    id: 'narzedzia',
    title: 'Sortowanie, filtry, tabela przestawna i wykres',
    intro: [
      '**Sortowanie** (Dane → Sortuj) i **filtr** (Dane → Filtruj) pozwalają szybko znaleźć największe wartości albo wiersze spełniające warunek – na maturze to w pełni dozwolone.',
      '**Tabela przestawna** (Wstawianie → Tabela przestawna) w kilka kliknięć liczy sumy, średnie i liczności dla każdej wartości kolumny (np. każdego miasta) – to odpowiednik `GROUP BY` z SQL.',
      '**Wykres** robisz z zaznaczonego zestawienia (Wstawianie → Wykres). Pamiętaj o tytule wykresu i opisach osi – za ich brak traci się punkty.',
    ],
    sheets: [],
    tips: [
      'Wykres zrób w prawdziwym Excelu: wyeksportuj arkusz z zadania przyciskiem „Eksportuj do .xlsx”.',
      'Przed sortowaniem zaznacz całą tabelę (albo kliknij w nią i użyj Sortuj) – inaczej posortujesz jedną kolumnę i rozdzielisz dane z wierszy.',
    ],
  },
];
