import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Console } from './Console';

const props = {
  output: '',
  error: null,
  running: false,
  stdin: '',
  onStdinChange: () => {},
  onClear: () => {},
};

describe('Console', () => {
  it('przed uruchomieniem pokazuje podpowiedź, a przycisk czyszczenia jest nieaktywny', () => {
    render(<Console {...props} />);
    expect(screen.getByRole('log')).toHaveTextContent(/pojawi się wynik print/);
    expect(screen.getByRole('button', { name: 'Wyczyść' })).toBeDisabled();
  });

  it('ostrzega, gdy kod używa input(), a wejście jest puste', () => {
    const { rerender } = render(<Console {...props} usesInput />);
    expect(screen.getByText(/Twój kod używa input\(\)/)).toBeInTheDocument();
    rerender(<Console {...props} usesInput stdin="4" />);
    expect(screen.queryByText(/Twój kod używa input\(\)/)).not.toBeInTheDocument();
  });

  it('przekazuje zmiany pola wejścia', async () => {
    const onStdinChange = vi.fn();
    render(<Console {...props} onStdinChange={onStdinChange} />);
    await userEvent.type(screen.getByLabelText('Wejście (stdin)'), '1');
    expect(onStdinChange).toHaveBeenCalledWith('1');
  });
});
