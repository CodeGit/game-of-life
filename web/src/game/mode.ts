import type { ValueOf } from '@/utils/types';

const GAME_RUNNING = 'running';
const GAME_PAUSED = 'paused';
const GAME_COMPLETE = 'complete';
const GAME_READY = 'ready';

export const MODE = {
  GAME_RUNNING,
  GAME_PAUSED,
  GAME_COMPLETE,
  GAME_READY,
} as const;

export const MODE_MESSAGES = {
  [MODE.GAME_RUNNING]: 'Game is running',
  [MODE.GAME_PAUSED]: 'Game is paused',
  [MODE.GAME_COMPLETE]: 'Game completed',
  [MODE.GAME_READY]: 'Game ready',
} as const;

export type Mode = ValueOf<typeof MODE>;
