import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { FileList } from './FileList';
import { PREVIEW_LINE_LIMIT } from './FilePreviewDialog';

const DATA = 'arkusze/2024/maj/pliki/liczby.txt';

beforeAll(() => {
  // jsdom nie implementuje modalnego <dialog> – minimalna atrapa.
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const stubFetch = (body: string, ok = true) => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(body, { status: ok ? 200 : 404 }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('FileList', () => {
  it('otwiera arkusze PDF w nowej karcie', () => {
    render(<FileList files={['arkusze/2024/maj/arkusz/arkusz.pdf']} />);
    const link = screen.getByRole('link', { name: 'arkusz.pdf' });
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('pokazuje plik z danymi w oknie z przyciskiem pobierania', async () => {
    const fetchMock = stubFetch('12\r\n7\r\n30\r\n');
    render(<FileList files={[DATA]} preview />);

    await userEvent.click(screen.getByRole('button', { name: 'liczby.txt' }));

    const dialog = screen.getByRole('dialog', { name: 'liczby.txt' });
    expect(dialog).toHaveProperty('open', true);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('liczby.txt'),
      expect.anything(),
    );
    expect(await screen.findByText(/12\s+7\s+30/)).toBeInTheDocument();
    expect(screen.getByText('3 linii')).toBeInTheDocument();

    const download = screen.getByRole('link', { name: 'Pobierz' });
    expect(download).toHaveAttribute('download', 'liczby.txt');
    expect(download.getAttribute('href')).toContain(DATA);

    await userEvent.click(screen.getByRole('button', { name: 'Zamknij' }));
    expect(dialog).toHaveProperty('open', false);
    expect(screen.queryByRole('link', { name: 'Pobierz' })).not.toBeInTheDocument();
  });

  it('skraca bardzo długie pliki', async () => {
    const lines = Array.from({ length: PREVIEW_LINE_LIMIT + 5 }, (_, i) => String(i));
    stubFetch(lines.join('\n'));
    render(<FileList files={[DATA]} preview />);

    await userEvent.click(screen.getByRole('button', { name: 'liczby.txt' }));

    expect(await screen.findByText(/Pokazano pierwsze/)).toBeInTheDocument();
    expect(screen.getByText(/2\s?005 linii/)).toBeInTheDocument();
  });

  it('informuje o błędzie wczytywania', async () => {
    stubFetch('', false);
    render(<FileList files={[DATA]} preview />);

    await userEvent.click(screen.getByRole('button', { name: 'liczby.txt' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('HTTP 404');
    expect(screen.getByRole('link', { name: 'Pobierz' })).toBeInTheDocument();
  });
});
