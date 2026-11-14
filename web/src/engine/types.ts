import type { ValueOf } from '@/utils/types';

export type Grid = Uint8Array;
export type AgeGrid = Uint8Array;

export type World = {
  id: string;
  main: Grid;
  buffer: Grid;
  lifespan: number;
  ageGrid: AgeGrid | null;
  rows: number;
  cols: number;
  rng: () => number;
  seed: number;
  wrap: boolean;
  rangeLimit: number;
};

// Everything needed to create a world. Fixed for the life of a game.
export type WorldOptions = {
  id: string;
  rows: number;
  cols: number;
  wrap: boolean;
  age: boolean;
  lifespan?: number; // defaults to 255
  seed?: number; // defaults to the current time
  density?: number; // 0 to 1: chance each cell starts alive; omit for an empty world
  players?: number; // how many players share the random cells (default 1)
};

const CIRCLE = 'CIRCLE';
const SQUARE = 'SQUARE';
const DIAMOND = 'DIAMOND';
const USER_DEFINED = 'USER_DEFINED';
export const RULE_TYPE = {
  CIRCLE,
  SQUARE,
  DIAMOND,
  USER_DEFINED,
} as const;
type RuleType = ValueOf<typeof RULE_TYPE>;

export type Rules = {
  type: RuleType;
  range: number;
  Birth: number[];
  Survival: number[];
};
