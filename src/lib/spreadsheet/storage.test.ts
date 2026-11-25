import type { Sheet } from '@fortune-sheet/core';
import {
  loadAnswers,
  loadWorkbook,
  passedParts,
  removeWorkbook,
  saveAnswers,
  saveWorkbook,
} from './storage';
import { compactSheets, loadTaskSheets } from './workbook';
import type { SpreadsheetTask } from '../../types';

beforeEach(() => localStorage.clear());

describe('zapis odpowiedzi', () => {
  it('zwraca pusty stan, gdy nic nie zapisano lub zapis jest uszkodzony', () => {
    expect(loadAnswers('t')).toEqual({ parts: {} });
    localStorage.setItem('matura-inf:excel:t', '{zepsute');
    expect(loadAnswers('t')).toEqual({ parts: {} });
  });

  it('zapisuje odpowiedzi i liczy zaliczone podpunkty', () => {
    saveAnswers('t', { parts: { '6.1': { passed: true }, '6.2': { fields: ['1'] } } });
    expect(loadAnswers('t').parts['6.2']).toEqual({ fields: ['1'] });
    expect(passedParts('t')).toBe(1);
  });
});

describe('zapis arkusza', () => {
  it('zapisuje, wczytuje i usuwa arkusz', () => {
    expect(loadWorkbook('t')).toBeNull();
    expect(saveWorkbook('t', [{ name: 'a', celldata: [] }])).toBe(true);
    expect(loadWorkbook('t')).toEqual([{ name: 'a', celldata: [] }]);
    removeWorkbook('t');
    expect(loadWorkbook('t')).toBeNull();
  });

  it('zgłasza brak miejsca w pamięci', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(saveWorkbook('t', [{ name: 'a' }])).toBe(false);
    spy.mockRestore();
  });

  it('zamienia macierz komórek na listę bez pustych pól', () => {
    const sheets: Sheet[] = [
      {
        name: 'a',
        data: [
          [{ v: 1 }, null],
          [null, { v: 'x', f: '=A1' }],
        ],
      },
      { name: 'b', celldata: [] },
    ];
    expect(compactSheets(sheets)).toEqual([
      {
        name: 'a',
        celldata: [
          { r: 0, c: 0, v: { v: 1 } },
          { r: 1, c: 1, v: { v: 'x', f: '=A1' } },
        ],
      },
      { name: 'b', celldata: [] },
    ]);
  });
});

describe('loadTaskSheets', () => {
  const task = {
    files: [
      { sheet: 'a', path: 'arkusze/a.txt', hasHeader: true },
      { sheet: 'b', path: 'arkusze/b.txt' },
    ],
  } as SpreadsheetTask;

  it('pobiera każdy plik do osobnej karty', async () => {
    const fetchImpl = vi.fn(
      async (url: string) => new Response(url.endsWith('a.txt') ? 'x\n1\n' : '2\n'),
    );
    const sheets = await loadTaskSheets(task, fetchImpl as unknown as typeof fetch);
    expect(sheets.map((s) => [s.name, s.celldata?.length])).toEqual([
      ['a', 2],
      ['b', 1],
    ]);
  });

  it('zgłasza błąd pobierania', async () => {
    const fetchImpl = vi.fn(async () => new Response('', { status: 404 }));
    await expect(loadTaskSheets(task, fetchImpl as unknown as typeof fetch)).rejects.toThrow('404');
  });
});
