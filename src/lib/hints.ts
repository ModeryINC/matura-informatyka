/**
 * Podpowiedzi AI (Google Gemini) – logika bez Reacta.
 *
 * Strona nie ma serwera, więc zapytanie idzie prosto z przeglądarki do Gemini API,
 * a klucz jest wstawiany przy buildzie (`VITE_AI_API_KEY`). Klucz jest przez to
 * publiczny – trzeba go ograniczyć w Google Cloud (patrz `docs/podpowiedzi-ai.md`),
 * a tutaj dodatkowo pilnujemy limitu zapytań z jednej przeglądarki.
 */
import type { SubmissionResult, Task } from '../types';
import type { ExecutionOutput } from '../python/runner';

/**
 * Domyślny model: Flash-Lite ma na darmowym planie najwięcej zapytań
 * (ok. 15/min i kilkaset dziennie), a do krótkich podpowiedzi w zupełności wystarcza.
 */
export const DEFAULT_MODEL = 'gemini-3.5-flash-lite';

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/** Odstęp między zapytaniami z jednej przeglądarki. */
export const HINT_COOLDOWN_MS = 20_000;
/** Dzienny limit podpowiedzi na przeglądarkę (wspólny klucz ma ograniczoną pulę). */
export const HINT_DAILY_LIMIT = 25;

const MAX_CODE_CHARS = 8_000;
const MAX_OUTPUT_CHARS = 1_500;

export interface AiConfig {
  apiKey: string;
  model: string;
}

/** Konfiguracja z buildu; `null`, gdy klucz nie został ustawiony. */
export function aiConfigFromEnv(env: ImportMetaEnv = import.meta.env): AiConfig | null {
  const apiKey = env.VITE_AI_API_KEY?.trim();
  if (!apiKey) return null;
  return { apiKey, model: env.VITE_AI_MODEL?.trim() || DEFAULT_MODEL };
}

export const SYSTEM_PROMPT = `Jesteś cierpliwym nauczycielem informatyki, który pomaga uczniowi przygotować się do matury z informatyki (poziom rozszerzony) w Pythonie.
Zasady:
- Odpowiadaj po polsku, krótko: 2–6 zdań. Bez powitań i formułek na końcu („daj znać, jak poszło”) – od razu do rzeczy.
- NIE podawaj pełnego rozwiązania ani gotowego programu. Naprowadzaj: wskaż błąd, przypadek brzegowy, pomysł na algorytm albo następny krok.
- Jeśli kod ma błąd, powiedz, w której linii lub konstrukcji, i dlaczego – ale nie przepisuj całego kodu.
- Możesz pokazać najwyżej 1–3 linijki kodu jako przykład konstrukcji.
- Gdy to kolejna podpowiedź, bądź bardziej konkretny niż poprzednio, ale nadal bez gotowego rozwiązania.
- Formatowanie: zwykły tekst, \`kod\` w odwrotnych apostrofach, **pogrubienie**, listy z "- ", bloki kodu w \`\`\`. Bez nagłówków i tabel.`;

const clip = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max)}\n… (obcięte)` : text;

export interface HintContext {
  task: Task;
  code: string;
  result: SubmissionResult | null;
  output: ExecutionOutput | null;
  /** Wcześniejsze podpowiedzi do tego zadania (od najstarszej). */
  previousHints: string[];
}

/** Buduje treść zapytania: zadanie, kod ucznia i to, co wiadomo o jego wyniku. */
export function buildHintPrompt({
  task,
  code,
  result,
  output,
  previousHints,
}: HintContext): string {
  const parts: string[] = [`# Zadanie ${task.number}: ${task.title}`, task.summary];

  if (task.kind === 'program') {
    const files = Object.keys(task.checks[0]?.files ?? {}).join(', ');
    parts.push(
      `Uczeń pisze program, który czyta plik(i) ${files} i wypisuje odpowiedź przez print.`,
    );
  } else {
    parts.push(
      `Uczeń ma zdefiniować funkcję ${task.functionName}, sprawdzaną testami (zwracana wartość).`,
    );
  }

  parts.push('# Kod ucznia', '```python', clip(code.trim() || '(pusty)', MAX_CODE_CHARS), '```');

  if (result) {
    const failed = result.results.filter((r) => !r.passed);
    if (failed.length === 0) {
      parts.push('# Wynik sprawdzenia', 'Wszystkie testy zaliczone.');
    } else {
      parts.push(`# Wynik sprawdzenia (${failed.length}/${result.results.length} testów błędnie)`);
      for (const check of failed.slice(0, 3)) {
        const lines = [`- ${check.label}`];
        if (check.expected) lines.push(`  oczekiwano: ${clip(check.expected, 200)}`);
        lines.push(`  otrzymano: ${clip(check.actual || '(brak wyjścia)', 200)}`);
        if (check.error) lines.push(`  błąd: ${clip(check.error, 600)}`);
        parts.push(lines.join('\n'));
      }
    }
  } else if (output && (output.stdout || output.error)) {
    parts.push('# Ostatnie uruchomienie', clip(output.stdout, MAX_OUTPUT_CHARS));
    if (output.error) parts.push(`Błąd:\n${clip(output.error, 600)}`);
  }

  if (previousHints.length > 0) {
    parts.push(
      '# Twoje wcześniejsze podpowiedzi',
      ...previousHints.map((hint, i) => `${i + 1}. ${clip(hint, 600)}`),
      'Uczeń prosi o kolejną, bardziej konkretną podpowiedź.',
    );
  } else {
    parts.push('Uczeń prosi o podpowiedź.');
  }
  return parts.join('\n\n');
}

