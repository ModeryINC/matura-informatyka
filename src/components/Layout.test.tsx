import { screen } from '@testing-library/react';
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
});
