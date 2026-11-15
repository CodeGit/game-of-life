// The hook while a game is being played: stepping, rules, reset, play and pause, and speed.
import { act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CONWAY, findPreset } from '@/engine/rules';
import type { WorldOptions } from '@/engine/types';
import { MENU_ACTIONS } from '@/ui/header/menuActions';
import { MODE } from './mode';
import { DEFAULT_SPEED, MAX_SPEED, MIN_SPEED, delayFor } from './speed';
import {
  FULL_BOARD,
  RANDOM_BOARD,
  allAlive,
  allDead,
  cellsOf,
  options,
  setupGame,
} from './testing';

const rulesOf = (id: string) => findPreset(id)!.rules;
const generationOf = (game: ReturnType<typeof setupGame>) => game.current.world?.generation;

describe('stepping', () => {
  it('moves the game on one generation each time', () => {
    const game = setupGame(options);
    act(() => game.current.stepGame());
    expect(generationOf(game)).toBe(1);
    act(() => game.current.stepGame());
    expect(generationOf(game)).toBe(2);
  });

  it('gives React a new world each time, so the board is redrawn', () => {
    const game = setupGame(options);
    const before = game.current.world;
    act(() => game.current.stepGame());
    expect(game.current.world).not.toBe(before);
  });

  it('leaves the game paused', () => {
    const game = setupGame(options);
    act(() => game.current.stepGame());
    expect(game.current.mode).toBe(MODE.GAME_PAUSED);
  });

  it('does nothing without a game', () => {
    const game = setupGame();
    act(() => game.current.stepGame());
    expect(game.current.world).toBeNull();
  });
});

describe('rules', () => {
  it('start as Conway', () => {
    expect(setupGame().current.rules).toEqual(CONWAY);
  });

  it('decide what happens to the cells', () => {
    const game = setupGame(FULL_BOARD);
    act(() => game.current.stepGame());
    expect(allDead(game.current.world)).toBe(true); // Conway: overcrowded
  });

  it('can be chosen before a game starts', () => {
    const game = setupGame();
    act(() => game.current.setRules(rulesOf('no-death')));
    act(() => game.current.startGame(FULL_BOARD));
    act(() => game.current.stepGame());
    expect(allAlive(game.current.world)).toBe(true);
  });

  it('can be changed between steps', () => {
    const game = setupGame(FULL_BOARD);
    act(() => game.current.setRules(rulesOf('no-death')));
    act(() => game.current.stepGame());
    expect(allAlive(game.current.world)).toBe(true);
    act(() => game.current.setRules(CONWAY));
    act(() => game.current.stepGame());
    expect(allDead(game.current.world)).toBe(true);
  });

  it('are kept when a new game starts', () => {
    const game = setupGame();
    act(() => game.current.setRules(rulesOf('seeds')));
    act(() => game.current.startGame(options));
    expect(game.current.rules).toEqual(rulesOf('seeds'));
  });
});

describe('reset', () => {
  it('goes back to generation 0 and the ready state', () => {
    const game = setupGame(RANDOM_BOARD);
    act(() => game.current.stepGame());
    act(() => game.current.stepGame());
    act(() => game.current.resetGame());
    expect(generationOf(game)).toBe(0);
    expect(game.current.mode).toBe(MODE.GAME_READY);
  });

  it('gives React a new world, so the board is redrawn', () => {
    const game = setupGame(RANDOM_BOARD);
    const before = game.current.world;
    act(() => game.current.resetGame());
    expect(game.current.world).not.toBe(before);
  });

  it('restores exactly the starting cells', () => {
    const game = setupGame(RANDOM_BOARD);
    const start = cellsOf(game.current.world);
    for (let i = 0; i < 5; i++) act(() => game.current.stepGame());
    expect(cellsOf(game.current.world)).not.toEqual(start);
    act(() => game.current.resetGame());
    expect(cellsOf(game.current.world)).toEqual(start);
  });

  it('restores the same cells even when no seed was given', () => {
    const unseeded: WorldOptions = { ...RANDOM_BOARD, seed: undefined };
    const game = setupGame(unseeded);
    const start = cellsOf(game.current.world);
    // Without a fixed seed, a board rebuilt a minute later would use a different clock seed.
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 60_000);
    act(() => game.current.resetGame());
    vi.useRealTimers();
    expect(cellsOf(game.current.world)).toEqual(start);
  });

  it('keeps the rules, so the same start can be tried under different rules', () => {
    const game = setupGame(RANDOM_BOARD);
    act(() => game.current.setRules(rulesOf('highlife')));
    act(() => game.current.resetGame());
    expect(game.current.rules).toEqual(rulesOf('highlife'));
  });

  it('resets the newest game, not an earlier one', () => {
    const game = setupGame(RANDOM_BOARD);
    act(() => game.current.startGame({ ...RANDOM_BOARD, rows: 3, cols: 3, seed: 9 }));
    act(() => game.current.resetGame());
    expect(game.current.world?.rows).toBe(3);
  });

  it('does nothing without a game, or after End game', () => {
    const game = setupGame(RANDOM_BOARD);
    act(() => game.current.handleMenuAction(MENU_ACTIONS.END_GAME));
    act(() => game.current.resetGame());
    expect(game.current.world).toBeNull();
  });
});

