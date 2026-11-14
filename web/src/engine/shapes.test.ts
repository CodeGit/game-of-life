import { describe, expect, it } from 'vitest';
import { circleTest, diamondTest, squareTest } from './world';

// Draws a neighbourhood around a cell: 'o' is the cell, '#' is a neighbour, '.' is not.
function draw(test: (r: number, c: number) => boolean, range: number): string[] {
  const lines: string[] = [];
  for (let r = -range; r <= range; r++) {
    let line = '';
    for (let c = -range; c <= range; c++) {
      line += r === 0 && c === 0 ? 'o' : test(r, c) ? '#' : '.';
    }
    lines.push(line);
  }
  return lines;
}

describe('square neighbourhood', () => {
  it('range 1 is the 8 surrounding cells', () => {
    expect(draw(squareTest, 1)).toEqual([
      '###', //
      '#o#',
      '###',
    ]);
  });

  it('range 2 is the whole 5x5 block', () => {
    expect(draw(squareTest, 2)).toEqual([
      '#####', //
      '#####',
      '##o##',
      '#####',
      '#####',
    ]);
  });
});

describe('circle neighbourhood', () => {
  it('range 1 is the 4 orthogonal cells (diagonals are too far)', () => {
    expect(draw(circleTest(1), 1)).toEqual([
      '.#.', //
      '#o#',
      '.#.',
    ]);
  });

  it('range 2 cuts off the corners', () => {
    expect(draw(circleTest(2), 2)).toEqual([
      '..#..', //
      '.###.',
      '##o##',
      '.###.',
      '..#..',
    ]);
  });
});

describe('diamond neighbourhood', () => {
  it('range 1 is the 4 orthogonal cells', () => {
    expect(draw(diamondTest(1), 1)).toEqual([
      '.#.', //
      '#o#',
      '.#.',
    ]);
  });

  it('range 2 is a diamond', () => {
    expect(draw(diamondTest(2), 2)).toEqual([
      '..#..', //
      '.###.',
      '##o##',
      '.###.',
      '..#..',
    ]);
  });
});

describe('circle versus diamond', () => {
  it('are the same at ranges 1 and 2', () => {
    for (const range of [1, 2]) {
      expect(draw(circleTest(range), range)).toEqual(draw(diamondTest(range), range));
    }
  });

  it('differ from range 3, where the circle is rounder', () => {
    expect(draw(circleTest(3), 3)).toEqual([
      '...#...', //
      '.#####.',
      '.#####.',
      '###o###',
      '.#####.',
      '.#####.',
      '...#...',
    ]);
    expect(draw(diamondTest(3), 3)).toEqual([
      '...#...', //
      '..###..',
      '.#####.',
      '###o###',
      '.#####.',
      '..###..',
      '...#...',
    ]);
  });
});
