import { describe, expect, it } from 'vitest';
import { createWorld } from '@/engine/world';
import { FULL_BOARD, allAlive, allDead, options } from './testing';

// The helpers the game tests rely on must not pass when there is nothing to check.
describe('allAlive and allDead', () => {
  it('are both false when there is no world', () => {
    expect(allAlive(null)).toBe(false);
    expect(allDead(null)).toBe(false);
  });

  it('say so for a full board and for an empty one', () => {
    expect(allAlive(createWorld(FULL_BOARD))).toBe(true);
    expect(allDead(createWorld(FULL_BOARD))).toBe(false);
    expect(allDead(createWorld(options))).toBe(true);
    expect(allAlive(createWorld(options))).toBe(false);
  });

  it('are both false for a board that is part alive', () => {
    const world = createWorld({ ...options, density: 0.4 });
    expect(allAlive(world)).toBe(false);
    expect(allDead(world)).toBe(false);
  });
});
