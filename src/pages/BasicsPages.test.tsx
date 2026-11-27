import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EXCEL_BASICS } from '../data/excelBasics';
import { SQL_BASICS } from '../data/sqlBasics';
import type { SqlClient } from '../lib/sql/client';
import { renderWithRouter } from '../../tests/render';
import { ExcelBasicsPage } from './ExcelBasicsPage';
import { SqlBasicsPage } from './SqlBasicsPage';

describe('Podstawy Excela', () => {
  it('ma zakładki, spis treści i wszystkie działy', () => {
    renderWithRouter(<ExcelBasicsPage />);
    const tabs = screen.getByRole('navigation', { name: 'Podstawy' });
    expect(
      within(tabs)
        .getAllByRole('link')
        .map((l) => l.textContent),
    ).toEqual(['Python', 'Excel', 'SQL']);
    const toc = screen.getByRole('navigation', { name: 'Spis treści' });
    expect(within(toc).getAllByRole('link')).toHaveLength(EXCEL_BASICS.length);
  });

  it('kliknięta komórka z formułą pokazuje formułę w pasku formuły', async () => {
    renderWithRouter(<ExcelBasicsPage />);
    const section = screen.getByRole('region', { name: /Formuły i adresy/ });
    const bar = within(section).getByRole('status');
    expect(bar).toHaveTextContent('E2');
    expect(bar).toHaveTextContent('=D2*(1+$B$6)');
    await userEvent.click(within(section).getByRole('button', { name: /^D5: 28/ }));
    expect(bar).toHaveTextContent('=SUMA(D2:D4)');
    expect(within(section).getByRole('button', { name: /^E2: 12,3/ })).toBeInTheDocument();
  });
});

describe('Podstawy SQL', () => {
  function fakeClient() {
    const client = {
      init: vi.fn().mockResolvedValue([
        {
          name: 'uczniowie',
          columns: ['id_ucznia', 'imie'],
          types: ['INTEGER', 'TEXT'],
          rows: 16,
        },
      ]),
      run: vi.fn().mockResolvedValue({
        results: [{ columns: ['imie'], rows: [['Ola']], truncated: false }],
        error: null,
        changes: 0,
      }),
      dispose: vi.fn(),
    };
    return client as unknown as SqlClient & typeof client;
  }

  it('pokazuje bazę i uruchamia zapytanie z lekcji', async () => {
    const client = fakeClient();
    renderWithRouter(<SqlBasicsPage client={client} />);
    expect(await screen.findByText(/id_ucznia, imie/)).toBeInTheDocument();
    const toc = screen.getByRole('navigation', { name: 'Spis treści' });
    expect(within(toc).getAllByRole('link')).toHaveLength(SQL_BASICS.length);

    const section = screen.getByRole('region', { name: /SELECT i WHERE/ });
    await userEvent.click(within(section).getAllByRole('button', { name: /Uruchom/ })[0]!);
    expect(client.run).toHaveBeenCalledWith(SQL_BASICS[0]!.examples[0]!.sql);
    expect(await within(section).findByRole('cell', { name: 'Ola' })).toBeInTheDocument();
  });
});
