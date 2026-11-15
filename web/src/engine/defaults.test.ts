import { describe, expect, it } from 'vitest';
import { DEFAULT_COLS, DEFAULT_ROWS } from './defaults';
import { MAX_WORLD_SIZE, MIN_WORLD_SIZE } from './limits';

describe('default world size', () => {
  it.each([
    ['rows', DEFAULT_ROWS],
    ['columns', DEFAULT_COLS],
  ])('has %s within the limits', (_name, size) => {
    expect(Number.isInteger(size)).toBe(true);
    expect(size).toBeGreaterThanOrEqual(MIN_WORLD_SIZE);
    expect(size).toBeLessThanOrEqual(MAX_WORLD_SIZE);
  });
});
