import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRunLoop } from './useRunLoop';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('useRunLoop', () => {
  it('does not tick while it is not running', () => {
    const onTick = vi.fn();
    renderHook(() => useRunLoop(false, 100, onTick));
    vi.advanceTimersByTime(1000);
    expect(onTick).not.toHaveBeenCalled();
  });

  it('ticks once per delay while running', () => {
    const onTick = vi.fn();
    renderHook(() => useRunLoop(true, 100, onTick));
    vi.advanceTimersByTime(99);
    expect(onTick).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onTick).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(300);
    expect(onTick).toHaveBeenCalledTimes(4);
  });

  it('stops when running goes false, and starts again when it goes true', () => {
    const onTick = vi.fn();
    const { rerender } = renderHook(({ running }) => useRunLoop(running, 100, onTick), {
      initialProps: { running: true },
    });
    vi.advanceTimersByTime(200);
    expect(onTick).toHaveBeenCalledTimes(2);
    rerender({ running: false });
    vi.advanceTimersByTime(1000);
    expect(onTick).toHaveBeenCalledTimes(2);
    rerender({ running: true });
    vi.advanceTimersByTime(100);
    expect(onTick).toHaveBeenCalledTimes(3);
  });

  it('changes pace when the delay changes', () => {
    const onTick = vi.fn();
    const { rerender } = renderHook(({ delay }) => useRunLoop(true, delay, onTick), {
      initialProps: { delay: 100 },
    });
    vi.advanceTimersByTime(100);
    expect(onTick).toHaveBeenCalledTimes(1);
    rerender({ delay: 500 });
    vi.advanceTimersByTime(499);
    expect(onTick).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(onTick).toHaveBeenCalledTimes(2);
  });

  it('always calls the newest tick function, without restarting the timer', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ onTick }) => useRunLoop(true, 100, onTick), {
      initialProps: { onTick: first },
    });
    vi.advanceTimersByTime(50);
    rerender({ onTick: second });
    vi.advanceTimersByTime(50); // 100 ms since the start, so one tick is due now
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('stops ticking when it is unmounted', () => {
    const onTick = vi.fn();
    const { unmount } = renderHook(() => useRunLoop(true, 100, onTick));
    unmount();
    vi.advanceTimersByTime(1000);
    expect(onTick).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
