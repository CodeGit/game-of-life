import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { WorldOptions } from '@/engine/types';
import { CONWAY, findPreset } from '@/engine/rules';
import { MENU_ACTIONS } from '@/ui/header/menuActions';
import type { MenuAction } from '@/ui/header/menuActions';
import { MODE, MODE_MESSAGES } from './mode';
import { DEFAULT_SPEED, MAX_SPEED, MIN_SPEED, delayFor } from './speed';
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

describe('useGameMode: resetting', () => {
  const random: WorldOptions = { ...options, wrap: true, density: 0.4 };
  const cells = (world: { main: Uint8Array } | null) => [...(world?.main ?? [])];

  it('does nothing without a game', () => {
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.resetGame());
    expect(result.current.world).toBeNull();
  });

  it('goes back to generation 0 and the ready state', () => {
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.startGame(random));
    act(() => result.current.stepGame());
    act(() => result.current.stepGame());
    expect(result.current.mode).toBe(MODE.GAME_PAUSED);
    act(() => result.current.resetGame());
    expect(result.current.world?.generation).toBe(0);
    expect(result.current.mode).toBe(MODE.GAME_READY);
  });

  it('gives a new world for React to draw', () => {
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.startGame(random));
    const before = result.current.world;
    act(() => result.current.resetGame());
    expect(result.current.world).not.toBe(before);
  });

  it('restores exactly the starting cells', () => {
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.startGame(random));
    const start = cells(result.current.world);
    expect(start.some((owner) => owner > 0)).toBe(true);
    for (let i = 0; i < 5; i++) act(() => result.current.stepGame());
    expect(cells(result.current.world)).not.toEqual(start);
    act(() => result.current.resetGame());
    expect(cells(result.current.world)).toEqual(start);
  });

  it('restores the same cells even though no seed was given', () => {
    const { result } = renderHook(() => useGameMode());
    const unseeded: WorldOptions = {
      id: 'test',
      rows: 6,
      cols: 8,
      wrap: true,
      age: false,
      density: 0.4,
    };
    act(() => result.current.startGame(unseeded));
    const start = cells(result.current.world);
    // Let the clock move on: without a fixed seed a rebuilt board would differ.
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 60_000);
    act(() => result.current.resetGame());
    vi.useRealTimers();
    expect(cells(result.current.world)).toEqual(start);
  });

  it('keeps the rules that were chosen', () => {
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.startGame(random));
    act(() => result.current.setRules(findPreset('highlife')!.rules));
    act(() => result.current.resetGame());
    expect(result.current.rules).toEqual(findPreset('highlife')!.rules);
  });

  it('lets the same start be tried under different rules', () => {
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.startGame(random));
    for (let i = 0; i < 5; i++) act(() => result.current.stepGame());
    const underConway = cells(result.current.world);
    act(() => result.current.resetGame());
    act(() => result.current.setRules(findPreset('seeds')!.rules));
    for (let i = 0; i < 5; i++) act(() => result.current.stepGame());
    expect(cells(result.current.world)).not.toEqual(underConway);
  });

  it('does not bring a game back after End game', () => {
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.startGame(random));
    act(() => result.current.handleMenuAction(MENU_ACTIONS.END_GAME));
    act(() => result.current.resetGame());
    expect(result.current.world).toBeNull();
  });

  it('starts over from the newest game, not an earlier one', () => {
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.startGame(random));
    act(() => result.current.startGame({ ...random, rows: 3, cols: 3, seed: 9 }));
    act(() => result.current.resetGame());
    expect(result.current.world?.rows).toBe(3);
  });
});

