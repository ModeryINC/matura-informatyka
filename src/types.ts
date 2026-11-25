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
