import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { QueryOutcome } from '../lib/sql/engine';
import type { TableInfo } from '../lib/sql/protocol';
import { loadQuery, loadSqlAnswers } from '../lib/sql/storage';
import { renderAt } from '../../tests/render';
import { SqlTaskPage } from './SqlTaskPage';
import { SqlTasksPage } from './SqlTasksPage';

const fake = vi.hoisted(() => ({
  outcome: null as QueryOutcome | null,
  initError: null as string | null,
  queries: [] as string[],
  resets: 0,
}));

const schema: TableInfo[] = [
  {
    name: 'klienci',
    columns: ['IdKlienta', 'Imie', 'Plec'],
    types: ['INTEGER', 'TEXT', 'TEXT'],
    rows: 2045,
  },
  { name: 'transakcje', columns: ['IdTransakcji'], types: ['INTEGER'], rows: 1000 },
];

// Prawdziwa baza działa w Web Workerze, którego jsdom nie ma – podmieniamy klienta.
vi.mock('../lib/sql/client', () => ({
  SqlClient: class {
    init() {
      return fake.initError ? Promise.reject(new Error(fake.initError)) : Promise.resolve(schema);
    }
    run(sql: string) {
      fake.queries.push(sql);
      return Promise.resolve(fake.outcome!);
    }
    reset() {
      fake.resets += 1;
    }
    dispose() {}
  },
}));

const routes = [
  { path: '/zadania/sql', element: <SqlTasksPage /> },
  { path: '/sql/:taskId', element: <SqlTaskPage /> },
];

beforeEach(() => {
  localStorage.clear();
  fake.outcome = null;
  fake.initError = null;
  fake.queries = [];
  fake.resets = 0;
});

afterEach(() => vi.restoreAllMocks());

const part = (number: string) =>
  screen.getByRole('heading', { name: `Zadanie ${number}` }).closest('section')!;

describe('SqlTasksPage', () => {
  it('pokazuje zadania z postępem', () => {
    localStorage.setItem(
      'matura-inf:sql:2026-maj-8',
      JSON.stringify({ parts: { '8.1': { passed: true }, '8.2': { passed: true } } }),
    );
    renderAt('/zadania/sql', routes);
    const card = screen.getAllByRole('link', { name: 'Sieć sklepów' })[0]!.closest('li')!;
    expect(within(card).getByText('Zaliczone: 2/4')).toBeInTheDocument();
  });
});

