/**
 * Pośrednik podpowiedzi AI (Cloudflare Worker).
 *
 * Trzyma klucz Gemini jako sekret (`GEMINI_API_KEY`), więc klucz nie trafia do
 * kodu strony. Przyjmuje tylko zapytania ze strony (nagłówek Origin), ogranicza
 * liczbę zapytań z jednego adresu IP i sam dokłada instrukcję systemową oraz
 * model – nie da się go użyć jako ogólnego dostępu do Gemini z dowolnym promptem
 * systemowym.
 *
 * API: `POST /` z `{"prompt": "..."}` → odpowiedź Gemini (`generateContent`).
 */

/** Wiązanie Cloudflare Rate Limiting (`[[ratelimits]]` w wrangler.toml). */
export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  GEMINI_API_KEY: string;
  /** Dozwolone adresy stron, po przecinku, np. `https://moderyinc.github.io`. */
  ALLOWED_ORIGINS: string;
  AI_MODEL?: string;
  HINT_LIMITER?: RateLimiter;
}

export const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
export const MAX_PROMPT_CHARS = 14_000;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export const SYSTEM_PROMPT = `Jesteś cierpliwym nauczycielem informatyki, który pomaga uczniowi przygotować się do matury z informatyki (poziom rozszerzony) w Pythonie.
Zasady:
- Odpowiadaj po polsku, krótko: 2–6 zdań. Bez powitań i formułek na końcu („daj znać, jak poszło”) – od razu do rzeczy.
- NIE podawaj pełnego rozwiązania ani gotowego programu. Naprowadzaj: wskaż błąd, przypadek brzegowy, pomysł na algorytm albo następny krok.
- Jeśli kod ma błąd, powiedz, w której linii lub konstrukcji, i dlaczego – ale nie przepisuj całego kodu.
- Możesz pokazać najwyżej 1–3 linijki kodu jako przykład konstrukcji.
- Gdy to kolejna podpowiedź, bądź bardziej konkretny niż poprzednio, ale nadal bez gotowego rozwiązania.
- Pomagasz wyłącznie w zadaniach z informatyki i programowania; na inne prośby odpowiedz jednym zdaniem, że w tym nie pomagasz.
- Formatowanie: zwykły tekst, \`kod\` w odwrotnych apostrofach, **pogrubienie**, listy z "- ", bloki kodu w \`\`\`. Bez nagłówków i tabel.`;

const allowedOrigins = (env: Env) =>
  env.ALLOWED_ORIGINS.split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

const corsHeaders = (origin: string): Record<string, string> => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
});

const json = (body: unknown, status: number, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });

const error = (message: string, status: number, headers?: Record<string, string>) =>
  json({ error: { message } }, status, headers);

export async function handleRequest(
  request: Request,
  env: Env,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  const origin = request.headers.get('Origin')?.replace(/\/$/, '') ?? '';
  // Zapytania spoza strony (inne domeny, curl bez nagłówka Origin) odrzucamy.
  if (!allowedOrigins(env).includes(origin)) return error('Niedozwolone źródło zapytania.', 403);
  const cors = corsHeaders(origin);

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'POST') return error('Dozwolona jest tylko metoda POST.', 405, cors);

  if (env.HINT_LIMITER) {
    const ip = request.headers.get('CF-Connecting-IP') ?? 'nieznany';
    const { success } = await env.HINT_LIMITER.limit({ key: ip });
    if (!success) return error('Za dużo zapytań – odczekaj chwilę.', 429, cors);
  }

  let prompt: unknown;
  try {
    ({ prompt } = (await request.json()) as { prompt?: unknown });
  } catch {
    return error('Nieprawidłowe dane zapytania.', 400, cors);
  }
  if (typeof prompt !== 'string' || prompt.trim() === '' || prompt.length > MAX_PROMPT_CHARS) {
    return error('Nieprawidłowa treść zapytania.', 400, cors);
  }
  if (!env.GEMINI_API_KEY) return error('Pośrednik nie ma skonfigurowanego klucza.', 500, cors);

  const model = env.AI_MODEL?.trim() || DEFAULT_MODEL;
  let upstream: Response;
  try {
    upstream = await fetchImpl(`${GEMINI_URL}/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4 },
      }),
    });
  } catch {
    return error('Usługa AI jest niedostępna.', 502, cors);
  }

  if (!upstream.ok) {
    // Pełny komunikat Gemini zostaje w logach Workera; na zewnątrz tylko kody przyczyny
    // (np. API_KEY_INVALID, FAILED_PRECONDITION) – bez treści i bez klucza.
    const text = await upstream.text();
    console.error('Gemini', upstream.status, text.slice(0, 500));
    let reason: string | undefined;
    try {
      const data = JSON.parse(text) as {
        error?: { status?: string; details?: { reason?: string }[] };
      };
      reason = [data.error?.status, data.error?.details?.find((d) => d.reason)?.reason]
        .filter((part) => part && /^[A-Z_]+$/.test(part))
        .join('/');
    } catch {
      reason = undefined;
    }
    // 401/403 z Gemini to problem klucza po stronie pośrednika, nie użytkownika.
    const status = upstream.status === 401 || upstream.status === 403 ? 502 : upstream.status;
    return json(
      { error: { message: 'Usługa AI odrzuciła zapytanie.', ...(reason ? { reason } : {}) } },
      status,
      cors,
    );
  }
  return json(await upstream.json(), 200, cors);
}

export default {
  fetch: (request: Request, env: Env) => handleRequest(request, env),
};
