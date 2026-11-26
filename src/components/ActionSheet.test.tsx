import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionSheet } from './ActionSheet';

function touch(target: Element, type: string, y: number, timeStamp: number) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'touches', {
    value: type === 'touchend' ? [] : [{ clientY: y }],
  });
  Object.defineProperty(event, 'timeStamp', { value: timeStamp });
  fireEvent(target, event);
}

const renderSheet = (onClose = vi.fn()) => {
  render(
    <ActionSheet open onClose={onClose} label="Konsola">
      <p>Treść</p>
    </ActionSheet>,
  );
  const dialog = screen.getByRole('dialog', { name: 'Konsola' });
  // Połowa ekranu – 400 px, cały ekran – wysokość okna.
  vi.spyOn(dialog, 'getBoundingClientRect').mockImplementation(
    () =>
      ({
        height: dialog.dataset.size === 'full' ? window.innerHeight : 400,
      }) as DOMRect,
  );
  return { dialog, onClose };
};

describe('ActionSheet', () => {
  it('rozciąga się na cały ekran przyciskiem i wraca do połowy', async () => {
    const { dialog } = renderSheet();
    expect(dialog).toHaveAttribute('data-size', 'half');
    await userEvent.click(screen.getByRole('button', { name: 'Rozciągnij na cały ekran' }));
    expect(dialog).toHaveAttribute('data-size', 'full');
    await userEvent.click(screen.getByRole('button', { name: 'Zmniejsz panel' }));
    expect(dialog).toHaveAttribute('data-size', 'half');
  });

  it('przeciągnięcie w górę rozciąga panel, w dół – zmniejsza, a potem zamyka', () => {
    const { dialog, onClose } = renderSheet();
    const text = screen.getByText('Treść');

    touch(text, 'touchstart', 500, 0);
    touch(text, 'touchmove', 200, 100);
    touch(text, 'touchend', 200, 400);
    expect(dialog).toHaveAttribute('data-size', 'full');

    touch(text, 'touchstart', 100, 1000);
    touch(text, 'touchmove', 450, 1100);
    touch(text, 'touchend', 450, 1300);
    expect(dialog).toHaveAttribute('data-size', 'half');
    expect(onClose).not.toHaveBeenCalled();

    touch(text, 'touchstart', 100, 2000);
    touch(text, 'touchmove', 350, 2100);
    touch(text, 'touchend', 350, 2400);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('nie przeciąga, gdy treść jest przewinięta w dół – wtedy przewija się treść', () => {
    const { dialog, onClose } = renderSheet();
    const content = dialog.querySelector('.action-sheet__content')!;
    content.scrollTop = 50;
    touch(content, 'touchstart', 100, 0);
    touch(content, 'touchmove', 400, 100);
    touch(content, 'touchend', 400, 200);
    expect(onClose).not.toHaveBeenCalled();
    expect(dialog).toHaveAttribute('data-size', 'half');
  });
});
