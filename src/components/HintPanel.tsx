import { useEffect, useRef, useState } from 'react';
import {
  buildHintPrompt,
  HintError,
  hintQuota,
  recordHintUsage,
  requestHint,
  type AiConfig,
} from '../lib/hints';
import type { ExecutionOutput } from '../python/runner';
import type { SubmissionResult, Task } from '../types';
import { HintText } from './HintText';

interface HintPanelProps {
  config: AiConfig;
  task: Task;
  code: string;
  result: SubmissionResult | null;
  output: ExecutionOutput | null;
  /** Podmiana `fetch` w testach. */
  fetchImpl?: typeof fetch;
}

/**
 * Podpowiedzi AI do bieżącego zadania. Każda kolejna prośba dostaje wcześniejsze
 * podpowiedzi, więc AI może naprowadzać coraz konkretniej. Historia żyje tylko
 * w tej karcie – po przejściu do innego zadania zaczyna się od nowa.
 */
export function HintPanel({ config, task, code, result, output, fetchImpl }: HintPanelProps) {
  const [hints, setHints] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const abort = useRef<AbortController | null>(null);

  const quota = hintQuota(now);
  const coolingDown = !quota.allowed && quota.reason === 'cooldown';

  // Odliczanie do następnej możliwej prośby.
  useEffect(() => {
    if (!coolingDown) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [coolingDown]);

  useEffect(() => () => abort.current?.abort(), []);

  const ask = async () => {
    const current = hintQuota();
    if (!current.allowed) {
      setNow(Date.now());
      return;
    }
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setLoading(true);
    setError(null);
    recordHintUsage();
    try {
      const prompt = buildHintPrompt({ task, code, result, output, previousHints: hints });
      const hint = await requestHint(config, prompt, fetchImpl, controller.signal);
      setHints((previous) => [...previous, hint]);
    } catch (caught) {
      if (controller.signal.aborted) return;
      setError(caught instanceof HintError ? caught.message : 'Nie udało się pobrać podpowiedzi.');
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setNow(Date.now());
      }
    }
  };

  let status: string | null = null;
  if (!quota.allowed) {
    status =
      quota.reason === 'daily'
        ? 'Wykorzystano dzisiejszy limit podpowiedzi AI. Wróć jutro!'
        : `Następna podpowiedź za ${Math.ceil(quota.waitMs / 1000)} s.`;
  }

  return (
    <section className="hints" aria-label="Podpowiedzi AI">
      <header className="hints__header">
        <h3 className="hints__title">Podpowiedzi AI</h3>
        <button
          type="button"
          className="button button--small"
          onClick={ask}
          disabled={loading || !quota.allowed}
        >
          {loading ? 'Myślę…' : hints.length ? '💡 Kolejna podpowiedź' : '💡 Poproś o podpowiedź'}
        </button>
      </header>

      {hints.length === 0 && !loading && !error && (
        <p className="hints__intro">
          Utknąłeś? AI spojrzy na Twój kod i wynik sprawdzenia i naprowadzi Cię – bez podawania
          gotowego rozwiązania.
        </p>
      )}

      {hints.length > 0 && (
        <ol className="hints__list" aria-live="polite">
          {hints.map((hint, i) => (
            <li key={i} className="hints__item">
              <HintText text={hint} />
            </li>
          ))}
        </ol>
      )}

      {error && (
        <p className="hints__error" role="alert">
          {error}
        </p>
      )}
      {status && !loading && <p className="hints__status">{status}</p>}
      <p className="hints__note">
        Treść zadania i Twój kod są wysyłane do Google Gemini. AI może się mylić – traktuj
        podpowiedź jako wskazówkę.
      </p>
    </section>
  );
}
