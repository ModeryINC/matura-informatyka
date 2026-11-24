import { render, screen } from '@testing-library/react';
import { App } from './App';

test('renderuje nagłówek', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Matura z informatyki');
});
