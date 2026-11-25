import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderAt } from '../../tests/render';
import { routes } from '../routes';

describe('Layout', () => {
  it('ma link pomijający nawigację i oznacza aktywną stronę', () => {
    renderAt('/pomoc', routes);
    expect(screen.getByRole('link', { name: 'Przejdź do treści' })).toHaveAttribute(
      'href',
      '#tresc',
    );
    expect(screen.getByRole('link', { name: 'Pomoc' })).toHaveAttribute('aria-current', 'page');
    expect(document.title).toBe('Pomoc · Matura z informatyki');
  });

  it('przełącza motyw: systemowy → jasny → ciemny → systemowy', async () => {
    renderAt('/pomoc', routes);
    const button = screen.getByRole('button', { name: /Motyw/ });
    await userEvent.click(button);
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    await userEvent.click(button);
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('matura-inf:theme')).toBe('dark');
    await userEvent.click(button);
    expect(document.documentElement).not.toHaveAttribute('data-theme');
  });

  it('zmienia motyw z animacją rozlewania od przycisku (View Transitions)', async () => {
    let update: (() => void | Promise<void>) | undefined;
    let finish!: () => void;
    const startViewTransition = vi.fn((callback: () => void) => {
      update = callback;
      return { finished: new Promise<void>((resolve) => (finish = resolve)) };
    });
    Object.assign(document, { startViewTransition });
    try {
      renderAt('/pomoc', routes);
      await userEvent.click(screen.getByRole('button', { name: /Motyw/ }));
      const root = document.documentElement;
      expect(startViewTransition).toHaveBeenCalledTimes(1);
      expect(root).toHaveClass('theme-transition');
      expect(root.style.getPropertyValue('--theme-r')).toMatch(/px$/);

      act(() => void update?.());
      expect(root).toHaveAttribute('data-theme', 'light');
      await act(async () => finish());
      expect(root).not.toHaveClass('theme-transition');
    } finally {
      Reflect.deleteProperty(document, 'startViewTransition');
      document.documentElement.removeAttribute('data-theme');
      localStorage.clear();
    }
  });

  it('po przejściu na inną stronę przenosi fokus na treść', async () => {
    renderAt('/pomoc', routes);
    await userEvent.click(screen.getByRole('link', { name: 'Arkusze' }));
    expect(document.activeElement).toHaveAttribute('id', 'tresc');
  });
});
