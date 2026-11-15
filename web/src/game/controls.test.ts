import { describe, expect, it } from 'vitest';
import { allowedActions } from './controls';
import type { Controls } from './controls';
import { MODE } from './mode';
import type { Mode } from './mode';

// Each state and the controls that can be used in it.
const NO_CONTROLS = { step: false, play: false, pause: false, reset: false, changeRules: false };

describe('allowedActions with a game', () => {
  it.each<[Mode, Controls]>([
    [MODE.GAME_READY, { step: true, play: true, pause: false, reset: false, changeRules: true }],
    [MODE.GAME_RUNNING, { step: false, play: false, pause: true, reset: true, changeRules: true }],
    [MODE.GAME_PAUSED, { step: true, play: true, pause: false, reset: true, changeRules: true }],
    [MODE.GAME_COMPLETE, NO_CONTROLS],
  ])('%s', (mode, expected) => {
    expect(allowedActions(mode, true)).toEqual(expected);
  });
});

describe('allowedActions without a game', () => {
  it.each(Object.values(MODE))('only lets the rules be chosen (%s)', (mode) => {
    expect(allowedActions(mode, false)).toEqual({ ...NO_CONTROLS, changeRules: true });
  });
});

it('allowedActions throws for a mode it does not know', () => {
  expect(() => allowedActions('nonsense' as Mode, true)).toThrow(/Unhandled mode/);
});
