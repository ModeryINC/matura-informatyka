import { Link } from 'react-router';
import { InlineText } from '../components/HintText';
import { RunnableExample } from '../components/RunnableExample';
import { PYTHON_BASICS } from '../data/pythonBasics';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getRunner, type PythonRunner } from '../python/runner';

/** Podstrona z podstawami Pythona: krótkie wyjaśnienia i przykłady do uruchomienia. */
export function PythonBasicsPage({ runner = getRunner() }: { runner?: PythonRunner }) {
  useDocumentTitle('Podstawy Pythona');

  return (
    <div className="page page--basics">
      <header className="basics-header">
        <h1>Podstawy Pythona</h1>
        <p>
          Najważniejsze elementy języka potrzebne na maturze z informatyki. Każdy przykład możesz
          zmienić i uruchomić (<kbd>Ctrl</kbd> + <kbd>Enter</kbd> w edytorze) – działa w
          przeglądarce, tak jak sprawdzarka w <Link to="/">zadaniach</Link>.
        </p>
      </header>

      <div className="basics">
        <nav className="basics__toc" aria-label="Spis treści">
          <h2>Spis treści</h2>
          <ol>
            {PYTHON_BASICS.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} onClick={(event) => scrollToSection(event, section.id)}>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="basics__content">
          {PYTHON_BASICS.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className="basics-section"
              aria-labelledby={`${section.id}-tytul`}
            >
              <h2 id={`${section.id}-tytul`}>
                {index + 1}. {section.title}
              </h2>
              {section.intro.map((paragraph, i) => (
                <p key={i}>
                  <InlineText text={paragraph} />
                </p>
              ))}
              {section.examples.map((example, i) => (
                <RunnableExample
                  key={i}
                  example={example}
                  runner={runner}
                  label={`Przykład: ${section.title}${section.examples.length > 1 ? ` (${i + 1})` : ''}`}
                />
              ))}
              {section.tips && (
                <ul className="basics-tips" aria-label="Wskazówki">
                  {section.tips.map((tip, i) => (
                    <li key={i}>
                      <InlineText text={tip} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Router działa na `#`, więc zwykły link `#sekcja` zmieniłby trasę.
 * Przewijamy do sekcji ręcznie, bez zmiany adresu.
 */
function scrollToSection(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
  event.preventDefault();
  const target = document.getElementById(id);
  // Płynność przewijania zależy od CSS (scroll-behavior) i ustawień „mniej animacji”.
  target?.scrollIntoView?.({ block: 'start' });
}
