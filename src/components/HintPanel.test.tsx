import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ProgramTask } from '../types';
import { HintPanel } from './HintPanel';
import { HintText } from './HintText';

const task: ProgramTask = {
  id: 't',
  sessionId: '2024/maj',
  number: '1.1',
  title: 'Zadanie',
  part: 2,
  points: 1,
  topics: ['napisy'],
  summary: 'Opis',
  starterCode: '',
  kind: 'program',
  checks: [{ label: 'P', files: { 'dane.txt': 'a.txt' }, expected: '1' }],
};

const reply = (text: string) =>
  new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }));

const renderPanel = (fetchImpl: typeof fetch, solved = false) =>
  render(
    <HintPanel
      config={{ endpoint: 'https://proxy.example/' }}
      task={task}
      code="print(0)"
      result={null}
      output={null}
      solved={solved}
      fetchImpl={fetchImpl}
    />,
  );

describe('HintPanel', () => {
  it('pobiera podpowiedź, a potem odlicza czas do następnej', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(reply('Zacznij od **wczytania** pliku.'));
    renderPanel(fetchImpl);

    await userEvent.click(screen.getByRole('button', { name: /Poproś o podpowiedź/ }));

    expect(await screen.findByText('wczytania')).toHaveProperty('tagName', 'STRONG');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /Kolejna podpowiedź/ })).toBeDisabled();
    expect(screen.getByText(/Następna podpowiedź za \d+ s/)).toBeInTheDocument();
  });

  it('po zaliczeniu zadania nie pozwala prosić o podpowiedź', async () => {
    const fetchImpl = vi.fn();
    renderPanel(fetchImpl, true);
    const button = screen.getByRole('button', { name: /podpowied/ });
    expect(button).toBeDisabled();
    expect(screen.getByText(/Zadanie zaliczone/)).toBeInTheDocument();
    await userEvent.click(button);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('pokazuje błąd usługi', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{}', { status: 429 }));
    renderPanel(fetchImpl);
    await userEvent.click(screen.getByRole('button', { name: /Poproś o podpowiedź/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/limit zapytań/);
  });

  it('po wyczerpaniu dziennego limitu blokuje przycisk', () => {
    const day = new Date().toISOString().slice(0, 10);
    localStorage.setItem('matura-inf:ai-usage', JSON.stringify({ day, count: 999, last: 0 }));
    renderPanel(vi.fn());
    expect(screen.getByRole('button', { name: /Poproś o podpowiedź/ })).toBeDisabled();
    expect(screen.getByText(/dzisiejszy limit/)).toBeInTheDocument();
  });
});

describe('HintText', () => {
  it('formatuje kod, listy i bloki kodu bez wstrzykiwania HTML', () => {
    const { container } = render(
      <HintText
        text={
          'Użyj `sorted`.\n\n- pierwszy\n- **drugi**\n\n```python\nfor x in t:\n    print(x)\n```\n<b>nie</b>'
        }
      />,
    );
    expect(screen.getByText('sorted').tagName).toBe('CODE');
    expect(container.querySelectorAll('li')).toHaveLength(2);
    expect(container.querySelector('pre')?.textContent).toBe('for x in t:\n    print(x)');
    expect(container.querySelector('b')).toBeNull();
    expect(screen.getByText('<b>nie</b>')).toBeInTheDocument();
  });
});
