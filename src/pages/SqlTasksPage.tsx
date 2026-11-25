import { Link } from 'react-router';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/** Zapowiedź zadań z baz danych (SQL). */
export function SqlTasksPage() {
  useDocumentTitle('Zadania z SQL');
  return (
    <section className="coming-soon" aria-labelledby="sql-tytul">
      <p className="coming-soon__icon" aria-hidden="true">
        🗄️
      </p>
      <h2 id="sql-tytul">Zadania z SQL – już wkrótce</h2>
      <p className="lead">
        Pracujemy nad zadaniami z baz danych z arkuszy maturalnych: zapytania SQL uruchamiane w
        przeglądarce na danych z matury i sprawdzane z kluczem CKE.
      </p>
      <p>
        Na razie możesz ćwiczyć <Link to="/zadania/python">zadania w Pythonie</Link> i{' '}
        <Link to="/zadania/excel">zadania z Excela</Link>.
      </p>
    </section>
  );
}
