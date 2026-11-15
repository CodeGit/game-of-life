// Helpers shared by the game hook's tests (not part of the app).
import { act, renderHook } from '@testing-library/react';
import type { World, WorldOptions } from '@/engine/types';
import { useGameMode } from './useGameMode';

// A small world to play with.
export const options: WorldOptions = {
  id: 'test',
  rows: 6,
  cols: 8,
  wrap: false,
  age: false,
  seed: 1,
};

// Every cell alive on a wrapped board, so each cell has 8 neighbours. Under Conway's rules they
// all die in one step, and under Life without Death they all live.
export const FULL_BOARD: WorldOptions = { ...options, wrap: true, density: 1 };

// A random board, so the cells change from one generation to the next.
export const RANDOM_BOARD: WorldOptions = { ...options, wrap: true, density: 0.4 };

// Renders the hook, and starts a game if given options. Read the hook's state from `.current`.
export function setupGame(start?: WorldOptions) {
  const { result } = renderHook(() => useGameMode());
  if (start) act(() => result.current.startGame(start));
  return result;
}

export const cellsOf = (world: World | null) => [...(world?.main ?? [])];
export const allAlive = (world: World | null) => cellsOf(world).every((owner) => owner > 0);
export const allDead = (world: World | null) => cellsOf(world).every((owner) => owner === 0);
