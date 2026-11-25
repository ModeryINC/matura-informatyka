import { atEdge, chainScroll, wheelPixels } from './scrollChain';

const box = (scrollTop: number, scrollHeight = 1000, clientHeight = 200) => ({
  scrollTop,
  scrollHeight,
  clientHeight,
});

describe('atEdge', () => {
  it('rozpoznaje górną i dolną krawędź', () => {
    expect(atEdge(box(0), -10)).toBe(true);
    expect(atEdge(box(0), 10)).toBe(false);
    expect(atEdge(box(800), 10)).toBe(true);
    expect(atEdge(box(799.5), 10)).toBe(true);
    expect(atEdge(box(400), -10)).toBe(false);
  });

  it('obszar bez przewijania jest zawsze na krawędzi; brak obszaru lub ruchu – nie', () => {
    expect(atEdge(box(0, 100, 200), 10)).toBe(true);
    expect(atEdge(null, 10)).toBe(false);
    expect(atEdge(box(0), 0)).toBe(false);
  });
});

test('wheelPixels przelicza linie i strony na piksele', () => {
  expect(wheelPixels({ deltaY: 3, deltaMode: 0 }, 800)).toBe(3);
  expect(wheelPixels({ deltaY: 3, deltaMode: 1 }, 800)).toBe(48);
  expect(wheelPixels({ deltaY: 1, deltaMode: 2 }, 800)).toBe(800);
});

describe('chainScroll', () => {
  function setup(scrollTop: number) {
    const container = document.createElement('div');
    const inner = document.createElement('div');
    container.append(inner);
    document.body.append(container);
    const win = { scrollBy: vi.fn(), innerHeight: 800 };
    const detach = chainScroll(container, () => box(scrollTop), win as unknown as Window);
    return { inner, win, detach };
  }

  const wheel = (init: WheelEventInit) => new WheelEvent('wheel', { bubbles: true, ...init });
  const touch = (type: string, y: number) =>
    Object.assign(new Event(type, { bubbles: true }), { touches: [{ clientY: y }] });

  it('kółkiem na krawędzi przewija stronę, w środku – nie', () => {
    const top = setup(0);
    top.inner.dispatchEvent(wheel({ deltaY: -50 }));
    expect(top.win.scrollBy).toHaveBeenCalledWith({ top: -50 });
    top.inner.dispatchEvent(wheel({ deltaY: 50 }));
    expect(top.win.scrollBy).toHaveBeenCalledTimes(1);
  });

  it('pomija ruch poziomy i Ctrl+kółko, a po odpięciu nie reaguje', () => {
    const { inner, win, detach } = setup(0);
    inner.dispatchEvent(wheel({ deltaY: -10, deltaX: -50 }));
    inner.dispatchEvent(wheel({ deltaY: -50, ctrlKey: true }));
    expect(win.scrollBy).not.toHaveBeenCalled();
    detach();
    inner.dispatchEvent(wheel({ deltaY: -50 }));
    expect(win.scrollBy).not.toHaveBeenCalled();
  });

  it('przesunięcie palcem na krawędzi przewija stronę', () => {
    const { inner, win } = setup(800);
    inner.dispatchEvent(touch('touchstart', 300));
    inner.dispatchEvent(touch('touchmove', 260));
    expect(win.scrollBy).toHaveBeenCalledWith({ top: 40 });
    // Ruch w górę od dolnej krawędzi przewija arkusz, nie stronę.
    inner.dispatchEvent(touch('touchmove', 300));
    expect(win.scrollBy).toHaveBeenCalledTimes(1);
    inner.dispatchEvent(new Event('touchend', { bubbles: true }));
    inner.dispatchEvent(touch('touchmove', 200));
    expect(win.scrollBy).toHaveBeenCalledTimes(1);
  });
});
