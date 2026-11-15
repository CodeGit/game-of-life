// custom game hook for managing game state and actions
import { useState } from 'react';
import { allowedActions } from '@/game/controls';
import { MODE, MODE_MESSAGES } from '@/game/mode';
import { DEFAULT_SPEED, delayFor } from '@/game/speed';
import { useRunLoop } from '@/game/useRunLoop';
import { CONWAY } from '@/engine/rules';
import { createWorld, updateWorld } from '@/engine/world';
import { MENU_ACTIONS } from '@/ui/header/menuActions';
import type { Rules, World, WorldOptions } from '@/engine/types';
import type { Mode } from '@/game/mode';
import type { MenuAction } from '@/ui/header/menuActions';

export function useGameMode() {
  const [world, setWorld] = useState<World | null>(null);
  // Enables reset back to original options.
  const [options, setOptions] = useState<WorldOptions | null>(null);
  const [mode, setMode] = useState<Mode>(MODE.GAME_READY);
  const [isNewGameFormVisible, setIsNewGameFormVisible] = useState(false);
  // Enables the rules on a running world to be changed
  const [rules, setRules] = useState<Rules>(CONWAY);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);

  // Which controls can be used now. The actions below check it, so a stray call (from a
  // timer or a keyboard shortcut) cannot do what the buttons would not allow.
  const allowed = allowedActions(mode, world !== null);

  // Takes the world to its next generation with the current rules. Changes no mode.
  // updateWorld changes the world in place, so a shallow copy gives React a new reference to
  // redraw from (the copy shares the same cell arrays).
  function nextGeneration() {
    if (!world) return;
    updateWorld(world, rules);
    setWorld({ ...world });
  }

  // Footer: Step. One generation per click, then the game pauses.
  function stepGame() {
    if (!allowed.step) return;
    nextGeneration();
    setMode(MODE.GAME_PAUSED);
  }

  // Footer: Play.
  function runGame() {
    if (!allowed.play) return;
    setMode(MODE.GAME_RUNNING);
  }

  // Footer: Pause.
  function pauseGame() {
    if (!allowed.pause) return;
    setMode(MODE.GAME_PAUSED);
  }

  // While running, a new generation is generated based on speed.
  // Pausing, Reset and End game all change the mode, which stops the timer.
  useRunLoop(mode === MODE.GAME_RUNNING, delayFor(speed), nextGeneration);

  // Menu: New game. Opens the form; the form calls startGame when the user presses Start.
  function showNewGameForm() {
    setIsNewGameFormVisible(true);
  }

  function hideNewGameForm() {
    setIsNewGameFormVisible(false);
  }

  function startGame(newOptions: WorldOptions) {
    // createWorld picks a seed from the clock when there is none, so fix one now. Otherwise
    // Reset would get a different random board each time.
    const resolved = { ...newOptions, seed: newOptions.seed ?? Date.now() };
    setOptions(resolved);
    setWorld(createWorld(resolved));
    setMode(MODE.GAME_READY);
    setIsNewGameFormVisible(false);
  }

  // Footer: Reset. Goes back to the starting board of this game (same seed, so the same cells),
  // keeping the current rules, so the same start can be tried under different rules.
  function resetGame() {
    if (!options) return;
    setWorld(createWorld(options));
    setMode(MODE.GAME_READY);
  }

  // Menu: End game.
  function endGame() {
    // TODO: confirm first if the game has not been saved.
    setWorld(null);
    setOptions(null);
    setMode(MODE.GAME_COMPLETE);
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
    mode,
    message: MODE_MESSAGES[mode],
    showNewGameForm,
    hideNewGameForm,
    isNewGameFormVisible,
    startGame,
    handleMenuAction,
    rules,
    setRules,
    speed,
    setSpeed,
    stepGame,
    runGame,
    pauseGame,
    resetGame,
  };
}
