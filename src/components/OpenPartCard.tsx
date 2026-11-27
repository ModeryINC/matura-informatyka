import { useId, type ReactNode } from 'react';
import { LuCheck, LuCircleCheck, LuThumbsDown, LuThumbsUp } from 'react-icons/lu';
import { EyeMorphIcon } from './MorphIcon';
import { normalizeShortAnswer, type OpenPartAnswer } from '../lib/theory/storage';
import type { OpenPart } from '../types';
import { HintText } from './HintText';

interface OpenPartCardProps {
  part: OpenPart;
  answer: OpenPartAnswer;
  onChange: (answer: OpenPartAnswer) => void;
  heading?: ReactNode;
}

/**
 * Podpunkt zadania otwartego: pole na własną odpowiedź i rozwiązanie z klucza.
 * Krótkie odpowiedzi (liczba, słowo) sprawdzamy automatycznie; dłuższe – po
 * odsłonięciu klucza zdający sam ocenia, czy ma dobrze.
 */
export function OpenPartCard({ part, answer, onChange, heading }: OpenPartCardProps) {
  const id = useId();
  const auto = part.accepted !== undefined;
  const filled = answer.text.trim() !== '';

  const check = () => {
    const given = normalizeShortAnswer(answer.text);
    const passed = part.accepted!.some((a) => normalizeShortAnswer(a) === given);
    onChange({ ...answer, passed });
  };

  return (
    <article
      className={`xl-part theory-part open-part${answer.passed ? ' xl-part--passed' : ''}`}
      aria-labelledby={`${id}-tytul`}
    >
      <header className="xl-part__header">
        <h2 id={`${id}-tytul`} className="xl-part__title">
          {heading ?? `Zadanie ${part.number}`}{' '}
          <span className="muted open-part__points">({part.points} pkt)</span>
        </h2>
        {answer.passed && (
          <span className="xl-part__badge">
            <LuCircleCheck aria-hidden className="icon" /> Zaliczone
          </span>
        )}
      </header>
      <HintText text={part.prompt} className="rich-text" />
      <label className="open-part__label" htmlFor={`${id}-odp`}>
        Twoja odpowiedź
      </label>
      <textarea
        id={`${id}-odp`}
        className="open-part__input"
        rows={auto ? 1 : 4}
        value={answer.text}
        spellCheck={false}
        onChange={(event) => onChange({ ...answer, text: event.target.value, passed: undefined })}
      />
      <div className="xl-part__actions">
        {auto && (
          <button
            type="button"
            className="button button--primary button--small"
            disabled={!filled}
            onClick={check}
          >
            <LuCheck aria-hidden className="icon" /> Sprawdź
          </button>
        )}
        <button
          type="button"
          className={`button button--small ${auto ? 'button--ghost' : 'button--primary'}`}
          onClick={() => onChange({ ...answer, revealed: !answer.revealed })}
          aria-expanded={answer.revealed ?? false}
          aria-controls={`${id}-klucz`}
        >
          <EyeMorphIcon off={answer.revealed ?? false} />{' '}
          {answer.revealed ? 'Ukryj rozwiązanie' : 'Pokaż rozwiązanie'}
        </button>
      </div>
      {answer.revealed && (
        <section id={`${id}-klucz`} className="open-part__key" aria-label="Rozwiązanie z klucza">
          <h3>Rozwiązanie z klucza</h3>
          <HintText text={part.answer} className="rich-text" />
          {!auto && (
            <div className="open-part__self">
              <span>Jak Ci poszło?</span>
              <button
                type="button"
                className="button button--small"
                aria-pressed={answer.passed === true}
                onClick={() => onChange({ ...answer, passed: true })}
              >
                <LuThumbsUp aria-hidden className="icon" /> Mam dobrze
              </button>
              <button
                type="button"
                className="button button--small button--ghost"
                aria-pressed={answer.passed === false}
                onClick={() => onChange({ ...answer, passed: false })}
              >
                <LuThumbsDown aria-hidden className="icon" /> Jeszcze nie
              </button>
            </div>
          )}
        </section>
      )}
      <p role="status" className={answer.passed ? 'theory-result is-passed' : 'theory-result'}>
        {auto &&
          answer.passed !== undefined &&
          (answer.passed
            ? 'Dobrze – odpowiedź zgodna z kluczem.'
            : 'Niezgodne z kluczem. Spróbuj jeszcze raz albo zobacz rozwiązanie.')}
      </p>
    </article>
  );
}
