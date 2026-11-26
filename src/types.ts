/**
 * Wspólne typy domenowe aplikacji.
 *
 * Model jest celowo prosty i serializowalny do JSON, bo:
 * - katalog arkuszy jest generowany skryptem `scripts/build-catalog.ts`,
 * - zadania są opisane ręcznie w plikach `src/data/tasks/*.json`.
 */

/** Rodzaj sesji egzaminacyjnej. */
export type SessionKind = 'glowna' | 'dodatkowa' | 'probna' | 'przykladowa' | 'stara-formula';

/** Pojedyncza sesja egzaminacyjna, np. „maj 2024”. */
export interface ExamSession {
  /** Identyfikator w postaci `rok/slug`, np. `2024/maj`. */
  id: string;
  year: number;
  /** Nazwa folderu sesji, np. `probna-CKE-grudzien`. */
  slug: string;
  kind: SessionKind;
  /** Czytelna etykieta, np. „Próbna CKE – grudzień”. */
  label: string;
  /** Ścieżki (względem katalogu `public/`) do plików PDF z arkuszem. */
  sheets: string[];
  /** Ścieżki do kluczy odpowiedzi. */
  answers: string[];
  /** Ścieżki do plików z danymi (załączników). */
  attachments: string[];
}

/** Tematy, po których można wyszukiwać zadania. */
export const TOPICS = {
  sortowanie: 'Sortowanie',
  rekurencja: 'Rekurencja',
  slowniki: 'Słowniki i zliczanie',
  napisy: 'Napisy',
  'liczby-pierwsze': 'Liczby pierwsze i dzielniki',
  'systemy-liczbowe': 'Systemy liczbowe',
  tablice: 'Tablice i listy',
  'tablice-2d': 'Tablice dwuwymiarowe',
  'wyszukiwanie-binarne': 'Wyszukiwanie binarne',
  podciagi: 'Podciągi i ciągi',
  geometria: 'Geometria',
  symulacja: 'Symulacja',
  'teoria-liczb': 'Teoria liczb (NWD, cyfry)',
  szyfrowanie: 'Szyfrowanie',
  'pliki-tekstowe': 'Przetwarzanie plików',
  zlozonosc: 'Złożoność obliczeniowa',
  'programowanie-dynamiczne': 'Programowanie dynamiczne',
  zachlanne: 'Algorytmy zachłanne',
  grafy: 'Grafy i plansze',
  palindromy: 'Palindromy',
  anagramy: 'Anagramy',
  daty: 'Daty i czas',
} as const;

export type TopicId = keyof typeof TOPICS;

/**
 * Sposób sprawdzania zadania:
 * - `program` – pełny program czytający pliki z danymi i wypisujący odpowiedź,
 * - `function` – funkcja o zadanej nazwie, sprawdzana zestawem testów.
 */
export type TaskKind = 'program' | 'function';

/** Jedno uruchomienie programu na wskazanych plikach z oczekiwanym wynikiem. */
export interface ProgramCheck {
  /** Nazwa testu widoczna dla użytkownika, np. „Dane z pliku przyklad.txt”. */
  label: string;
  /**
   * Mapowanie: nazwa pliku widoczna dla programu → ścieżka względem `public/`.
   * Pozwala np. podstawić `przyklad.txt` pod nazwę `liczby.txt`.
   */
  files: Record<string, string>;
  /** Oczekiwany wynik (porównanie opisane w `src/lib/compare.ts`). */
  expected: string;
  /** Inne odpowiedzi uznawane w kluczu (np. gdy kilka liczb spełnia warunek). */
  alternatives?: string[];
}

/** Pojedynczy przypadek testowy dla zadania typu `function`. */
export interface FunctionTest {
  /** Argumenty wywołania (wartości JSON: liczby, napisy, listy). */
  args: unknown[];
  /** Oczekiwana wartość zwracana. */
  expected: unknown;
}

interface TaskBase {
  /** Unikalny identyfikator, np. `2024-maj-1.2`. */
  id: string;
  /** Identyfikator sesji (`ExamSession.id`). */
  sessionId: string;
  /** Numer zadania z arkusza, np. `1.2`. */
  number: string;
  title: string;
  /** Część arkusza (1 – pisemna, 2 – praca przy komputerze). */
  part: 1 | 2;
  points: number;
  topics: TopicId[];
  /** Krótkie streszczenie polecenia (pełna treść jest w arkuszu PDF). */
  summary: string;
  /** Kod startowy wstawiany do edytora. */
  starterCode: string;
  /** Ograniczenia z arkusza (np. zakaz funkcji wbudowanych) – opis w `src/lib/restrictions.ts`. */
  restrictions?: TaskRestrictions;
}

/** Dodatkowe zakazy poza funkcjami wbudowanymi. */
export type RestrictionToken = '**' | '[:]' | '[]';

/** Ograniczenia z treści zadania: „zabronione jest używanie funkcji wbudowanych…”. */
export interface TaskRestrictions {
  /** Opis dla ucznia (z arkusza, w skrócie). */
  note: string;
  /** Dodatkowe zakazy: potęgowanie, wycinki list, listy w ogóle. */
  also?: RestrictionToken[];
}

