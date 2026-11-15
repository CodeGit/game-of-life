import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { WorldOptions } from '@/engine/types';
import { CONWAY, findPreset } from '@/engine/rules';
import { MENU_ACTIONS } from '@/ui/header/menuActions';
import type { MenuAction } from '@/ui/header/menuActions';
import { MODE, MODE_MESSAGES } from './mode';
import { useGameMode } from './useGameMode';

const options: WorldOptions = { id: 'test', rows: 6, cols: 8, wrap: false, age: false, seed: 1 };

describe('useGameMode: starting state', () => {
  it('has no game, is ready, and shows no form', () => {
    const { result } = renderHook(() => useGameMode());
    expect(result.current.world).toBeNull();
    expect(result.current.mode).toBe(MODE.GAME_READY);
    expect(result.current.message).toBe(MODE_MESSAGES[MODE.GAME_READY]);
    expect(result.current.isNewGameFormVisible).toBe(false);
  });
});

describe('useGameMode: the New game form', () => {
  it('is shown by the New game menu action', () => {
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.handleMenuAction(MENU_ACTIONS.NEW_GAME));
    expect(result.current.isNewGameFormVisible).toBe(true);
  });

  it('can be hidden again without starting a game', () => {
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.showNewGameForm());
    act(() => result.current.hideNewGameForm());
    expect(result.current.isNewGameFormVisible).toBe(false);
    expect(result.current.world).toBeNull();
  });
});

describe('useGameMode: starting a game', () => {
  it('creates a world from the options', () => {
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.startGame(options));
    expect(result.current.world?.rows).toBe(6);
    expect(result.current.world?.cols).toBe(8);
    expect(result.current.world?.id).toBe('test');
  });

  it('hides the form and is ready to play', () => {
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.handleMenuAction(MENU_ACTIONS.NEW_GAME));
    act(() => result.current.startGame(options));
    expect(result.current.isNewGameFormVisible).toBe(false);
    expect(result.current.mode).toBe(MODE.GAME_READY);
  });

  it('can start with random cells', () => {
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.startGame({ ...options, density: 1 }));
    expect(result.current.world?.main.every((owner) => owner === 1)).toBe(true);
  });

  it('replaces a game that is already running', () => {
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.startGame(options));
    const first = result.current.world;
    act(() => result.current.startGame({ ...options, rows: 3 }));
    expect(result.current.world).not.toBe(first);
    expect(result.current.world?.rows).toBe(3);
  });
});

describe('useGameMode: other menu actions', () => {
  it('End game removes the world', () => {
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.startGame(options));
    act(() => result.current.handleMenuAction(MENU_ACTIONS.END_GAME));
    expect(result.current.world).toBeNull();
    expect(result.current.mode).toBe(MODE.GAME_COMPLETE);
  });

  it('Save and Load are placeholders that leave the game alone', () => {
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.startGame(options));
    const world = result.current.world;
    act(() => result.current.handleMenuAction(MENU_ACTIONS.SAVE_GAME));
    act(() => result.current.handleMenuAction(MENU_ACTIONS.LOAD_GAME));
    expect(result.current.world).toBe(world);
  });

  it('rejects an action it does not know', () => {
    const { result } = renderHook(() => useGameMode());
    expect(() => result.current.handleMenuAction('nonsense' as MenuAction)).toThrow(
      /Unhandled menu action/,
    );
  });
});

describe('useGameMode: stepping', () => {
  it('does nothing without a game', () => {
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.stepGame());
    expect(result.current.world).toBeNull();
  });

  it('moves the game on one generation each time', () => {
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.startGame(options));
    expect(result.current.world?.generation).toBe(0);
    act(() => result.current.stepGame());
    expect(result.current.world?.generation).toBe(1);
    act(() => result.current.stepGame());
    expect(result.current.world?.generation).toBe(2);
  });

  it('gives React a new world each step, so the board is redrawn', () => {
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.startGame(options));
    const before = result.current.world;
    act(() => result.current.stepGame());
    expect(result.current.world).not.toBe(before);
  });

  it('applies the rules to the cells', () => {
    const { result } = renderHook(() => useGameMode());
    // A full wrapped board: every cell has 8 neighbours, so under Conway they all die.
    act(() => result.current.startGame({ ...options, wrap: true, density: 1 }));
    act(() => result.current.stepGame());
    expect(result.current.world?.main.every((owner) => owner === 0)).toBe(true);
  });
});

describe('useGameMode: rules', () => {
  it('start as Conway', () => {
    const { result } = renderHook(() => useGameMode());
    expect(result.current.rules).toEqual(CONWAY);
  });

  it('can be chosen before a game starts', () => {
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.setRules(findPreset('no-death')!.rules));
    act(() => result.current.startGame({ ...options, wrap: true, density: 1 }));
    act(() => result.current.stepGame());
    expect(result.current.world?.main.every((owner) => owner === 1)).toBe(true);
  });

  it('can be changed between steps of a running game', () => {
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.startGame({ ...options, wrap: true, density: 1 }));
    act(() => result.current.setRules(findPreset('no-death')!.rules));
    act(() => result.current.stepGame());
    expect(result.current.world?.main.every((owner) => owner === 1)).toBe(true);
    act(() => result.current.setRules(CONWAY));
    act(() => result.current.stepGame());
    expect(result.current.world?.main.every((owner) => owner === 0)).toBe(true);
  });

  it('are kept when a new game starts', () => {
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.setRules(findPreset('seeds')!.rules));
    act(() => result.current.startGame(options));
    expect(result.current.rules).toEqual(findPreset('seeds')!.rules);
  });
});
