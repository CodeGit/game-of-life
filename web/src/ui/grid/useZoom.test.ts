import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_COLS, DEFAULT_ROWS } from '@/engine/defaults';
import { createWorld } from '@/engine/world';
import { boardSpace } from '@/ui/layout';
import { useZoom } from './useZoom';
import { MAX_CELL_SIZE, MIN_CELL_SIZE, fitSizeCell } from './zoom';

const original = { width: window.innerWidth, height: window.innerHeight };

function setWindowSize(width: number, height: number) {
  window.innerWidth = width;
  window.innerHeight = height;
  act(() => void window.dispatchEvent(new Event('resize')));
}

// What fitting a board to a window of this size should give.
function fittedTo(rows: number, cols: number, windowWidth = 1000, windowHeight = 700) {
  const space = boardSpace(windowWidth, windowHeight);
  return fitSizeCell({ rows, cols, width: space.width, height: space.height });
}

const board = (rows: number, cols: number) =>
  createWorld({ id: 'test', rows, cols, wrap: false, age: false });

beforeEach(() => setWindowSize(1000, 700));
afterEach(() => setWindowSize(original.width, original.height));

describe('useZoom: fitting', () => {
  it('fits a board of the default size when there is no game', () => {
    const { result } = renderHook(() => useZoom(null));
    expect(result.current.cellSize).toBe(fittedTo(DEFAULT_ROWS, DEFAULT_COLS));
  });

  it('starts by fitting the board to the window', () => {
    const { result } = renderHook(() => useZoom(board(20, 20)));
    expect(result.current.cellSize).toBe(fittedTo(20, 20));
    expect(result.current.isFit).toBe(true);
  });

  it('fits a wide board by its width, and a tall one by its height', () => {
    const wide = renderHook(() => useZoom(board(10, 100)));
    const tall = renderHook(() => useZoom(board(100, 10)));
    expect(wide.result.current.cellSize).toBe(fittedTo(10, 100));
    expect(tall.result.current.cellSize).toBe(fittedTo(100, 10));
    expect(wide.result.current.cellSize).not.toBe(tall.result.current.cellSize);
  });

  it('fits again when the window changes size', () => {
    const { result } = renderHook(() => useZoom(board(20, 20)));
    const before = result.current.cellSize;
    setWindowSize(1400, 1000);
    expect(result.current.cellSize).toBe(fittedTo(20, 20, 1400, 1000));
    expect(result.current.cellSize).toBeGreaterThan(before);
  });

  it('fits a different board when the game changes', () => {
    const { result, rerender } = renderHook(({ world }) => useZoom(world), {
      initialProps: { world: board(20, 20) },
    });
    rerender({ world: board(10, 100) });
    expect(result.current.cellSize).toBe(fittedTo(10, 100));
  });

  it('says how much width the board has', () => {
    const { result } = renderHook(() => useZoom(null));
    expect(result.current.availableWidth).toBe(boardSpace(1000, 700).width);
  });
});

describe('useZoom: zooming', () => {
  it('zooms in to a bigger size, and is no longer fitted', () => {
    const { result } = renderHook(() => useZoom(board(20, 20)));
    const fitted = result.current.cellSize;
    act(() => result.current.zoomIn());
    expect(result.current.cellSize).toBeGreaterThan(fitted);
    expect(result.current.isFit).toBe(false);
  });

  it('zooms out to a smaller size, and is no longer fitted', () => {
    const { result } = renderHook(() => useZoom(board(20, 20)));
    const fitted = result.current.cellSize;
    act(() => result.current.zoomOut());
    expect(result.current.cellSize).toBeLessThan(fitted);
    expect(result.current.isFit).toBe(false);
  });

  it('zooms from the size on screen, so in and then out comes back near where it began', () => {
    const { result } = renderHook(() => useZoom(board(20, 20)));
    const fitted = result.current.cellSize;
    act(() => result.current.zoomIn());
    act(() => result.current.zoomOut());
    expect(result.current.cellSize).toBeLessThanOrEqual(fitted);
    expect(result.current.cellSize).toBeGreaterThan(fitted - 5);
  });

  it('keeps a chosen size when the window changes', () => {
    const { result } = renderHook(() => useZoom(board(20, 20)));
    act(() => result.current.zoomIn());
    const chosen = result.current.cellSize;
    setWindowSize(1400, 1000);
    expect(result.current.cellSize).toBe(chosen);
  });

  it('goes back to fitting the window with fit()', () => {
    const { result } = renderHook(() => useZoom(board(20, 20)));
    const fitted = result.current.cellSize;
    act(() => result.current.zoomIn());
    act(() => result.current.fit());
    expect(result.current.cellSize).toBe(fitted);
    expect(result.current.isFit).toBe(true);
  });

  it('fits to the new window after fit(), not to the old one', () => {
    const { result } = renderHook(() => useZoom(board(20, 20)));
    act(() => result.current.zoomIn());
    setWindowSize(1400, 1000);
    act(() => result.current.fit());
    expect(result.current.cellSize).toBe(fittedTo(20, 20, 1400, 1000));
  });
});

describe('useZoom: the ends', () => {
  it('cannot zoom in past the biggest size', () => {
    const { result } = renderHook(() => useZoom(board(3, 3))); // so small it fits at the maximum
    expect(result.current.cellSize).toBe(MAX_CELL_SIZE);
    expect(result.current.canZoomIn).toBe(false);
    act(() => result.current.zoomIn());
    expect(result.current.cellSize).toBe(MAX_CELL_SIZE);
  });

  it('cannot zoom out past the smallest size', () => {
    const { result } = renderHook(() => useZoom(board(500, 500))); // too big to fit at all
    expect(result.current.cellSize).toBe(MIN_CELL_SIZE);
    expect(result.current.canZoomOut).toBe(false);
    act(() => result.current.zoomOut());
    expect(result.current.cellSize).toBe(MIN_CELL_SIZE);
  });

  it('can zoom either way from a size in between', () => {
    const { result } = renderHook(() => useZoom(board(20, 20)));
    expect(result.current.canZoomIn).toBe(true);
    expect(result.current.canZoomOut).toBe(true);
  });

  it('reaches the biggest size by zooming in, then stops', () => {
    const { result } = renderHook(() => useZoom(board(20, 20)));
    for (let i = 0; i < 20; i++) act(() => result.current.zoomIn());
    expect(result.current.cellSize).toBe(MAX_CELL_SIZE);
    expect(result.current.canZoomIn).toBe(false);
    expect(result.current.canZoomOut).toBe(true);
  });
});
