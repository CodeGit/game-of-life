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

type ValueOf<T> = T[keyof T];

const CIRCLE = 'CIRCLE' as const;
const SQUARE = 'SQUARE' as const;
const DIAMOND = 'DIAMOND' as const;
const USER_DEFINED = 'USER_DEFINED' as const;
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
