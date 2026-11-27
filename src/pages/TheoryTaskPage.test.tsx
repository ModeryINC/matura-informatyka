import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { theoryTasksById } from '../data/theory';
import { loadTheoryAnswers } from '../lib/theory/storage';
import { renderAt } from '../../tests/render';
import { routes } from '../routes';

const task = theoryTasksById.get('2018-czerwiec-3')!;

async function answer(card: HTMLElement, letters: string) {
  const groups = within(card).getAllByRole('group');
  for (const [i, letter] of [...letters].entries())
    await userEvent.click(within(groups[i]!).getByRole('radio', { name: letter }));
}

describe('zadania testowe', () => {
  afterEach(() => localStorage.clear());

  it('lista ma zakładkę „Test” i karty zadań', () => {
    renderAt('/zadania/test', routes);
    const tabs = screen.getByRole('navigation', { name: 'Rodzaj zadań' });
    expect(within(tabs).getByRole('link', { name: /Test/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: /Rozwiąż losowy test/ })).toBeInTheDocument();
  });

  it('sprawdza komplet odpowiedzi P/F i zapisuje zaliczenie', async () => {
    renderAt(`/test/${task.id}`, routes);
    const card = screen.getByRole('article', { name: 'Zadanie 3.1' });
    const check = within(card).getByRole('button', { name: /Sprawdź/ });
    expect(check).toBeDisabled();

    // Jedna błędna odpowiedź – brak punktu, można podejrzeć klucz.
    await answer(card, 'PFFF');
    await userEvent.click(check);
    expect(within(card).getByRole('status')).toHaveTextContent('Poprawnie: 3 z 4');
    await userEvent.click(within(card).getByRole('button', { name: /Pokaż klucz/ }));
    expect(within(card).getAllByText(/klucz: prawda/)).toHaveLength(2);

    await answer(card, task.parts[0]!.answers);
    await userEvent.click(check);
    expect(within(card).getByRole('status')).toHaveTextContent('komplet poprawnych odpowiedzi');
    expect(loadTheoryAnswers(task.id).parts['3.1']?.passed).toBe(true);
    expect(screen.getByText(/Zaliczone: 1\/4/)).toBeInTheDocument();
  });

  it('losowy test ma 10 podpunktów i liczy wynik', async () => {
    renderAt('/test/losowy', routes);
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(10);
    expect(screen.getByText(/Wynik: 0\/10 pkt/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Wylosuj nowy test/ }));
    expect(screen.getAllByRole('article')).toHaveLength(10);
  });
});
