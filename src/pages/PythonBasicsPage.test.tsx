import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PYTHON_BASICS } from '../data/pythonBasics';
import type { PythonRunner } from '../python/runner';
import { renderWithRouter } from '../../tests/render';
import { PythonBasicsPage } from './PythonBasicsPage';

function fakeRunner() {
  const runner = {
    status: 'ready',
    onStatus: () => () => {},
    executeSnippet: vi.fn(
      async (_code: string, options: { onOutput?: (text: string) => void } = {}) => {
        options.onOutput?.('Cześć\n');
        return { stdout: 'Cześć\n', error: null };
      },
    ),
  };
  return runner as unknown as PythonRunner & typeof runner;
}

describe('PythonBasicsPage', () => {
  it('pokazuje spis treści i wszystkie działy', () => {
    renderWithRouter(<PythonBasicsPage runner={fakeRunner()} />);
    const toc = screen.getByRole('navigation', { name: 'Spis treści' });
    expect(within(toc).getAllByRole('link')).toHaveLength(PYTHON_BASICS.length);
    for (const section of PYTHON_BASICS) {
      expect(screen.getByRole('region', { name: new RegExp(section.title) })).toBeInTheDocument();
    }
  });

  it('uruchamia przykład z danymi dla input() i pokazuje wynik', async () => {
    const runner = fakeRunner();
    renderWithRouter(<PythonBasicsPage runner={runner} />);
    const section = screen.getByRole('region', { name: /Wczytywanie z klawiatury/ });

    expect(within(section).getByLabelText('Wejście (dla input())')).toHaveValue('Ala\n7\n');
    await userEvent.click(within(section).getByRole('button', { name: /Uruchom/ }));

    expect(await within(section).findByLabelText('Wynik przykładu')).toHaveTextContent('Cześć');
    const [code, options] = runner.executeSnippet.mock.calls[0]!;
    expect(code).toContain('input(');
    expect(options).toMatchObject({ stdin: 'Ala\n7\n' });
  });
});