describe('play and pause', () => {
  const delay = delayFor(DEFAULT_SPEED);
  const wait = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
  const playing = () => {
    vi.useFakeTimers();
    const game = setupGame(RANDOM_BOARD);
    act(() => game.current.runGame());
    return game;
  };

  afterEach(() => vi.useRealTimers());

  it('Play starts the game, which moves on one generation every interval', () => {
    const game = playing();
    expect(game.current.mode).toBe(MODE.GAME_RUNNING);
    wait(delay);
    expect(generationOf(game)).toBe(1);
    wait(delay * 3);
    expect(generationOf(game)).toBe(4);
  });

  it('does not move until Play is pressed', () => {
    vi.useFakeTimers();
    const game = setupGame(RANDOM_BOARD);
    wait(delay * 5);
    expect(generationOf(game)).toBe(0);
  });

  it('Pause stops the game where it is, and Play carries on from there', () => {
    const game = playing();
    wait(delay * 2);
    act(() => game.current.pauseGame());
    expect(game.current.mode).toBe(MODE.GAME_PAUSED);
    wait(delay * 10);
    expect(generationOf(game)).toBe(2);
    act(() => game.current.runGame());
    wait(delay);
    expect(generationOf(game)).toBe(3);
  });

  it('can Play after a manual step', () => {
    const game = setupGame(RANDOM_BOARD);
    act(() => game.current.stepGame());
    act(() => game.current.runGame());
    expect(game.current.mode).toBe(MODE.GAME_RUNNING);
  });

  it('cannot Step by hand while running', () => {
    const game = playing();
    act(() => game.current.stepGame());
    expect(game.current.mode).toBe(MODE.GAME_RUNNING);
    expect(generationOf(game)).toBe(0);
  });

  it('Pause does nothing unless the game is running', () => {
    const game = setupGame(RANDOM_BOARD);
    act(() => game.current.pauseGame());
    expect(game.current.mode).toBe(MODE.GAME_READY);
  });

  it('Play and Pause do nothing without a game', () => {
    const game = setupGame();
    act(() => game.current.runGame());
    act(() => game.current.pauseGame());
    expect(game.current.mode).toBe(MODE.GAME_READY);
  });

  it('uses the rules as they are changed while running', () => {
    vi.useFakeTimers();
    const game = setupGame(FULL_BOARD);
    act(() => game.current.setRules(rulesOf('no-death')));
    act(() => game.current.runGame());
    wait(delay);
    expect(allAlive(game.current.world)).toBe(true);
    act(() => game.current.setRules(CONWAY));
    wait(delay);
    expect(allDead(game.current.world)).toBe(true);
  });

  it('Reset stops a running game and goes back to the start', () => {
    const game = playing();
    wait(delay * 3);
    act(() => game.current.resetGame());
    expect(game.current.mode).toBe(MODE.GAME_READY);
    wait(delay * 5);
    expect(generationOf(game)).toBe(0);
  });

  it('End game stops the timer', () => {
    const game = playing();
    act(() => game.current.handleMenuAction(MENU_ACTIONS.END_GAME));
    expect(vi.getTimerCount()).toBe(0);
  });

  it('a new game does not carry on running', () => {
    const game = playing();
    act(() => game.current.startGame(RANDOM_BOARD));
    expect(game.current.mode).toBe(MODE.GAME_READY);
    wait(delay * 3);
    expect(generationOf(game)).toBe(0);
  });

  it('a faster speed means more generations in the same time', () => {
    vi.useFakeTimers();
    const game = setupGame(RANDOM_BOARD);
    act(() => game.current.setSpeed(MIN_SPEED));
    act(() => game.current.runGame());
    wait(delayFor(MIN_SPEED));
    expect(generationOf(game)).toBe(1);
    act(() => game.current.setSpeed(MAX_SPEED));
    wait(delayFor(MAX_SPEED) * 10);
    expect(generationOf(game)).toBe(11);
  });
});
