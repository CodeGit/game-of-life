import { describe, expect, it } from 'vitest';
import { MAX_CELL_SIZE, MIN_CELL_SIZE, fitSizeCell, zoomedCellSize } from './zoom';

const board = (rows: number, cols: number, width: number, height: number) => ({
  rows,
  cols,
  width,
  height,
});

describe('fitSizeCell', () => {
  it('is limited by the width when the board is wide', () => {
    expect(fitSizeCell(board(10, 100, 1000, 1000))).toBe(10);
  });

  it('is limited by the height when the board is tall', () => {
    expect(fitSizeCell(board(100, 10, 1000, 500))).toBe(5);
  });

  it('rounds down, so the board still fits', () => {
    expect(fitSizeCell(board(10, 10, 109, 109))).toBe(10);
  });

  it('is exactly the room divided by the cells when it divides evenly', () => {
    expect(fitSizeCell(board(10, 10, 300, 300))).toBe(30);
  });

  it('gives the smallest size when the board is too big to fit', () => {
    expect(fitSizeCell(board(500, 500, 400, 400))).toBe(2);
  });

  it('gives the smallest size when there is no room at all', () => {
    expect(fitSizeCell(board(10, 10, 0, 0))).toBe(2);
  });

  it('gives the biggest size when the board is tiny', () => {
    expect(fitSizeCell(board(3, 3, 2000, 2000))).toBe(40);
  });

  describe('with its own limits', () => {
    const limits = { minSize: 5, maxSize: 30 };

    it('uses the minimum it was given', () => {
      expect(fitSizeCell({ ...board(500, 500, 400, 400), ...limits })).toBe(5);
    });

    it('uses the maximum it was given', () => {
      expect(fitSizeCell({ ...board(3, 3, 2000, 2000), ...limits })).toBe(30);
    });

    it('leaves a size between the limits alone', () => {
      expect(fitSizeCell({ ...board(10, 10, 120, 120), ...limits })).toBe(12);
    });
  });
});

// These use the actual steps (2, 3, 4, 6, 7, 10, 12, 16, 20, 24, 30, 40), so change them if the steps change.
describe('zoomedCellSize', () => {
  it('steps in to the next size up', () => {
    expect(zoomedCellSize(10, true)).toBe(12);
  });

  it('steps out to the next size down', () => {
    expect(zoomedCellSize(10, false)).toBe(7);
  });

  it('steps from a size between two steps, such as one that came from a fit', () => {
    expect(zoomedCellSize(14, true)).toBe(16);
    expect(zoomedCellSize(14, false)).toBe(12);
  });

  it('stays put at the biggest size when zooming in', () => {
    expect(zoomedCellSize(40, true)).toBe(40);
  });

  it('stays put at the smallest size when zooming out', () => {
    expect(zoomedCellSize(2, false)).toBe(2);
  });

  it('never moves the wrong way, from any size', () => {
    for (let size = 1; size <= 50; size++) {
      expect(zoomedCellSize(size, true)).toBeGreaterThanOrEqual(size);
      expect(zoomedCellSize(size, false)).toBeLessThanOrEqual(size);
    }
  });

  it('steps in from the smallest to the biggest, one step at a time, without going back', () => {
    const visited = [2];
    for (let i = 0; i < 100 && visited.at(-1) !== 40; i++) {
      visited.push(zoomedCellSize(visited.at(-1)!, true));
    }
    expect(visited.at(-1)).toBe(40);
    expect(visited).toEqual([...visited].sort((a, b) => a - b));
    expect(new Set(visited).size).toBe(visited.length);
  });

  it('steps out from the biggest to the smallest, one step at a time, without going back', () => {
    const visited = [40];
    for (let i = 0; i < 100 && visited.at(-1) !== 2; i++) {
      visited.push(zoomedCellSize(visited.at(-1)!, false));
    }
    expect(visited.at(-1)).toBe(2);
    expect(visited).toEqual([...visited].sort((a, b) => b - a));
    expect(new Set(visited).size).toBe(visited.length);
  });

  it('visits the same sizes in and out', () => {
    const up = [2];
    while (up.at(-1) !== 40) up.push(zoomedCellSize(up.at(-1)!, true));
    const down = [40];
    while (down.at(-1) !== 2) down.push(zoomedCellSize(down.at(-1)!, false));
    expect(down.reverse()).toEqual(up);
  });
});

// The zoom steps and the size limits are written separately, so check they agree.
describe('the size limits and the zoom steps', () => {
  it('start and end at the smallest and biggest size', () => {
    expect(zoomedCellSize(MIN_CELL_SIZE - 1, true)).toBe(MIN_CELL_SIZE);
    expect(zoomedCellSize(MAX_CELL_SIZE + 1, false)).toBe(MAX_CELL_SIZE);
  });

  it('cannot go past either limit', () => {
    expect(zoomedCellSize(MAX_CELL_SIZE, true)).toBe(MAX_CELL_SIZE);
    expect(zoomedCellSize(MIN_CELL_SIZE, false)).toBe(MIN_CELL_SIZE);
  });

  it('are what a board gets when it is too big or too small to fit', () => {
    expect(fitSizeCell({ rows: 500, cols: 500, width: 400, height: 400 })).toBe(MIN_CELL_SIZE);
    expect(fitSizeCell({ rows: 3, cols: 3, width: 2000, height: 2000 })).toBe(MAX_CELL_SIZE);
  });
});
