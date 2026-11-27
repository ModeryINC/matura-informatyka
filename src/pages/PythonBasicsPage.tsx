import { Link } from 'react-router';
import { BasicsLayout } from '../components/BasicsLayout';
import { RunnableExample } from '../components/RunnableExample';
import { PYTHON_BASICS } from '../data/pythonBasics';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getRunner, type PythonRunner } from '../python/runner';

/** Podstrona z podstawami Pythona: krótkie wyjaśnienia i przykłady do uruchomienia. */
export function PythonBasicsPage({ runner = getRunner() }: { runner?: PythonRunner }) {
  useDocumentTitle('Podstawy Pythona');
  return (
    <BasicsLayout
      title="Podstawy Pythona"
      lead={
        <p>
          Najważniejsze elementy języka potrzebne na maturze z informatyki. Każdy przykład możesz
          zmienić i uruchomić (<kbd>Ctrl</kbd> + <kbd>Enter</kbd> w edytorze) – działa w
          przeglądarce, tak jak sprawdzarka w <Link to="/zadania/python">zadaniach</Link>.
        </p>
      }
      sections={PYTHON_BASICS}
      renderExamples={(section) =>
        section.examples.map((example, i) => (
          <RunnableExample
            key={i}
            example={example}
            runner={runner}
            label={`Przykład: ${section.title}${section.examples.length > 1 ? ` (${i + 1})` : ''}`}
          />
        ))
      }
    />
  );
}