export class HintError extends Error {}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[];
  promptFeedback?: { blockReason?: string };
  error?: { message?: string };
}

const errorMessage = (status: number): string => {
  if (status === 429)
    return 'Wyczerpano limit zapytań do AI (darmowy plan). Spróbuj za kilka minut albo jutro.';
  if (status === 400 || status === 401 || status === 403)
    return 'Usługa AI odrzuciła zapytanie – klucz API jest nieprawidłowy lub ograniczony.';
  if (status === 404) return 'Wybrany model AI jest niedostępny.';
  if (status >= 500) return 'Usługa AI jest chwilowo niedostępna – spróbuj ponownie za chwilę.';
  return `Nie udało się pobrać podpowiedzi (HTTP ${status}).`;
};

/** Wysyła zapytanie do Gemini i zwraca tekst podpowiedzi. */
export async function requestHint(
  config: AiConfig,
  prompt: string,
  fetchImpl: typeof fetch = fetch,
  signal?: AbortSignal,
): Promise<string> {
  let response: Response;
  try {
    response = await fetchImpl(`${API_URL}/${encodeURIComponent(config.model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4 },
      }),
      signal,
    });
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error;
    throw new HintError('Brak połączenia z usługą AI – sprawdź internet.');
  }
  if (!response.ok) throw new HintError(errorMessage(response.status));

  const data = (await response.json()) as GeminiResponse;
  const text = (data.candidates?.[0]?.content?.parts ?? [])
    .filter((part) => !part.thought && part.text)
    .map((part) => part.text)
    .join('')
    .trim();
  if (!text) {
    throw new HintError(
      data.promptFeedback?.blockReason
        ? 'AI odmówiło odpowiedzi na to zapytanie.'
        : 'AI zwróciło pustą odpowiedź – spróbuj ponownie.',
    );
  }
  return text;
}

/* ---- Limit zapytań z jednej przeglądarki ---------------------------------- */

const USAGE_KEY = 'matura-inf:ai-usage';

interface Usage {
  day: string;
  count: number;
  last: number;
}

const today = (now: number) => new Date(now).toISOString().slice(0, 10);

function readUsage(now: number): Usage {
  try {
    const parsed = JSON.parse(localStorage.getItem(USAGE_KEY) ?? 'null') as Usage | null;
    if (parsed && parsed.day === today(now)) return parsed;
    return { day: today(now), count: 0, last: parsed?.last ?? 0 };
  } catch {
    return { day: today(now), count: 0, last: 0 };
  }
}

export type HintQuota =
  | { allowed: true; remaining: number }
  | { allowed: false; reason: 'cooldown'; waitMs: number }
  | { allowed: false; reason: 'daily' };

/** Czy można teraz poprosić o podpowiedź (odstęp i dzienny limit). */
export function hintQuota(now = Date.now()): HintQuota {
  const usage = readUsage(now);
  if (usage.count >= HINT_DAILY_LIMIT) return { allowed: false, reason: 'daily' };
  const waitMs = usage.last + HINT_COOLDOWN_MS - now;
  if (waitMs > 0) return { allowed: false, reason: 'cooldown', waitMs };
  return { allowed: true, remaining: HINT_DAILY_LIMIT - usage.count };
}

/** Zapisuje wykorzystanie jednej podpowiedzi. */
export function recordHintUsage(now = Date.now()): void {
  const usage = readUsage(now);
  try {
    localStorage.setItem(
      USAGE_KEY,
      JSON.stringify({ day: usage.day, count: usage.count + 1, last: now } satisfies Usage),
    );
  } catch {
    // Brak dostępu do localStorage (np. zablokowane dane witryny) – limit nie zadziała,
    // ale podpowiedź i tak może zostać pokazana.
  }
}
