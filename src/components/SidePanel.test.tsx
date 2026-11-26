import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidePanel } from './SidePanel';

function mockWide(wide: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: wide && query.includes('min-width'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

const renderPanel = () =>
  render(
    <SidePanel title="Odpowiedzi" badge="1/4">
      <p>Podpunkty</p>
    </SidePanel>,
  );

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('SidePanel', () => {
  it('na węższym ekranie wysuwa się z boku i chowa (także Esc)', async () => {
    mockWide(false);
    renderPanel();
    const panel = screen.getByRole('complementary', { name: 'Odpowiedzi' });
    expect(panel).toHaveClass('side-panel--drawer');
    expect(panel).not.toHaveAttribute('data-open');
    expect(screen.getByText('Podpunkty').closest('[inert]')).not.toBeNull();

    const toggle = screen.getByRole('button', { name: /Odpowiedzi.*1\/4/ });
    await userEvent.click(toggle);
    expect(panel).toHaveAttribute('data-open');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Podpunkty').closest('[inert]')).toBeNull();

    await userEvent.keyboard('{Escape}');
    expect(panel).not.toHaveAttribute('data-open');
  });

  it('na szerokim ekranie stoi obok i zapamiętuje zwinięcie', async () => {
    mockWide(true);
    const { unmount } = renderPanel();
    const panel = screen.getByRole('complementary', { name: 'Odpowiedzi' });
    expect(panel).toHaveClass('side-panel--docked');
    expect(panel).toHaveAttribute('data-open');

    await userEvent.click(screen.getByRole('button', { name: /Odpowiedzi.*1\/4/ }));
    expect(panel).not.toHaveAttribute('data-open');
    unmount();

    renderPanel();
    expect(screen.getByRole('complementary', { name: 'Odpowiedzi' })).not.toHaveAttribute(
      'data-open',
    );
  });
});
