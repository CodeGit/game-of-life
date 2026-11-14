// custom game hook for managing game state and actions
import { useState } from 'react';
import { MODE, MODE_MESSAGES } from '@/game/mode';
import { createWorld } from '@/engine/world';
import { MENU_ACTIONS } from '@/ui/header/menuActions';
import type { World, WorldOptions } from '@/engine/types';
import type { Mode } from '@/game/mode';
import type { MenuAction } from '@/ui/header/menuActions';

export function useGameMode() {
  const [world, setWorld] = useState<World | null>(null);
  const [mode, setMode] = useState<Mode>(MODE.GAME_READY);
  const [isNewGameFormVisible, setIsNewGameFormVisible] = useState(false);

  // Menu: New game. Opens the form; the form calls startGame when the user presses Start.
  function showNewGameForm() {
    setIsNewGameFormVisible(true);
  }

  function hideNewGameForm() {
    setIsNewGameFormVisible(false);
  }

  function startGame(options: WorldOptions) {
    setWorld(createWorld(options));
    setMode(MODE.GAME_READY);
    setIsNewGameFormVisible(false);
  }

  // Menu: End game.
  function endGame() {
    // TODO: confirm first if the game has not been saved.
    setWorld(null);
    setMode(MODE.GAME_READY);
  }

  // Menu: Load game.
  function loadGame() {
    // TODO: choose a file (or a saved game from the server), rebuild the world from it.
  }

  // Menu: Save game.
  function saveGame() {
    // TODO: write the options, seed and cells to a file (or to the server).
  }

  // The header reports which menu item was chosen; this maps it to the action.
  function handleMenuAction(action: MenuAction) {
    switch (action) {
      case MENU_ACTIONS.NEW_GAME:
        return showNewGameForm();
      case MENU_ACTIONS.END_GAME:
        return endGame();
      case MENU_ACTIONS.LOAD_GAME:
        return loadGame();
      case MENU_ACTIONS.SAVE_GAME:
        return saveGame();
      default: {
        const unreachable: never = action;
        throw new Error(`Unhandled menu action: ${unreachable}`);
      }
    }
  }

  return {
    world,
    setWorld,
    mode,
    setMode,
    message: MODE_MESSAGES[mode],
    showNewGameForm,
    hideNewGameForm,
    isNewGameFormVisible,
    startGame,
    handleMenuAction,
  };
}
