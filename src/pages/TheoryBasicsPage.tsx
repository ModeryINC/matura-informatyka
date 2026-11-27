import { Link } from 'react-router';
import { BasicsLayout } from '../components/BasicsLayout';
import { InlineText } from '../components/HintText';
import { TheoryTool } from '../components/TheoryTools';
import { THEORY_BASICS } from '../data/theoryBasics';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/** Podstrona z teorią do zadań testowych: systemy liczbowe, sieci, szyfrowanie… */
export function TheoryBasicsPage() {
  useDocumentTitle('Podstawy teorii');
  return (
    <BasicsLayout
      title="Podstawy teorii"
      lead={
        <p>
          Wiedza ogólna, o którą pytają zadania testowe: systemy liczbowe, sieci, szyfrowanie,
          grafika, bezpieczeństwo, prawo i inne. Tam, gdzie da się coś policzyć, jest narzędzie do
          wypróbowania. Sprawdź się potem w <Link to="/zadania/test">zadaniach testowych</Link>.
        </p>
      }
      sections={THEORY_BASICS}
      renderExamples={(section) => (
        <>
          {section.tables?.map((table, i) => (
            <div key={i} className="theory-table">
              <table>
                <thead>
                  <tr>
                    {table.head.map((cell) => (
                      <th key={cell} scope="col">
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) => (
                        <td key={c}>
                          <InlineText text={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          {section.tools?.map((tool) => (
            <TheoryTool key={tool} id={tool} />
          ))}
        </>
      )}
    />
  );
}
