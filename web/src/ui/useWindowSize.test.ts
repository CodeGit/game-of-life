import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useWindowSize } from './useWindowSize';

const original = { width: window.innerWidth, height: window.innerHeight };

function resizeTo(width: number, height: number) {
  window.innerWidth = width;
  window.innerHeight = height;
  act(() => void window.dispatchEvent(new Event('resize')));
}

afterEach(() => {
  window.innerWidth = original.width;
  window.innerHeight = original.height;
  vi.restoreAllMocks();
});

describe('useWindowSize', () => {
  it('has the size of the window straight away, not zero', () => {
    window.innerWidth = 1234;
    window.innerHeight = 567;
    const { result } = renderHook(() => useWindowSize());
    expect(result.current).toEqual({ width: 1234, height: 567 });
  });

  it('follows the window as it is resized', () => {
    const { result } = renderHook(() => useWindowSize());
    resizeTo(800, 600);
    expect(result.current).toEqual({ width: 800, height: 600 });
    resizeTo(1400, 900);
    expect(result.current).toEqual({ width: 1400, height: 900 });
  });

  it('stops listening when it is unmounted', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useWindowSize());
    const added = add.mock.calls.find(([type]) => type === 'resize');
    expect(added).toBeDefined();
    unmount();
    expect(remove).toHaveBeenCalledWith('resize', added![1]);
  });
});
