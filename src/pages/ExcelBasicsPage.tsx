import { Link } from 'react-router';
import { BasicsLayout } from '../components/BasicsLayout';
import { MiniSheet } from '../components/MiniSheet';
import { EXCEL_BASICS } from '../data/excelBasics';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/** Podstrona z podstawami Excela: formuły po polsku na małych przykładowych arkuszach. */
export function ExcelBasicsPage() {
  useDocumentTitle('Podstawy Excela');
  return (
    <BasicsLayout
      title="Podstawy Excela"
      lead={
        <p>
          Formuły i narzędzia arkusza kalkulacyjnego potrzebne na maturze – z nazwami funkcji po
          polsku, jak w polskim Excelu. W przykładach kliknij komórkę z zielonym tłem, żeby zobaczyć
          jej formułę. Ćwicz potem na prawdziwych danych w{' '}
          <Link to="/zadania/excel">zadaniach z Excela</Link>.
        </p>
      }
      sections={EXCEL_BASICS}
      renderExamples={(section) =>
        section.sheets.map((sheet, i) => (
          <MiniSheet
            key={i}
            sheet={sheet}
            label={`Przykład: ${section.title}${section.sheets.length > 1 ? ` (${i + 1})` : ''}`}
          />
        ))
      }
    />
  );
}
