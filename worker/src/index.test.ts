// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_MODEL, handleRequest, MAX_PROMPT_CHARS, SYSTEM_PROMPT, type Env } from './index';

const SITE = 'https://moderyinc.github.io';

const env = (overrides: Partial<Env> = {}): Env => ({
  GEMINI_API_KEY: 'secret-key',
  ALLOWED_ORIGINS: `${SITE}, http://localhost:5173`,
  ...overrides,
});

const post = (body: unknown, origin: string | null = SITE, method = 'POST') =>
  new Request('https://proxy.example/', {
    method,
    headers: {
      'Content-Type': 'application/json',
      'CF-Connecting-IP': '1.2.3.4',
      ...(origin ? { Origin: origin } : {}),
    },
    ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
  });

const gemini = (body: unknown, status = 200) =>
  vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));

describe('pośrednik podpowiedzi AI', () => {
  it('przekazuje prompt do Gemini z kluczem, instrukcją systemową i modelem', async () => {
    const reply = { candidates: [{ content: { parts: [{ text: 'Wskazówka' }] } }] };
    const fetchMock = gemini(reply);
    const response = await handleRequest(post({ prompt: 'Pomóż' }), env(), fetchMock);

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(SITE);
    expect(await response.json()).toEqual(reply);

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toContain(`/models/${DEFAULT_MODEL}:generateContent`);
    expect(init.headers['x-goog-api-key']).toBe('secret-key');
    const body = JSON.parse(init.body);
    expect(body.systemInstruction.parts[0].text).toBe(SYSTEM_PROMPT);
    expect(body.contents[0].parts[0].text).toBe('Pomóż');
  });

  it('używa modelu z konfiguracji', async () => {
    const fetchMock = gemini({});
    await handleRequest(post({ prompt: 'x' }), env({ AI_MODEL: 'inny-model' }), fetchMock);
    expect(fetchMock.mock.calls[0]![0]).toContain('/models/inny-model:');
  });

  it('odrzuca obce źródła i zapytania bez nagłówka Origin', async () => {
    const fetchMock = gemini({});
    expect(
      (await handleRequest(post({ prompt: 'x' }, 'https://zlo.example'), env(), fetchMock)).status,
    ).toBe(403);
    expect((await handleRequest(post({ prompt: 'x' }, null), env(), fetchMock)).status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('obsługuje preflight CORS i odrzuca inne metody', async () => {
    const preflight = await handleRequest(post(null, SITE, 'OPTIONS'), env());
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    expect((await handleRequest(post(null, SITE, 'GET'), env())).status).toBe(405);
  });

  it('pilnuje limitu zapytań z jednego IP', async () => {
    const limit = vi.fn().mockResolvedValue({ success: false });
    const fetchMock = gemini({});
    const response = await handleRequest(
      post({ prompt: 'x' }),
      env({ HINT_LIMITER: { limit } }),
      fetchMock,
    );
    expect(response.status).toBe(429);
    expect(limit).toHaveBeenCalledWith({ key: '1.2.3.4' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ['nie-json', 400],
    [{ prompt: '' }, 400],
    [{ prompt: 5 }, 400],
    [{ prompt: 'x'.repeat(MAX_PROMPT_CHARS + 1) }, 400],
  ])('waliduje treść zapytania (%#)', async (body, status) => {
    expect((await handleRequest(post(body), env(), gemini({}))).status).toBe(status);
  });

  it('nie ujawnia szczegółów błędów Gemini, a problem z kluczem zgłasza jako 502', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const denied = await handleRequest(
      post({ prompt: 'x' }),
      env(),
      gemini({ error: { message: 'API key not valid secret-key' } }, 401),
    );
    expect(denied.status).toBe(502);
    expect(await denied.text()).not.toContain('secret-key');

    const invalid = await handleRequest(
      post({ prompt: 'x' }),
      env(),
      gemini(
        {
          error: {
            status: 'INVALID_ARGUMENT',
            message: 'API key not valid secret-key',
            details: [{ reason: 'API_KEY_INVALID' }],
          },
        },
        400,
      ),
    );
    expect(invalid.status).toBe(502);
    const invalidBody = await invalid.text();
    expect(JSON.parse(invalidBody).error.reason).toBe('INVALID_ARGUMENT/API_KEY_INVALID');
    expect(invalidBody).not.toContain('secret-key');

    const limited = await handleRequest(post({ prompt: 'x' }), env(), gemini({}, 429));
    expect(limited.status).toBe(429);

    const offline = await handleRequest(
      post({ prompt: 'x' }),
      env(),
      vi.fn().mockRejectedValue(new TypeError('network')),
    );
    expect(offline.status).toBe(502);
    consoleError.mockRestore();
  });

  it('zgłasza brak klucza w konfiguracji', async () => {
    const response = await handleRequest(post({ prompt: 'x' }), env({ GEMINI_API_KEY: '' }));
    expect(response.status).toBe(500);
  });
});
