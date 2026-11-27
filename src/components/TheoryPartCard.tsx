import { useId, useState, type ReactNode } from 'react';
import { LuCheck, LuCircleCheck } from 'react-icons/lu';
import { EyeMorphIcon, MorphIcon } from './MorphIcon';
import type { Choice, TheoryPartAnswer } from '../lib/theory/storage';
import type { TheoryPart } from '../types';
import { InlineText } from './HintText';

interface TheoryPartCardProps {
  part: TheoryPart;
  answer: TheoryPartAnswer;
  onChange: (answer: TheoryPartAnswer) => void;
  /** Nagłówek karty (domyślnie „Zadanie 3.1”). */
  heading?: ReactNode;
}

/**
 * Podpunkt testu: zdania do oceny P/F. Punkt jest – jak na maturze – tylko za
 * komplet poprawnych odpowiedzi; po sprawdzeniu można podejrzeć klucz.
 */
export function TheoryPartCard({ part, answer, onChange, heading }: TheoryPartCardProps) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const choices = part.statements.map((_, i) => answer.choices[i] ?? null);
  const complete = choices.every((c) => c !== null);
  const correct = choices.filter((c, i) => c === part.answers[i]).length;
  const checked = answer.passed !== undefined;

  const choose = (index: number, value: Choice) => {
    const next = [...choices];
    next[index] = value;
    // Zmiana odpowiedzi kasuje wynik poprzedniego sprawdzenia.
    onChange({ choices: next });
    setRevealed(false);
  };

  return (
    <article
      className={`xl-part theory-part${answer.passed ? ' xl-part--passed' : ''}`}
      aria-labelledby={`${id}-tytul`}
    >
      <header className="xl-part__header">
        <h2 id={`${id}-tytul`} className="xl-part__title">
          {heading ?? `Zadanie ${part.number}`}
        </h2>
        {answer.passed && (
          <span className="xl-part__badge">
            <LuCircleCheck aria-hidden className="icon" /> Zaliczone
          </span>
        )}
      </header>
      {part.prompt.split('\n\n').map((paragraph, i) => (
        <p key={i}>
          <InlineText text={paragraph} />
        </p>
      ))}
      <ol className="theory-statements">
        {part.statements.map((statement, i) => {
          const expected = part.answers[i] as 'P' | 'F';
          const wrong = revealed && choices[i] !== expected;
          return (
            <li key={i} className={wrong ? 'is-wrong' : revealed ? 'is-right' : undefined}>
              <fieldset>
                <legend>
                  <InlineText text={statement} />
                </legend>
                <div className="theory-choice">
                  {(['P', 'F'] as const).map((value) => (
                    <label key={value}>
                      <input
                        type="radio"
                        name={`${id}-${i}`}
                        value={value}
                        checked={choices[i] === value}
                        onChange={() => choose(i, value)}
                      />
                      <span title={value === 'P' ? 'prawda' : 'fałsz'}>{value}</span>
                    </label>
                  ))}
                </div>
                {revealed && (
                  <span className="theory-key">
                    <MorphIcon shape={wrong ? 'x' : 'check'} /> klucz:{' '}
                    {expected === 'P' ? 'prawda' : 'fałsz'}
                  </span>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>
      <div className="xl-part__actions">
        <button
          type="button"
          className="button button--primary button--small"
          disabled={!complete}
          onClick={() => onChange({ choices, passed: correct === part.statements.length })}
        >
          <LuCheck aria-hidden className="icon" /> Sprawdź
        </button>
        {checked && !answer.passed && (
          <button
            type="button"
            className="button button--ghost button--small"
            onClick={() => setRevealed((v) => !v)}
            aria-pressed={revealed}
          >
            <EyeMorphIcon off={revealed} /> {revealed ? 'Ukryj klucz' : 'Pokaż klucz'}
          </button>
        )}
        {!complete && <span className="muted">Oceń wszystkie zdania.</span>}
      </div>
      <p role="status" className={answer.passed ? 'theory-result is-passed' : 'theory-result'}>
        {checked &&
          (answer.passed
            ? 'Dobrze – komplet poprawnych odpowiedzi.'
            : `Poprawnie: ${correct} z ${part.statements.length}. Punkt jest tylko za komplet.`)}
      </p>
    </article>
  );
}