describe('useGameMode: playing and pausing', () => {
  const play = { ...options, wrap: true, density: 0.4 };
  const started = () => {
    const hook = renderHook(() => useGameMode());
    act(() => hook.result.current.startGame(play));
    return hook;
  };
  const wait = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
  const delay = () => delayFor(DEFAULT_SPEED);

  afterEach(() => vi.useRealTimers());

  it('Play starts running', () => {
    const { result } = started();
    act(() => result.current.runGame());
    expect(result.current.mode).toBe(MODE.GAME_RUNNING);
  });

  it('moves a running game on one generation each interval', () => {
    vi.useFakeTimers();
    const { result } = started();
    act(() => result.current.runGame());
    wait(delay());
    expect(result.current.world?.generation).toBe(1);
    wait(delay() * 3);
    expect(result.current.world?.generation).toBe(4);
  });

  it('does not move before Play is pressed', () => {
    vi.useFakeTimers();
    const { result } = started();
    wait(delay() * 5);
    expect(result.current.world?.generation).toBe(0);
  });

  it('Pause stops the game where it is', () => {
    vi.useFakeTimers();
    const { result } = started();
    act(() => result.current.runGame());
    wait(delay() * 2);
    act(() => result.current.pauseGame());
    expect(result.current.mode).toBe(MODE.GAME_PAUSED);
    wait(delay() * 10);
    expect(result.current.world?.generation).toBe(2);
  });

  it('Play again carries on from the same generation', () => {
    vi.useFakeTimers();
    const { result } = started();
    act(() => result.current.runGame());
    wait(delay() * 2);
    act(() => result.current.pauseGame());
    act(() => result.current.runGame());
    wait(delay());
    expect(result.current.world?.generation).toBe(3);
  });

  it('Play works after a manual step', () => {
    const { result } = started();
    act(() => result.current.stepGame());
    act(() => result.current.runGame());
    expect(result.current.mode).toBe(MODE.GAME_RUNNING);
  });

  it('a running game draws each generation, with a new world every time', () => {
    vi.useFakeTimers();
    const { result } = started();
    act(() => result.current.runGame());
    const seen = new Set<unknown>();
    for (let i = 0; i < 3; i++) {
      wait(delay());
      seen.add(result.current.world);
    }
    expect(seen.size).toBe(3);
  });

  it('cannot Step by hand while running', () => {
    vi.useFakeTimers();
    const { result } = started();
    act(() => result.current.runGame());
    act(() => result.current.stepGame());
    expect(result.current.mode).toBe(MODE.GAME_RUNNING);
    expect(result.current.world?.generation).toBe(0);
  });

  it('does nothing when told to Play, Pause or Step with no game', () => {
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.runGame());
    act(() => result.current.pauseGame());
    act(() => result.current.stepGame());
    expect(result.current.mode).toBe(MODE.GAME_READY);
    expect(result.current.world).toBeNull();
  });

  it('Pause does nothing unless the game is running', () => {
    const { result } = started();
    act(() => result.current.pauseGame());
    expect(result.current.mode).toBe(MODE.GAME_READY);
  });

  it('Reset stops a running game and goes back to the start', () => {
    vi.useFakeTimers();
    const { result } = started();
    const start = [...(result.current.world?.main ?? [])];
    act(() => result.current.runGame());
    wait(delay() * 3);
    act(() => result.current.resetGame());
    expect(result.current.mode).toBe(MODE.GAME_READY);
    expect(result.current.world?.generation).toBe(0);
    expect([...(result.current.world?.main ?? [])]).toEqual(start);
    wait(delay() * 5);
    expect(result.current.world?.generation).toBe(0);
  });

  it('End game stops the timer', () => {
    vi.useFakeTimers();
    const { result } = started();
    act(() => result.current.runGame());
    act(() => result.current.handleMenuAction(MENU_ACTIONS.END_GAME));
    expect(vi.getTimerCount()).toBe(0);
    expect(result.current.world).toBeNull();
  });

  it('a new game does not carry on running', () => {
    vi.useFakeTimers();
    const { result } = started();
    act(() => result.current.runGame());
    act(() => result.current.startGame(play));
    expect(result.current.mode).toBe(MODE.GAME_READY);
    wait(delay() * 3);
    expect(result.current.world?.generation).toBe(0);
  });

  it('uses the rules as they are changed while running', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.startGame({ ...options, wrap: true, density: 1 }));
    act(() => result.current.setRules(findPreset('no-death')!.rules));
    act(() => result.current.runGame());
    wait(delay());
    expect(result.current.world?.main.every((owner) => owner === 1)).toBe(true);
    act(() => result.current.setRules(CONWAY)); // everything has 8 neighbours, so it all dies
    wait(delay());
    expect(result.current.world?.main.every((owner) => owner === 0)).toBe(true);
  });
});

describe('useGameMode: speed', () => {
  afterEach(() => vi.useRealTimers());

  it('starts at the default', () => {
    const { result } = renderHook(() => useGameMode());
    expect(result.current.speed).toBe(DEFAULT_SPEED);
  });

  it('can be changed with no game', () => {
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.setSpeed(80));
    expect(result.current.speed).toBe(80);
  });

  it('changes how fast a running game moves', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useGameMode());
    act(() => result.current.startGame({ ...options, wrap: true, density: 0.4 }));
    act(() => result.current.setSpeed(MIN_SPEED));
    act(() => result.current.runGame());
    act(() => void vi.advanceTimersByTime(delayFor(MIN_SPEED)));
    expect(result.current.world?.generation).toBe(1);
    act(() => result.current.setSpeed(MAX_SPEED));
    act(() => void vi.advanceTimersByTime(delayFor(MAX_SPEED) * 10));
    expect(result.current.world?.generation).toBe(11);
  });
});