describe('SqlTaskPage', () => {
  it('pokazuje tabele bazy, uruchamia zapytanie i sprawdza wstawiony wynik', async () => {
    const user = userEvent.setup();
    fake.outcome = {
      results: [
        {
          columns: ['Plec', 'COUNT(*)'],
          rows: [
            ['K', 689],
            ['M', 651],
          ],
          truncated: false,
        },
      ],
      error: null,
      changes: 0,
    };
    renderAt('/sql/2026-maj-8', routes);
    expect(screen.getByRole('heading', { name: 'Sieć sklepów' })).toBeInTheDocument();
    const tables = await screen.findByRole('list', { name: 'Tabele w bazie' });
    expect(within(tables).getByText('klienci')).toBeInTheDocument();
    expect(within(tables).getByText('(2045 wierszy)')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Uruchom' }));
    expect(fake.queries[0]).toMatch(/FROM klienci/);
    const result = await screen.findByRole('region', { name: 'Wynik zapytania' });
    expect(within(result).getByText('2 wiersze')).toBeInTheDocument();
    expect(within(result).getByRole('cell', { name: '689' })).toBeInTheDocument();

    await user.click(within(part('8.2')).getByRole('button', { name: 'Wstaw z wyniku' }));
    expect(within(part('8.2')).getByText(/Wstawiono 2 wiersze/)).toBeInTheDocument();
    await user.click(within(part('8.2')).getByRole('button', { name: 'Sprawdź' }));
    expect(within(part('8.2')).getByText('Wszystko się zgadza!')).toBeInTheDocument();
    expect(screen.getByText(/Zaliczone: 1\/4 podpunktów · 2\/9 pkt/)).toBeInTheDocument();
    expect(loadSqlAnswers('2026-maj-8').parts['8.2']).toMatchObject({ passed: true });

    // Ten sam wynik nie pasuje do 8.1 – komunikat mówi, co jest nie tak.
    await user.click(within(part('8.1')).getByRole('button', { name: 'Wstaw z wyniku' }));
    await user.click(within(part('8.1')).getByRole('button', { name: 'Sprawdź' }));
    expect(
      within(part('8.1')).getByText('Lista: zgadza się 0 z 1 oczekiwanych wierszy, a lista ma 2.'),
    ).toBeInTheDocument();

    // Pola: wartości z wyniku trafiają do kolejnych pól.
    fake.outcome = {
      results: [{ columns: ['a', 'b'], rows: [[28, 19443.29]], truncated: false }],
      error: null,
      changes: 0,
    };
    await user.click(screen.getByRole('button', { name: 'Uruchom' }));
    await screen.findByRole('cell', { name: '19443.29' });
    await user.click(within(part('8.3')).getByRole('button', { name: 'Wstaw z wyniku' }));
    expect(within(part('8.3')).getByLabelText('Łączna kwota')).toHaveValue('19443.29');
    await user.click(within(part('8.3')).getByRole('button', { name: 'Sprawdź' }));
    expect(within(part('8.3')).getByText('Wszystko się zgadza!')).toBeInTheDocument();
  });

  it('pokazuje błąd zapytania i przykładowe rozwiązanie podpunktu pisanego na kartce', async () => {
    const user = userEvent.setup();
    fake.outcome = { results: [], error: 'no such table: klient', changes: 0 };
    renderAt('/sql/2026-maj-8', routes);
    await screen.findByRole('list', { name: 'Tabele w bazie' });
    await user.click(within(part('8.1')).getByRole('button', { name: 'Wstaw z wyniku' }));
    expect(within(part('8.1')).getByText(/Najpierw uruchom zapytanie/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Uruchom' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Błąd: no such table: klient');

    const written = part('8.5');
    expect(within(written).queryByRole('button', { name: 'Sprawdź' })).not.toBeInTheDocument();
    await user.click(within(written).getByText('Pokaż przykładowe rozwiązanie z klucza'));
    expect(within(written).getByText(/do ekspresu kolbowego/, { selector: 'code' })).toBeVisible();
  });

  it('wczytuje dane od nowa po potwierdzeniu i pamięta treść edytora', async () => {
    const user = userEvent.setup();
    localStorage.setItem('matura-inf:sql-zapytanie:2026-maj-8', 'SELECT 42;');
    fake.outcome = { results: [], error: null, changes: 3 };
    renderAt('/sql/2026-maj-8', routes);
    await screen.findByRole('list', { name: 'Tabele w bazie' });
    await user.click(screen.getByRole('button', { name: 'Uruchom' }));
    expect(fake.queries).toEqual(['SELECT 42;']);
    expect(
      await screen.findByText('Polecenie wykonane – zmienione wiersze: 3.'),
    ).toBeInTheDocument();

    vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    await user.click(screen.getByRole('button', { name: 'Wczytaj dane od nowa' }));
    expect(fake.resets).toBe(0);
    await user.click(screen.getByRole('button', { name: 'Wczytaj dane od nowa' }));
    expect(fake.resets).toBe(1);
    expect(screen.queryByText(/zmienione wiersze/)).not.toBeInTheDocument();
    expect(loadQuery('2026-maj-8')).toBe('SELECT 42;');
  });

  it('pokazuje błąd wczytywania bazy i stronę 404 dla nieznanego zadania', async () => {
    fake.initError = 'Nie udało się pobrać pliku x.';
    renderAt('/sql/2026-maj-8', routes);
    expect(await screen.findByRole('alert')).toHaveTextContent('Nie udało się pobrać pliku x.');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Uruchom' })).toBeDisabled());
  });

  it('nieznane zadanie to strona 404', () => {
    renderAt('/sql/nie-ma', routes);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /nie ma|404|Nie znaleziono/i,
    );
  });
});
