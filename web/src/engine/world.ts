import mulberry32 from './rng';
import { RULE_TYPE } from './types';
import type { AgeGrid, Grid, Rules, World } from './types';

function getWinners(neighbours: NeighbourCount): number[] {
  const maxCount = Math.max(...Object.values(neighbours.perPlayerCount));
  const winners = Object.entries(neighbours.perPlayerCount)
    .filter(([, count]) => count === maxCount)
    .map(([playerId]) => Number(playerId));
  return winners;
}

function createGrid(rows: number, cols: number): Grid {
  const grid: Grid = new Uint8Array(rows * cols);
  return grid;
}

function createAgeGrid(rows: number, cols: number): AgeGrid {
  const grid: AgeGrid = new Uint8Array(rows * cols);
  return grid;
}

export function createWorld(
  id: string,
  rows: number,
  cols: number,
  age: boolean,
  wrap: boolean,
  lifespan = 255,
  seed: number = Date.now(),
): World {
  const main = createGrid(rows, cols);
  const buffer = createGrid(rows, cols);
  const ageGrid = age ? createAgeGrid(rows, cols) : null;
  const world: World = {
    id,
    main,
    buffer,
    ageGrid,
    rows,
    cols,
    rng: mulberry32(seed),
    seed,
    wrap,
    lifespan,
    rangeLimit: Math.floor(Math.min(rows, cols) / 2), // Maximum range for neighborhood calculations
  };
  return world;
}

function runNeighbourTest(rules: Rules): NeighbourTest {
  switch (rules.type) {
    case RULE_TYPE.CIRCLE:
      return circleTest(rules.range);
    case RULE_TYPE.SQUARE:
      return squareTest;
    case RULE_TYPE.DIAMOND:
      return diamondTest(rules.range);
    case RULE_TYPE.USER_DEFINED:
      throw new Error('USER_DEFINED neighbourhoods are not implemented yet');
    default: {
      const unreachable: never = rules.type;
      throw new Error(`Unhandled rule type: ${unreachable}`);
    }
  }
}

// Picks the owner of a newborn cell: the majority owner among its neighbours,
// with ties broken by the world's seeded RNG (drawn only when there is a tie).
// Returns 0 (stays dead) if there are no live neighbours to inherit from.
function pickWinner(world: World, neighbours: NeighbourCount): number {
  const winners = getWinners(neighbours);
  const first = winners[0];
  if (first === undefined) return 0;
  if (winners.length === 1) return first;
  return winners[Math.floor(world.rng() * winners.length)] ?? first;
}

// Advances the world by one generation, then swaps the buffers.
export function updateWorld(world: World, rules: Rules): void {
  const { rows, cols, main, buffer, ageGrid } = world;
  const isNeighbourValid = runNeighbourTest(rules);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col;
      const cell = main[i] ?? 0;
      const neighbours = countNeighbors(world, row, col, rules.range, isNeighbourValid);

      // Every cell is written, so nothing stale is left in the buffer.
      let next = 0;
      if (cell > 0) {
        // Survival applies to live cells and keeps the owner.
        if (rules.Survival.includes(neighbours.total)) next = cell;
      } else if (rules.Birth.includes(neighbours.total)) {
        next = pickWinner(world, neighbours);
      }

      if (ageGrid) {
        // Survivors age (and die when age == lifespan); newborn and dead cells reset to 0.
        if (cell === 0 && next > 0) {
          ageGrid[i] = 0; // reset age for newborn cell
        } else if (cell > 0 && next > 0 && (ageGrid[i] ?? 0) + 1 < world.lifespan) {
          ageGrid[i] = (ageGrid[i] ?? 0) + 1;
        } else {
          // kill the cell if it has reached its lifespan
          ageGrid[i] = 0; // reset age
          next = 0; // kill the cell
        }
      }
      buffer[i] = next;
    }
  }

  world.main = buffer;
  world.buffer = main;
}

// Decides whether the neighbour at offset (r, c) from a cell is counted.
type NeighbourTest = (r: number, c: number) => boolean;
type NeighbourCount = {
  total: number;
  perPlayerCount: {
    [playerId: number]: number;
  };
};

export const squareTest: NeighbourTest = () => true;

export function circleTest(range: number): NeighbourTest {
  const rangeSquared = range * range;
  return (r, c) => r * r + c * c <= rangeSquared;
}

export function diamondTest(range: number): NeighbourTest {
  return (r, c) => Math.abs(r) + Math.abs(c) <= range;
}

export function countNeighbors(
  world: World,
  row: number,
  col: number,
  range: number,
  isNeighbourValid: NeighbourTest,
): NeighbourCount {
  const count: NeighbourCount = { total: 0, perPlayerCount: {} };
  for (let r = -range; r <= range; r++) {
    for (let c = -range; c <= range; c++) {
      if (r === 0 && c === 0) continue;
      if (!isNeighbourValid(r, c)) continue;
      let nr = row + r;
      let nc = col + c;
      if (world.wrap) {
        nr = ((nr % world.rows) + world.rows) % world.rows;
        nc = ((nc % world.cols) + world.cols) % world.cols;
      } else if (nr < 0 || nr >= world.rows || nc < 0 || nc >= world.cols) {
        continue;
      }
      const cell = world.main[nr * world.cols + nc];
      count.total += cell && cell > 0 ? 1 : 0;
      if (cell && cell > 0) {
        count.perPlayerCount[cell] = (count.perPlayerCount[cell] || 0) + 1;
      }
    }
  }
  return count;
}