export interface ProgramTask extends TaskBase {
  kind: 'program';
  checks: ProgramCheck[];
}

export interface FunctionTask extends TaskBase {
  kind: 'function';
  /** Nazwa funkcji, którą musi zdefiniować użytkownik. */
  functionName: string;
  tests: FunctionTest[];
}

export type Task = ProgramTask | FunctionTask;

/** Wynik jednego testu po uruchomieniu rozwiązania. */
export interface CheckResult {
  label: string;
  passed: boolean;
  expected: string;
  actual: string;
  /** Komunikat błędu Pythona, jeśli wystąpił. */
  error?: string;
}

/** Wynik sprawdzenia całego rozwiązania. */
export interface SubmissionResult {
  passed: boolean;
  results: CheckResult[];
  /** Czas wykonania w milisekundach. */
  durationMs: number;
}

/* ───────────────────────── Zadania z arkusza kalkulacyjnego ───────────────────────── */

/** Plik z danymi wczytywany do osobnej karty arkusza. */
export interface SpreadsheetFile {
  /** Nazwa karty, np. `owoce`. */
  sheet: string;
  /** Ścieżka względem `public/`. */
  path: string;
  /**
   * Nagłówki dopisywane nad danymi, gdy plik ich nie ma (jak przy imporcie,
   * gdy uczeń sam podpisze kolumny).
   */
  headers?: string[];
  /** Pierwszy wiersz pliku to nagłówki kolumn. */
  hasHeader?: boolean;
  /** Separator kolumn (domyślnie tabulator), np. `;`. */
  separator?: string;
}

/** Pojedyncza odpowiedź (liczba, tekst lub data). */
export interface SpreadsheetField {
  label: string;
  expected: string;
  /** Inne poprawne odpowiedzi, np. numer dnia zamiast daty. */
  alternatives?: string[];
  /** Dopuszczalna różnica dla liczb (domyślnie pół jednostki ostatniej cyfry). */
  tolerance?: number;
}

/** Odpowiedź w postaci zestawienia (tabeli). */
export interface SpreadsheetTable {
  /** Podpisy wierszy (np. miesiące) – kolejność jak w kluczu. */
  rows: string[];
  /** Podpisy kolumn z wartościami. */
  columns: string[];
  /** Oczekiwane wartości: `expected[wiersz][kolumna]`. */
  expected: string[][];
  tolerance?: number;
}

/** Podpunkt zadania, np. `6.2`. */
export interface SpreadsheetPart {
  number: string;
  points: number;
  /** Skrót polecenia. */
  prompt: string;
  /**
   * Podpunkt wymaga wykresu – wykres nie jest sprawdzany automatycznie. Podpunkt
   * z samym wykresem (bez `fields` i `table`) nie liczy się do postępu.
   */
  chart?: string;
  fields?: SpreadsheetField[];
  table?: SpreadsheetTable;
  /** Odpowiedź w postaci listy wierszy w dowolnej kolejności (np. nazwiska klientów). */
  list?: AnswerList;
  /**
   * Podpunkt, w którym zapytanie SQL pisze się na kartce (tabel nie ma w plikach):
   * przykładowe rozwiązanie z klucza. Taki podpunkt nie liczy się do postępu.
   */
  query?: string;
}

/** Lista wierszy – kolejność wierszy i kolumn nie ma znaczenia, nadmiarowe kolumny też nie. */
export interface AnswerList {
  /** Podpisy kolumn odpowiedzi (np. `imię`, `nazwisko`). */
  columns: string[];
  expected: string[][];
  tolerance?: number;
}

/** Zadanie rozwiązywane w arkuszu kalkulacyjnym (np. „Zadanie 6. Konfitury owocowe”). */
export interface SpreadsheetTask {
  /** Np. `2023-maj-6`. */
  id: string;
  sessionId: string;
  number: string;
  title: string;
  /** Wprowadzenie z arkusza (akapity rozdzielone pustą linią). */
  summary: string;
  /** Pliki z danymi; pusta lista – zadanie startuje z pustym arkuszem. */
  files: SpreadsheetFile[];
  parts: SpreadsheetPart[];
}

/* ───────────────────────── Zadania z baz danych (SQL) ───────────────────────── */

/** Plik z danymi wczytywany jako tabela bazy. */
export interface SqlTable {
  /** Nazwa tabeli, np. `klienci`. */
  name: string;
  /** Ścieżka względem `public/`. */
  path: string;
  /** Nazwy pól, gdy plik nie ma wiersza nagłówkowego (z opisu zadania). */
  headers?: string[];
  /** Separator kolumn (domyślnie wykrywany: tabulator, średnik lub spacja). */
  separator?: string;
}

/** Zadanie z bazy danych (np. „Zadanie 8. Sieć sklepów”). */
export interface SqlTask {
  /** Np. `2026-maj-8`. */
  id: string;
  sessionId: string;
  number: string;
  title: string;
  /** Wprowadzenie z arkusza (akapity rozdzielone pustą linią). */
  summary: string;
  tables: SqlTable[];
  parts: SpreadsheetPart[];
}
