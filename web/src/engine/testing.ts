// Helpers shared by the engine tests (not part of the app).
//
// Worlds are described as pictures: '.' is a dead cell, '#' is a cell owned by
// player 1, and the digits '1'-'9' are cells owned by that player.
import { createWorld, updateWorld } from './grid';
import { RULE_TYPE } from './types';
import type { Rules, World } from './types';

export type WorldOptions = { wrap?: boolean; age?: boolean; maxAge?: number; seed?: number };

export function worldFrom(picture: string[], options: WorldOptions = {}): World {
  const rows = picture.length;
  const cols = picture[0]?.length ?? 0;
  const world = createWorld(
    'test',
    rows,
    cols,
    options.age ?? false,
    options.wrap ?? false,
    options.maxAge ?? 255,
    options.seed ?? 1,
  );

  picture.forEach((line, row) => {
    if (line.length !== cols)
      throw new Error(`Row ${row} is ${line.length} wide, expected ${cols}`);
    [...line].forEach((ch, col) => {
      if (ch !== '.' && ch !== '#' && !/^[1-9]$/.test(ch)) throw new Error(`Unknown cell '${ch}'`);
      world.main[row * cols + col] = ch === '.' ? 0 : ch === '#' ? 1 : Number(ch);
    });
  });
  return world;
}

// A world where every cell is alive and owned by player 1.
export function fullWorld(rows: number, cols: number, options: WorldOptions = {}): World {
  const world = worldFrom(
    Array.from({ length: rows }, () => '.'.repeat(cols)),
    options,
  );
  world.main.fill(1);
  return world;
}

// The reverse of worldFrom: draws the current generation.
export function pictureOf(world: World): string[] {
  const lines: string[] = [];
  for (let row = 0; row < world.rows; row++) {
    let line = '';
    for (let col = 0; col < world.cols; col++) {
      const owner = world.main[row * world.cols + col] ?? 0;
      line += owner === 0 ? '.' : owner === 1 ? '#' : String(owner);
    }
    lines.push(line);
  }
  return lines;
}

export function ownerAt(world: World, row: number, col: number): number {
  return world.main[row * world.cols + col] ?? 0;
}

export function ageAt(world: World, row: number, col: number): number {
  return world.ageGrid?.[row * world.cols + col] ?? 0;
}

// Advances the world by a number of generations.
export function step(world: World, rules: Rules, generations = 1): void {
  for (let i = 0; i < generations; i++) updateWorld(world, rules);
}

// Conway's Life: B3/S23 with the 8 surrounding cells.
export const conway: Rules = { type: RULE_TYPE.SQUARE, range: 1, Birth: [3], Survival: [2, 3] };
