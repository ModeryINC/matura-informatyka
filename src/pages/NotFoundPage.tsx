import { Link } from 'react-router';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Nie znaleziono');
  return (
    <div className="page page--narrow">
      <h1>Nie znaleziono strony</h1>
      <p>Ta strona nie istnieje albo zadanie zostało przeniesione.</p>
      <p>
        <Link to="/" className="button button--primary">
          Wróć do listy zadań
        </Link>
      </p>
    </div>
  );
}
