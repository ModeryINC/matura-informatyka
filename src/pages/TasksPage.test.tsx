import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { tasks } from '../data';
import { saveSolution } from '../lib/storage';
import { renderAt } from '../../tests/render';
import { routes } from '../routes';

describe('TasksPage', () => {
  it('wyświetla wszystkie zadania i postęp', () => {
    renderAt('/zadania/python', routes);
    expect(screen.getByRole('heading', { level: 1, name: 'Zadania' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Zadania w Pythonie' }),
    ).toBeInTheDocument();
    const list = screen.getByRole('heading', { name: /Wszystkie zadania/ }).parentElement!;
    expect(within(list).getAllByRole('article')).toHaveLength(tasks.length);
    expect(screen.getByText(/Zaliczone:/)).toHaveTextContent(`Zaliczone: 0 z ${tasks.length}`);
  });

  it('filtruje po temacie i zapisuje filtr w adresie', async () => {
    const { router } = renderAt('/zadania/python', routes);
    await userEvent.click(screen.getByRole('button', { name: /^Rekurencja/ }));
    const expected = tasks.filter((t) => t.topics.includes('rekurencja')).length;
    expect(screen.getByRole('heading', { name: /Wyniki wyszukiwania/ })).toHaveTextContent(
      `(${expected})`,
    );
    expect(router.state.location.search).toBe('?tematy=rekurencja');
  });

  it('odczytuje filtry z adresu i pokazuje komunikat, gdy nic nie pasuje', () => {
    renderAt('/zadania/python?q=zzzzzz-nie-ma-takiego', routes);
    expect(screen.getByText(/Brak zadań spełniających kryteria/)).toBeInTheDocument();
  });

  it('uwzględnia status zapisany w przeglądarce', () => {
    const task = tasks[0]!;
    saveSolution(task.id, { code: 'x', lastResult: { passed: true, results: [], durationMs: 1 } });
    renderAt('/zadania/python?status=zaliczone', routes);
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByText(/Zaliczone:/)).toHaveTextContent(`Zaliczone: 1 z ${tasks.length}`);
  });
});

describe('TasksPage na telefonie', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: query.includes('max-width'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('wyszukiwarka wysuwa się z prawej i pokazuje liczbę aktywnych filtrów', async () => {
    renderAt('/zadania/python?tematy=rekurencja', routes);
    const panel = screen.getByRole('complementary', { name: 'Szukaj' });
    expect(panel).toHaveClass('side-panel--drawer');
    expect(panel).not.toHaveAttribute('data-open');

    const toggle = within(panel).getByRole('button', { name: /^Szukaj\s*1$/ });
    await userEvent.click(toggle);
    expect(panel).toHaveAttribute('data-open');
    expect(within(panel).getByRole('searchbox')).toBeInTheDocument();

    const expected = tasks.filter((t) => t.topics.includes('rekurencja')).length;
    await userEvent.click(
      within(panel).getByRole('button', { name: `Pokaż zadania (${expected})` }),
    );
    expect(panel).not.toHaveAttribute('data-open');
  });
});
