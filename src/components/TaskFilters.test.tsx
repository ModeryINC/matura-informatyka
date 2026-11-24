import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { EMPTY_FILTERS, type TaskFilters as Filters } from '../lib/search';
import { renderWithRouter } from '../../tests/render';
import { TaskFilters } from './TaskFilters';

function Harness({ onChange }: { onChange: (f: Filters) => void }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  return (
    <TaskFilters
      filters={filters}
      onChange={(next) => {
        setFilters(next);
        onChange(next);
      }}
      topicCounts={
        new Map([
          ['rekurencja', 3],
          ['sortowanie', 1],
        ])
      }
      years={[2025, 2024]}
    />
  );
}

describe('TaskFilters', () => {
  it('pokazuje tylko tematy, dla których są zadania, z liczbą zadań', () => {
    renderWithRouter(<Harness onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /Rekurencja 3/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Geometria/ })).not.toBeInTheDocument();
  });

  it('przełącza temat i oznacza go jako wciśnięty', async () => {
    const onChange = vi.fn();
    renderWithRouter(<Harness onChange={onChange} />);
    const chip = screen.getByRole('button', { name: /Rekurencja/ });
    await userEvent.click(chip);
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    expect(onChange).toHaveBeenLastCalledWith({ ...EMPTY_FILTERS, topics: ['rekurencja'] });
    await userEvent.click(chip);
    expect(onChange).toHaveBeenLastCalledWith(EMPTY_FILTERS);
  });

  it('aktualizuje frazę, rok i część oraz pozwala wyczyścić filtry', async () => {
    const onChange = vi.fn();
    renderWithRouter(<Harness onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Szukaj'), { target: { value: 'pierwsze' } });
    await userEvent.selectOptions(screen.getByLabelText('Rok'), '2024');
    await userEvent.selectOptions(screen.getByLabelText('Część'), '2');
    expect(onChange).toHaveBeenLastCalledWith({
      ...EMPTY_FILTERS,
      query: 'pierwsze',
      years: [2024],
      part: 2,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Wyczyść filtry' }));
    expect(onChange).toHaveBeenLastCalledWith(EMPTY_FILTERS);
    expect(screen.queryByRole('button', { name: 'Wyczyść filtry' })).not.toBeInTheDocument();
  });
});
