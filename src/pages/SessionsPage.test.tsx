import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { sessions } from '../data';

// Wszystkie sesje mają już zadania – do testu pustej sesji podmieniamy jedną z nich.
const PUSTA = '2021/probna-Politechnika-Lodzka-pazdziernik';
vi.mock('../data', async (importOriginal) => {
  const original = await importOriginal<typeof import('../data')>();
  return {
    ...original,
    tasksForSession: (id: string) => (id === PUSTA ? [] : original.tasksForSession(id)),
  };
});
import { renderAt } from '../../tests/render';
import { routes } from '../routes';

describe('SessionsPage i SessionPage', () => {
  it('grupuje arkusze według lat i filtruje rodzaj sesji', async () => {
    renderAt('/arkusze', routes);
    const years = new Set(sessions.map((s) => s.year));
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(years.size);
    await userEvent.click(screen.getByRole('button', { name: 'Próbna' }));
    const probne = sessions.filter((s) => s.kind === 'probna').length;
    expect(
      screen.getAllByRole('listitem').filter((li) => li.className === 'session-card'),
    ).toHaveLength(probne);
  });

  it('strona sesji pokazuje pliki i zadania', () => {
    renderAt('/arkusze/2024/maj', routes);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Maj 2024');
    expect(screen.getByRole('heading', { name: 'Klucz odpowiedzi' })).toBeInTheDocument();
    expect(screen.getByTitle(/Arkusz Maj 2024/)).toBeInTheDocument();
    const jump = screen.getByRole('navigation', { name: 'Zadania z tego arkusza' });
    expect(within(jump).getByRole('link', { name: /^3\.1/ })).toHaveAttribute(
      'href',
      '/zadanie/2024-maj-3.1',
    );
    expect(within(jump).getByRole('link', { name: /7 · Excel/ })).toHaveAttribute(
      'href',
      '/excel/2024-maj-7',
    );
  });

  it('sesja bez zadań informuje o tym', () => {
    renderAt(`/arkusze/${PUSTA}`, routes);
    expect(screen.getByText(/nie ma jeszcze zadań ze sprawdzarką/)).toBeInTheDocument();
  });

  it('nieznany adres daje stronę 404', () => {
    renderAt('/cos-innego', routes);
    expect(screen.getByRole('heading', { name: 'Nie znaleziono strony' })).toBeInTheDocument();
  });
});
