import { renderHook } from '@testing-library/react';
import { canPreload, usePreload } from './preload';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('ładowanie w tle', () => {
  it('nie ładuje bez workerów ani w trybie oszczędzania danych', () => {
    vi.stubGlobal('Worker', undefined);
    expect(canPreload()).toBe(false);
    vi.stubGlobal('Worker', class {});
    expect(canPreload()).toBe(true);
    vi.stubGlobal('navigator', { connection: { saveData: true } });
    expect(canPreload()).toBe(false);
  });

  it('wywołuje ładowanie, gdy przeglądarka jest bezczynna, i pomija błędy', () => {
    vi.useFakeTimers();
    vi.stubGlobal('Worker', class {});
    vi.stubGlobal('requestIdleCallback', undefined);
    const load = vi.fn(() => Promise.reject(new Error('offline')));
    const { unmount } = renderHook(() => usePreload(load));
    expect(load).not.toHaveBeenCalled();
    vi.advanceTimersByTime(500);
    expect(load).toHaveBeenCalledTimes(1);
    unmount();

    const cancelled = vi.fn();
    renderHook(() => usePreload(cancelled)).unmount();
    vi.advanceTimersByTime(500);
    expect(cancelled).not.toHaveBeenCalled();
  });
});
