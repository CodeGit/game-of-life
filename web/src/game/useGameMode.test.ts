import { act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MENU_ACTIONS } from '@/ui/header/menuActions';
import type { MenuAction } from '@/ui/header/menuActions';
import { MODE, MODE_MESSAGES } from './mode';
import { FULL_BOARD, allAlive, options, setupGame } from './testing';

describe('useGameMode: starting state', () => {
  it('has no game, is ready, and shows no form', () => {
    const game = setupGame();
    expect(game.current.world).toBeNull();
    expect(game.current.mode).toBe(MODE.GAME_READY);
    expect(game.current.message).toBe(MODE_MESSAGES[MODE.GAME_READY]);
    expect(game.current.isNewGameFormVisible).toBe(false);
  });
});

describe('useGameMode: the New game form', () => {
  it('is shown by the New game menu action', () => {
    const game = setupGame();
    act(() => game.current.handleMenuAction(MENU_ACTIONS.NEW_GAME));
    expect(game.current.isNewGameFormVisible).toBe(true);
  });

  it('can be hidden again without starting a game', () => {
    const game = setupGame();
    act(() => game.current.showNewGameForm());
    act(() => game.current.hideNewGameForm());
    expect(game.current.isNewGameFormVisible).toBe(false);
    expect(game.current.world).toBeNull();
  });
});

describe('useGameMode: starting a game', () => {
  it('creates a world from the options', () => {
    const game = setupGame(options);
    expect(game.current.world).toMatchObject({ id: 'test', rows: 6, cols: 8 });
  });

  it('hides the form and is ready to play', () => {
    const game = setupGame();
    act(() => game.current.handleMenuAction(MENU_ACTIONS.NEW_GAME));
    act(() => game.current.startGame(options));
    expect(game.current.isNewGameFormVisible).toBe(false);
    expect(game.current.mode).toBe(MODE.GAME_READY);
  });

  it('can start with random cells', () => {
    const game = setupGame(FULL_BOARD);
    expect(allAlive(game.current.world)).toBe(true);
  });

  it('replaces a game that is already under way', () => {
    const game = setupGame(options);
    const first = game.current.world;
    act(() => game.current.startGame({ ...options, rows: 3 }));
    expect(game.current.world).not.toBe(first);
    expect(game.current.world?.rows).toBe(3);
  });
});

describe('useGameMode: other menu actions', () => {
  it('End game removes the world', () => {
    const game = setupGame(options);
    act(() => game.current.handleMenuAction(MENU_ACTIONS.END_GAME));
    expect(game.current.world).toBeNull();
    expect(game.current.mode).toBe(MODE.GAME_COMPLETE);
  });

  it('Save and Load are placeholders that leave the game alone', () => {
    const game = setupGame(options);
    const world = game.current.world;
    act(() => game.current.handleMenuAction(MENU_ACTIONS.SAVE_GAME));
    act(() => game.current.handleMenuAction(MENU_ACTIONS.LOAD_GAME));
    expect(game.current.world).toBe(world);
  });

  it('rejects an action it does not know', () => {
    const game = setupGame();
    expect(() => game.current.handleMenuAction('nonsense' as MenuAction)).toThrow(
      /Unhandled menu action/,
    );
  });
});
