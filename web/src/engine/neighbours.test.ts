import { describe, expect, it } from 'vitest';
import { circleTest, countNeighbors, diamondTest, squareTest } from './world';
import { fullWorld, worldFrom } from './testing';

const shapes = {
  square: () => squareTest,
  circle: circleTest,
  diamond: diamondTest,
};

describe('what is counted', () => {
  it('counts live neighbours', () => {
    const world = worldFrom(['###', '#.#', '###']);
    expect(countNeighbors(world, 1, 1, 1, squareTest).total).toBe(8);
  });

  it('ignores dead cells', () => {
    const world = worldFrom([
      '#..', //
      '.#.',
      '..#',
    ]);
    expect(countNeighbors(world, 1, 1, 1, squareTest).total).toBe(2);
  });

  it('does not count the cell itself', () => {
    const world = worldFrom([
      '...', //
      '.#.',
      '...',
    ]);
    expect(countNeighbors(world, 1, 1, 1, squareTest).total).toBe(0);
  });

  it('counts nothing in an empty world', () => {
    const world = worldFrom(['.....', '.....', '.....', '.....', '.....']);
    expect(countNeighbors(world, 2, 2, 2, squareTest).total).toBe(0);
  });
});

// Counts for every shape at range 1 and 2 on a full 5x5 world, looking from the
// middle, from a corner, and from a corner with wrapping.
const counts = [
  { shape: 'square', range: 1, middle: 8, corner: 3, cornerWrapped: 8 },
  { shape: 'square', range: 2, middle: 24, corner: 8, cornerWrapped: 24 },
  { shape: 'circle', range: 1, middle: 4, corner: 2, cornerWrapped: 4 },
  { shape: 'circle', range: 2, middle: 12, corner: 5, cornerWrapped: 12 },
  { shape: 'diamond', range: 1, middle: 4, corner: 2, cornerWrapped: 4 },
  { shape: 'diamond', range: 2, middle: 12, corner: 5, cornerWrapped: 12 },
] as const;

describe('neighbour counts on a full 5x5 world', () => {
  it.each(counts)('$shape range $range: middle cell has $middle', ({ shape, range, middle }) => {
    const world = fullWorld(5, 5);
    expect(countNeighbors(world, 2, 2, range, shapes[shape](range)).total).toBe(middle);
  });

  it.each(counts)(
    '$shape range $range: corner has $corner without wrap',
    ({ shape, range, corner }) => {
      const world = fullWorld(5, 5, { wrap: false });
      expect(countNeighbors(world, 0, 0, range, shapes[shape](range)).total).toBe(corner);
    },
  );

  it.each(counts)(
    '$shape range $range: corner has $cornerWrapped with wrap',
    ({ shape, range, cornerWrapped }) => {
      const world = fullWorld(5, 5, { wrap: true });
      expect(countNeighbors(world, 0, 0, range, shapes[shape](range)).total).toBe(cornerWrapped);
    },
  );
});

describe('wrapping', () => {
  // A 3 row x 5 column world, so rows and columns cannot be mixed up unnoticed.
  it('sees across the left edge', () => {
    const world = worldFrom(['....#', '.....', '.....'], { wrap: true });
    expect(countNeighbors(world, 0, 0, 1, diamondTest(1)).total).toBe(1);
  });

  it('sees across the top edge', () => {
    const world = worldFrom(['.....', '.....', '#....'], { wrap: true });
    expect(countNeighbors(world, 0, 0, 1, diamondTest(1)).total).toBe(1);
  });

  it('sees the opposite corner diagonally', () => {
    const world = worldFrom(['.....', '.....', '....#'], { wrap: true });
    expect(countNeighbors(world, 0, 0, 1, squareTest).total).toBe(1);
  });

  it('sees none of these without wrap', () => {
    for (const picture of [
      ['....#', '.....', '.....'],
      ['.....', '.....', '#....'],
      ['.....', '.....', '....#'],
    ]) {
      const world = worldFrom(picture, { wrap: false });
      expect(countNeighbors(world, 0, 0, 1, squareTest).total).toBe(0);
    }
  });
});

describe('per-player counts', () => {
  it('tallies live neighbours by owner', () => {
    const world = worldFrom([
      '11.', //
      '.2.', // the middle cell is not its own neighbour
      '..3',
    ]);
    const result = countNeighbors(world, 1, 1, 1, squareTest);
    expect(result.total).toBe(3);
    expect(result.perPlayerCount).toEqual({ 1: 2, 3: 1 });
  });

  it('only tallies neighbours inside the shape', () => {
    const world = worldFrom([
      '21.', // 2 is diagonal, 1 is straight above
      '...',
      '...',
    ]);
    expect(countNeighbors(world, 1, 1, 1, squareTest).perPlayerCount).toEqual({ 1: 1, 2: 1 });
    expect(countNeighbors(world, 1, 1, 1, diamondTest(1)).perPlayerCount).toEqual({ 1: 1 });
  });
});
