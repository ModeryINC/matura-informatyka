import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { sessions, tasks } from '../data';
import { saveSolution } from '../lib/storage';
import { renderAt } from '../../tests/render';
import { routes } from '../routes';

function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({ matches: reduce && query.includes('reduce'), media: query })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('strona startowa', () => {
  it('ma hero z przyciskami i statystykami oraz karty działów', () => {
    renderAt('/', routes);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Matura z informatyki bez instalowania czegokolwiek',
    );
    expect(screen.getByRole('link', { name: 'Zacznij rozwiązywać' })).toHaveAttribute(
      'href',
      '/zadania/python',
    );
    expect(screen.getByRole('link', { name: 'Przeglądaj arkusze' })).toHaveAttribute(
      'href',
      '/arkusze',
    );
    expect(screen.getByText('zadań w Pythonie').nextSibling).toHaveTextContent(
      String(tasks.length),
    );
    expect(screen.getByText('arkuszy').nextSibling).toHaveTextContent(String(sessions.length));

    const features = screen.getByRole('region', { name: 'Co tu znajdziesz' });
    expect(within(features).getByRole('link', { name: 'SQL' })).toHaveAttribute(
      'href',
      '/zadania/sql',
    );
    expect(within(features).getByText('wkrótce')).toBeInTheDocument();
  });

  it('pokazuje postęp, gdy są zaliczone zadania', () => {
    saveSolution(tasks[0]!.id, {
      code: 'x',
      lastResult: { passed: true, results: [], durationMs: 1 },
    });
    renderAt('/', routes);
    expect(screen.getByRole('link', { name: 'Wróć do zadań' })).toBeInTheDocument();
    expect(screen.getByText('zaliczonych przez Ciebie').nextSibling).toHaveTextContent('1');
  });

  it('animacja pisze kod, pokazuje wynik i daje się zatrzymać', async () => {
    mockReducedMotion(false);
    vi.useFakeTimers();
    renderAt('/', routes);
    const window = screen.getByRole('figure');
    expect(window.querySelector('code')).toHaveTextContent('');

    act(() => vi.advanceTimersByTime(45 * 30));
    expect(window.querySelector('code')!.textContent).toMatch(/^dni = 0\nwith open/);

    // Po napisaniu całego kodu: wynik i oba testy.
    act(() => vi.advanceTimersByTime(45 * 200));
    expect(within(window).getByText('Klucz CKE: 19')).toHaveClass('is-visible');

    // Następna scena: Excel.
    act(() => vi.advanceTimersByTime(45 * 60));
    expect(within(window).getByText('Excel')).toBeInTheDocument();

    vi.useRealTimers();
    const pause = screen.getByRole('button', { name: /Zatrzymaj animację/ });
    await userEvent.click(pause);
    expect(screen.getByRole('button', { name: /Wznów animację/ })).toBeInTheDocument();
    expect(document.querySelector('.hero-demo')).toHaveAttribute('data-paused', 'true');
  });

  it('przy ograniczeniu ruchu pokazuje od razu stan końcowy bez przycisku pauzy', () => {
    mockReducedMotion(true);
    renderAt('/', routes);
    const window = screen.getByRole('figure');
    expect(window.querySelector('code')).toHaveTextContent('print(dni)');
    expect(within(window).getByText('Klucz CKE: 19')).toHaveClass('is-visible');
    expect(screen.queryByRole('button', { name: /animację/ })).not.toBeInTheDocument();
  });
});

describe('nawigacja i zakładka „Zadania”', () => {
  it('„Zadania” przekierowuje do Pythona i oznacza aktywne zakładki', () => {
    const { router } = renderAt('/zadania', routes);
    expect(router.state.location.pathname).toBe('/zadania/python');
    const main = screen.getByRole('navigation', { name: 'Główna nawigacja' });
    expect(within(main).getByRole('link', { name: 'Zadania' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    const tabs = screen.getByRole('navigation', { name: 'Rodzaj zadań' });
    expect(within(tabs).getByRole('link', { name: /Python/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(tabs).getByRole('link', { name: /SQL/ })).toHaveTextContent('wkrótce');
  });

  it('zakładka SQL to zapowiedź', () => {
    renderAt('/zadania/sql', routes);
    expect(
      screen.getByRole('heading', { name: 'Zadania z SQL – już wkrótce' }),
    ).toBeInTheDocument();
  });

  it('stary adres /excel prowadzi do zakładki Excel', () => {
    const { router } = renderAt('/excel', routes);
    expect(router.state.location.pathname).toBe('/zadania/excel');
    expect(
      screen.getByRole('heading', { name: 'Zadania z arkusza kalkulacyjnego' }),
    ).toBeInTheDocument();
  });

  it('„Zadania” są aktywne na stronie pojedynczego zadania', () => {
    renderAt(`/zadanie/${tasks[0]!.id}`, routes);
    const main = screen.getByRole('navigation', { name: 'Główna nawigacja' });
    expect(within(main).getByRole('link', { name: 'Zadania' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(main).queryByRole('link', { name: 'Python' })).not.toBeInTheDocument();
  });
});
