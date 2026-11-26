import { Link } from 'react-router';
import { HeroDemo } from '../components/HeroDemo';
import { sessions, tasks } from '../data';
import { spreadsheetTasks } from '../data/spreadsheets';
import { sqlTasks } from '../data/sql';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useSolutionStatuses } from '../hooks/useSolutions';
import { LuDatabase, LuFileText, LuSheet } from 'react-icons/lu';
import { SiPython } from 'react-icons/si';

const years = sessions.map((s) => s.year);
const firstYear = Math.min(...years);
const lastYear = Math.max(...years);

const FEATURES = [
  {
    to: '/zadania/python',
    icon: SiPython,
    title: 'Python',
    text: `${tasks.length} zadań algorytmicznych. Kod uruchamia się w przeglądarce i jest sprawdzany na danych z matury.`,
  },
  {
    to: '/zadania/excel',
    icon: LuSheet,
    title: 'Excel',
    text: 'Zadania z arkusza kalkulacyjnego z wczytanymi danymi. Formuły po polsku, odpowiedzi sprawdzane z kluczem.',
  },
  {
    to: '/zadania/sql',
    icon: LuDatabase,
    title: 'SQL',
    text: `${sqlTasks.length} zadań z baz danych. Pliki są już tabelami – piszesz zapytania (także w stylu Accessa), wynik porównujemy z kluczem.`,
  },
  {
    to: '/arkusze',
    icon: LuFileText,
    title: 'Arkusze',
    text: `${sessions.length} arkuszy z lat ${firstYear}–${lastYear} z kluczami odpowiedzi i plikami z danymi.`,
  },
];

const STEPS = [
  ['Wybierz zadanie', 'Z listy, po temacie albo prosto z arkusza, który przerabiasz.'],
  [
    'Rozwiąż w przeglądarce',
    'Edytor Pythona, arkusz kalkulacyjny albo baza danych z SQL – bez instalowania czegokolwiek.',
  ],
  ['Sprawdź z kluczem', 'Wynik od razu porównany z kluczem CKE. Utknąłeś? Poproś o podpowiedź.'],
];

/** Strona startowa: sekcja hero z animacją, przegląd możliwości i jak zacząć. */
export function LandingPage() {
  useDocumentTitle();
  const statusOf = useSolutionStatuses();
  const solved = tasks.filter((t) => statusOf(t.id) === 'zaliczone').length;

  return (
    <div className="page page--landing">
      <section className="landing-hero" aria-labelledby="hero-tytul">
        <div className="landing-hero__text">
          <p className="landing-hero__eyebrow">Informatyka · poziom rozszerzony</p>
          <h1 id="hero-tytul">
            Matura z informatyki <span className="landing-hero__accent">bez instalowania</span>{' '}
            czegokolwiek
          </h1>
          <p className="landing-hero__lead">
            Rozwiązuj prawdziwe zadania z arkuszy CKE w Pythonie i w Excelu prosto w przeglądarce.
            Każda odpowiedź jest od razu sprawdzana z kluczem.
          </p>
          <div className="landing-hero__actions">
            <Link to="/zadania/python" className="button button--primary button--large">
              {solved > 0 ? 'Wróć do zadań' : 'Zacznij rozwiązywać'}
            </Link>
            <Link to="/arkusze" className="button button--large">
              Przeglądaj arkusze
            </Link>
          </div>
          <dl className="landing-stats">
            <div>
              <dt>zadań w Pythonie</dt>
              <dd>{tasks.length}</dd>
            </div>
            <div>
              <dt>zadania z Excela</dt>
              <dd>{spreadsheetTasks.length}</dd>
            </div>
            <div>
              <dt>zadania z SQL</dt>
              <dd>{sqlTasks.length}</dd>
            </div>
            <div>
              <dt>arkuszy</dt>
              <dd>{sessions.length}</dd>
            </div>
            {solved > 0 && (
              <div>
                <dt>zaliczonych przez Ciebie</dt>
                <dd>{solved}</dd>
              </div>
            )}
          </dl>
        </div>
        <HeroDemo />
      </section>

      <section className="landing-section" aria-labelledby="co-tu-jest">
        <h2 id="co-tu-jest">Co tu znajdziesz</h2>
        <ul className="feature-grid">
          {FEATURES.map((feature) => (
            <li key={feature.to} className="feature-card">
              <feature.icon aria-hidden className="feature-card__icon" />
              <h3>
                <Link to={feature.to} className="stretched-link">
                  {feature.title}
                </Link>
              </h3>
              <p>{feature.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="landing-section" aria-labelledby="jak-to-dziala">
        <h2 id="jak-to-dziala">Jak to działa</h2>
        <ol className="steps">
          {STEPS.map(([title, text]) => (
            <li key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
        <p className="landing-note muted">
          Strona nie ma serwera: kod i postępy zostają w Twojej przeglądarce. Nie znasz jeszcze
          Pythona? Zajrzyj do <Link to="/python">podstaw Pythona</Link>.
        </p>
      </section>
    </div>
  );
}
