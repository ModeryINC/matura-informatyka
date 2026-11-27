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
    ).toEqual(['Python', 'Excel', 'SQL', 'Algorytmy', 'Teoria']);
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

describe('Podstawy teorii', () => {
  it('ma wszystkie działy i działające narzędzia', async () => {
    const { THEORY_BASICS } = await import('../data/theoryBasics');
    const { TheoryBasicsPage } = await import('./TheoryBasicsPage');
    renderWithRouter(<TheoryBasicsPage />);
    const toc = screen.getByRole('navigation', { name: 'Spis treści' });
    expect(within(toc).getAllByRole('link')).toHaveLength(THEORY_BASICS.length);

    const numbers = screen.getByRole('region', { name: /Zamiana systemów liczbowych/ });
    expect(within(numbers).getByText('BA₁₆')).toBeInTheDocument();
    await userEvent.clear(within(numbers).getByLabelText('Liczba'));
    await userEvent.type(within(numbers).getByLabelText('Liczba'), '255');
    expect(within(numbers).getByText('FF₁₆')).toBeInTheDocument();

    const ip = screen.getByRole('region', { name: /adresacji IPv4/ });
    expect(within(ip).getByText('192.168.10.64')).toBeInTheDocument();
    await userEvent.clear(within(ip).getByLabelText(/Maska/));
    await userEvent.type(within(ip).getByLabelText(/Maska/), '/24');
    expect(within(ip).getByText('192.168.10.0')).toBeInTheDocument();

    const gates = screen.getByRole('region', { name: /Bramki logiczne/ });
    await userEvent.click(within(gates).getByRole('button', { name: 'b = 0' }));
    expect(within(gates).getByRole('button', { name: 'b = 1' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});

describe('Podstawy algorytmiki', () => {
  it('przechodzi algorytm krok po kroku i przyjmuje własne dane', async () => {
    const { ALGORITHMS } = await import('../lib/algorithms');
    const { AlgorithmsBasicsPage } = await import('./AlgorithmsBasicsPage');
    renderWithRouter(<AlgorithmsBasicsPage />);
    const toc = screen.getByRole('navigation', { name: 'Spis treści' });
    expect(within(toc).getAllByRole('link')).toHaveLength(ALGORITHMS.length);

    const bubble = screen.getByRole('region', { name: /Sortowanie bąbelkowe/ });
    expect(within(bubble).getByText(/Krok 1\//)).toBeInTheDocument();
    await userEvent.click(within(bubble).getByRole('button', { name: 'Następny krok' }));
    await userEvent.click(within(bubble).getByRole('button', { name: 'Następny krok' }));
    expect(within(bubble).getByText(/Krok 3\//)).toBeInTheDocument();
    expect(within(bubble).getByText(/Porównujemy t\[0\]/)).toBeInTheDocument();

    const input = within(bubble).getByLabelText('Tablica (liczby oddzielone przecinkami)');
    await userEvent.clear(input);
    await userEvent.type(input, '3, 1, 2');
    await userEvent.click(within(bubble).getByRole('button', { name: /Zastosuj dane/ }));
    expect(within(bubble).getByText(/Krok 1\//)).toBeInTheDocument();
    await userEvent.click(within(bubble).getByRole('button', { name: 'Na koniec' }));
    expect(bubble.querySelector('.algo__note')).toHaveTextContent(/posortowana/);

    await userEvent.clear(input);
    await userEvent.type(input, '3, x');
    await userEvent.click(within(bubble).getByRole('button', { name: /Zastosuj dane/ }));
    expect(within(bubble).getByText(/Wpisz liczby całkowite/)).toBeInTheDocument();

    const fib = screen.getByRole('region', { name: /Fibonacciego/ });
    // Miejsce na całe drzewo jest zarezerwowane od pierwszego kroku.
    const viewBox = within(fib).getByRole('img').getAttribute('viewBox');
    expect(fib.querySelectorAll('.algo-tree__node')).toHaveLength(1);
    await userEvent.click(within(fib).getByRole('button', { name: 'Na koniec' }));
    expect(within(fib).getByRole('img').getAttribute('viewBox')).toBe(viewBox);
    expect(within(fib).getByRole('img', { name: /fib\(5\) = 5/ })).toBeInTheDocument();
  });
});
