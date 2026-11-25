import { describe, expect, it, vi } from 'vitest';
import { downloadText, isSaveShortcut, solutionFileName } from './download';

describe('download', () => {
  it('tworzy nazwę pliku .py z identyfikatora zadania', () => {
    expect(solutionFileName('2024-maj-3.2')).toBe('2024-maj-3.2.py');
    expect(solutionFileName('2022-probna/x y')).toBe('2022-probna_x_y.py');
  });

  it('rozpoznaje Ctrl+S i Cmd+S', () => {
    expect(isSaveShortcut(new KeyboardEvent('keydown', { key: 's', ctrlKey: true }))).toBe(true);
    expect(isSaveShortcut(new KeyboardEvent('keydown', { key: 'S', metaKey: true }))).toBe(true);
    expect(isSaveShortcut(new KeyboardEvent('keydown', { key: 's' }))).toBe(false);
    expect(
      isSaveShortcut(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, altKey: true })),
    ).toBe(false);
  });

  it('pobiera tekst jako plik', () => {
    const createUrl = vi.fn().mockReturnValue('blob:x');
    const revoke = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL: createUrl, revokeObjectURL: revoke });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    downloadText('a.py', 'print(1)');

    expect(createUrl).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalledTimes(1);
    expect(document.querySelector('a[download]')).toBeNull();
    click.mockRestore();
    vi.unstubAllGlobals();
  });
});
