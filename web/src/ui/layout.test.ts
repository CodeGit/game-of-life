import { describe, expect, it } from 'vitest';
import {
  FOOTER_HEIGHT,
  HEADER_HEIGHT,
  MAX_COLUMN_WIDTH,
  MIN_COLUMN_WIDTH,
  PAGE_PADDING,
  boardSpace,
  columnWidth,
} from './layout';

describe('boardSpace', () => {
  it('leaves what is left of the window after the padding on both sides', () => {
    expect(boardSpace(1000, 2000).width).toBe(1000 - 2 * PAGE_PADDING);
  });

  it('leaves what is left of the height after the header, footer and padding', () => {
    expect(boardSpace(2000, 1000).height).toBe(
      1000 - HEADER_HEIGHT - FOOTER_HEIGHT - 2 * PAGE_PADDING,
    );
  });

  it('is 968 x 450 in a 1000 x 700 window', () => {
    expect(boardSpace(1000, 700)).toEqual({ width: 968, height: 450 });
  });

  it('never goes negative in a window too small for the page', () => {
    expect(boardSpace(10, 100)).toEqual({ width: 0, height: 0 });
  });

  it('gets bigger as the window does', () => {
    const small = boardSpace(800, 600);
    const big = boardSpace(1200, 900);
    expect(big.width).toBeGreaterThan(small.width);
    expect(big.height).toBeGreaterThan(small.height);
  });
});

describe('columnWidth', () => {
  const roomy = 2000; // a window wider than the column ever gets

  it('has a minimum below the maximum', () => {
    expect(MIN_COLUMN_WIDTH).toBeLessThan(MAX_COLUMN_WIDTH);
  });

  it('follows the board when it is between the limits', () => {
    expect(columnWidth(500, roomy)).toBe(500);
  });

  it('is never narrower than the minimum, so the title and play bar fit', () => {
    expect(columnWidth(100, roomy)).toBe(MIN_COLUMN_WIDTH);
    expect(columnWidth(0, roomy)).toBe(MIN_COLUMN_WIDTH); // no game
  });

  it('is never wider than the maximum, however big the board', () => {
    expect(columnWidth(4000, roomy)).toBe(MAX_COLUMN_WIDTH);
  });

  it('is exactly the limits at the limits', () => {
    expect(columnWidth(MIN_COLUMN_WIDTH, roomy)).toBe(MIN_COLUMN_WIDTH);
    expect(columnWidth(MAX_COLUMN_WIDTH, roomy)).toBe(MAX_COLUMN_WIDTH);
  });

  it('is never wider than the window, even below the minimum', () => {
    expect(columnWidth(800, 568)).toBe(568);
    expect(columnWidth(100, 300)).toBe(300);
  });
});
