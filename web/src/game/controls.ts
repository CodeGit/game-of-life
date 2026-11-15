import { MODE } from './mode';
import type { Mode } from './mode';

export type Controls = {
  step: boolean;
  play: boolean;
  pause: boolean;
  reset: boolean;
  changeRules: boolean;
};

const NONE: Controls = { step: false, play: false, pause: false, reset: false, changeRules: false };

// Which controls can be used in each state. Choosing rules is allowed before a game starts,
// so the next game uses them, and at any point while one is in progress.
export function allowedActions(mode: Mode, hasGame: boolean): Controls {
  if (!hasGame) return { ...NONE, changeRules: true };
  switch (mode) {
    case MODE.GAME_READY:
      return { step: true, play: true, pause: false, reset: false, changeRules: true };
    case MODE.GAME_RUNNING:
      return { step: false, play: false, pause: true, reset: true, changeRules: true };
    case MODE.GAME_PAUSED:
      return { step: true, play: true, pause: false, reset: true, changeRules: true };
    case MODE.GAME_COMPLETE:
      return NONE;
    default: {
      const unreachable: never = mode;
      throw new Error(`Unhandled mode: ${unreachable}`);
    }
  }
}
