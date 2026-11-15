import { describe, expect, it } from 'vitest';
import { allowedActions } from './controls';
import type { Controls } from './controls';
import { MODE } from './mode';
import type { Mode } from './mode';

const modes = Object.values(MODE);

describe('allowedActions with a game', () => {
  it.each<[Mode, Controls]>([
    [MODE.GAME_READY, { step: true, play: true, pause: false, reset: false, changeRules: true }],
    [MODE.GAME_RUNNING, { step: false, play: false, pause: true, reset: true, changeRules: true }],
    [MODE.GAME_PAUSED, { step: true, play: true, pause: false, reset: true, changeRules: true }],
    [
      MODE.GAME_COMPLETE,
      { step: false, play: false, pause: false, reset: false, changeRules: false },
    ],
  ])('%s', (mode, expected) => {
    expect(allowedActions(mode, true)).toEqual(expected);
  });

  it('only allows Pause while running', () => {
    for (const mode of modes) {
      expect(allowedActions(mode, true).pause).toBe(mode === MODE.GAME_RUNNING);
    }
  });

  it('never allows Step or Play while running, so they cannot fight the timer', () => {
    const running = allowedActions(MODE.GAME_RUNNING, true);
    expect(running.step).toBe(false);
    expect(running.play).toBe(false);
  });

  it('allows Step and Play together or not at all', () => {
    for (const mode of modes) {
      const { step, play } = allowedActions(mode, true);
      expect(step).toBe(play);
    }
  });

  it('cannot Reset a game that has not started running', () => {
    expect(allowedActions(MODE.GAME_READY, true).reset).toBe(false);
  });

  it('locks everything once the game is complete', () => {
    expect(Object.values(allowedActions(MODE.GAME_COMPLETE, true)).every((v) => !v)).toBe(true);
  });
});

describe('allowedActions without a game', () => {
  it.each(modes)('only lets the rules be chosen (%s)', (mode) => {
    expect(allowedActions(mode, false)).toEqual({
      step: false,
      play: false,
      pause: false,
      reset: false,
      changeRules: true,
    });
  });
});

describe('allowedActions with an unknown mode', () => {
  it('throws', () => {
    expect(() => allowedActions('nonsense' as Mode, true)).toThrow(/Unhandled mode/);
  });
});
