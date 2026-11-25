import { describe, expect, it, vi } from 'vitest';
import type { FunctionTask, ProgramTask } from '../types';
import {
  aiConfigFromEnv,
  buildHintPrompt,
  HINT_COOLDOWN_MS,
  HINT_DAILY_LIMIT,
  HintError,
  hintQuota,
  recordHintUsage,
  requestHint,
} from './hints';

const programTask: ProgramTask = {
  id: '2024-maj-3.2',
  sessionId: '2024/maj',
  number: '3.2',
  title: 'Liczby pierwsze',
  part: 2,
  points: 3,
  topics: ['liczby-pierwsze'],
  summary: 'Policz liczby pierwsze w pliku.',
  starterCode: '',
  kind: 'program',
  checks: [{ label: 'Przykład', files: { 'liczby.txt': 'a/b.txt' }, expected: '2' }],
};

const functionTask: FunctionTask = {
  ...programTask,
  kind: 'function',
  functionName: 'nwd',
  tests: [{ args: [4, 6], expected: 2 }],
};

const config = { endpoint: 'https://proxy.example/' };
const asEnv = (env: Record<string, string>) => env as unknown as ImportMetaEnv;

const geminiReply = (body: unknown, status = 200) =>
  vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));

describe('aiConfigFromEnv', () => {
  it('bez adresu pośrednika wyłącza podpowiedzi', () => {
    expect(aiConfigFromEnv(asEnv({}))).toBeNull();
    expect(aiConfigFromEnv(asEnv({ VITE_AI_ENDPOINT: '  ' }))).toBeNull();
  });

  it('czyta adres pośrednika', () => {
    expect(aiConfigFromEnv(asEnv({ VITE_AI_ENDPOINT: ' https://ai.example/ ' }))).toEqual({
      endpoint: 'https://ai.example/',
    });
  });
});

describe('buildHintPrompt', () => {
  it('zawiera zadanie, kod i nieudane testy', () => {
    const prompt = buildHintPrompt({
      task: programTask,
      code: 'print(1)',
      output: null,
      previousHints: [],
      result: {
        passed: false,
        durationMs: 1,
        results: [
          { label: 'Przykład', passed: false, expected: '2', actual: '1', error: 'NameError' },
          { label: 'Dane', passed: true, expected: '5', actual: '5' },
        ],
      },
    });
    expect(prompt).toContain('Zadanie 3.2: Liczby pierwsze');
    expect(prompt).toContain('liczby.txt');
    expect(prompt).toContain('print(1)');
    expect(prompt).toContain('1/2 testów błędnie');
    expect(prompt).toContain('oczekiwano: 2');
    expect(prompt).toContain('NameError');
    expect(prompt).not.toContain('- Dane');
    expect(prompt).toContain('Uczeń prosi o podpowiedź.');
  });

  it('dla funkcji podaje jej nazwę, a przy kolejnej prośbie wcześniejsze podpowiedzi', () => {
    const prompt = buildHintPrompt({
      task: functionTask,
      code: '',
      result: null,
      output: { stdout: 'abc', error: 'ZeroDivisionError' },
      previousHints: ['Użyj algorytmu Euklidesa.'],
    });
    expect(prompt).toContain('funkcję nwd');
    expect(prompt).toContain('(pusty)');
    expect(prompt).toContain('ZeroDivisionError');
    expect(prompt).toContain('1. Użyj algorytmu Euklidesa.');
    expect(prompt).toContain('bardziej konkretną');
  });

  it('skraca bardzo długi kod', () => {
    const prompt = buildHintPrompt({
      task: programTask,
      code: 'x'.repeat(20_000),
      result: null,
      output: null,
      previousHints: [],
    });
    expect(prompt).toContain('(obcięte)');
    expect(prompt.length).toBeLessThan(10_000);
  });
});

describe('requestHint', () => {
  it('wysyła sam prompt do pośrednika (bez klucza) i zwraca tekst bez „myśli” modelu', async () => {
    const fetchMock = geminiReply({
      candidates: [
        { content: { parts: [{ text: 'tok', thought: true }, { text: ' Sprawdź pętlę. ' }] } },
      ],
    });
    await expect(requestHint(config, 'pytanie', fetchMock)).resolves.toBe('Sprawdź pętlę.');
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://proxy.example/');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(init.body)).toEqual({ prompt: 'pytanie' });
  });

  it.each([
    [429, /limit zapytań/],
    [403, /nie ma dostępu/],
    [400, /skrócić/],
    [502, /chwilowo/],
    [418, /HTTP 418/],
  ])('tłumaczy błąd HTTP %i', async (status, message) => {
    const promise = requestHint(config, 'p', geminiReply({}, status));
    await expect(promise).rejects.toBeInstanceOf(HintError);
    await expect(requestHint(config, 'p', geminiReply({}, status))).rejects.toThrow(message);
  });

  it('zgłasza pustą lub zablokowaną odpowiedź i brak sieci', async () => {
    await expect(requestHint(config, 'p', geminiReply({ candidates: [] }))).rejects.toThrow(
      /pustą/,
    );
    await expect(
      requestHint(config, 'p', geminiReply({ promptFeedback: { blockReason: 'SAFETY' } })),
    ).rejects.toThrow(/odmówiło/);
    const offline = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(requestHint(config, 'p', offline)).rejects.toThrow(/połączenia/);
  });
});

describe('limit podpowiedzi', () => {
  const start = Date.UTC(2026, 10, 25, 12);

  it('pilnuje odstępu między zapytaniami', () => {
    expect(hintQuota(start)).toEqual({ allowed: true, remaining: HINT_DAILY_LIMIT });
    recordHintUsage(start);
    expect(hintQuota(start + 1000)).toEqual({
      allowed: false,
      reason: 'cooldown',
      waitMs: HINT_COOLDOWN_MS - 1000,
    });
    expect(hintQuota(start + HINT_COOLDOWN_MS)).toEqual({
      allowed: true,
      remaining: HINT_DAILY_LIMIT - 1,
    });
  });

  it('ma dzienny limit, który odnawia się następnego dnia', () => {
    for (let i = 0; i < HINT_DAILY_LIMIT; i++) recordHintUsage(start + i * HINT_COOLDOWN_MS);
    const later = start + HINT_DAILY_LIMIT * HINT_COOLDOWN_MS;
    expect(hintQuota(later)).toEqual({ allowed: false, reason: 'daily' });
    expect(hintQuota(start + 24 * 3600 * 1000)).toMatchObject({ allowed: true });
  });

  it('ignoruje uszkodzony zapis', () => {
    localStorage.setItem('matura-inf:ai-usage', '{zly json');
    expect(hintQuota(start)).toMatchObject({ allowed: true });
  });
});
