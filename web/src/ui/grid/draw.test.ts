import { describe, expect, it, vi } from 'vitest';
import { worldFrom } from '@/engine/testing';
import { Palette } from '@/ui/palette';
import { drawWorld } from './draw';

type Rect = { x: number; y: number; w: number; h: number; style: string };

// A stand-in for a canvas context that records what was drawn.
function fakeContext() {
  const rects: Rect[] = [];
  const clearRect = vi.fn();
  const context = {
    fillStyle: '',
    clearRect,
    fillRect(x: number, y: number, w: number, h: number) {
      rects.push({ x, y, w, h, style: context.fillStyle });
    },
  };
  return { context: context as unknown as CanvasRenderingContext2D, rects, clearRect };
}

const palette = new Palette();

describe('drawWorld', () => {
  it('clears the whole canvas first', () => {
    const { context, clearRect } = fakeContext();
    drawWorld(context, worldFrom(['....', '....', '....']), 10, palette); // 3 rows x 4 columns
    expect(clearRect).toHaveBeenCalledWith(0, 0, 40, 30);
  });

  it('draws nothing for an empty world', () => {
    const { context, rects } = fakeContext();
    drawWorld(context, worldFrom(['..', '..']), 10, palette);
    expect(rects).toHaveLength(0);
  });

  it('draws one square for each live cell, at its position', () => {
    const { context, rects } = fakeContext();
    drawWorld(context, worldFrom(['#.', '.#']), 10, palette);
    expect(rects.map(({ x, y }) => [x, y])).toEqual([
      [0, 0],
      [10, 10],
    ]);
  });

  it('puts columns across and rows down', () => {
    const { context, rects } = fakeContext();
    drawWorld(context, worldFrom(['...#', '....']), 10, palette); // row 0, column 3
    expect(rects.map(({ x, y }) => [x, y])).toEqual([[30, 0]]);
  });
});

describe('drawWorld: the gap between cells', () => {
  const sizeAt = (cellSize: number) => {
    const { context, rects } = fakeContext();
    drawWorld(context, worldFrom(['#']), cellSize, palette);
    return rects[0]?.w;
  };

  it('leaves a 1px gap once cells are 6px or bigger', () => {
    expect(sizeAt(6)).toBe(5);
    expect(sizeAt(25)).toBe(24);
  });

  it('fills the whole cell when they are smaller', () => {
    expect(sizeAt(5)).toBe(5);
    expect(sizeAt(1)).toBe(1);
  });

  it('draws squares', () => {
    const { context, rects } = fakeContext();
    drawWorld(context, worldFrom(['#']), 10, palette);
    expect(rects[0]?.w).toBe(rects[0]?.h);
  });
});

describe('drawWorld: colours', () => {
  it('colours each cell by its owner', () => {
    const { context, rects } = fakeContext();
    drawWorld(context, worldFrom(['12']), 10, palette);
    expect(rects[0]?.style).toBe(palette.shade(1, 0));
    expect(rects[1]?.style).toBe(palette.shade(2, 0));
    expect(rects[0]?.style).not.toBe(rects[1]?.style);
  });

  it('uses the newborn shade when there is no age layer', () => {
    const { context, rects } = fakeContext();
    drawWorld(context, worldFrom(['#']), 10, palette);
    expect(rects[0]?.style).toBe(palette.shade(1, 0));
  });

  it('uses a dimmer shade for an older cell', () => {
    const world = worldFrom(['##'], { age: true, lifespan: 8 });
    if (world.ageGrid) world.ageGrid[1] = 7; // the second cell is nearly at the end of its life
    const { context, rects } = fakeContext();
    drawWorld(context, world, 10, palette);
    expect(rects[0]?.style).toBe(palette.shade(1, 0));
    expect(rects[1]?.style).toBe(palette.shade(1, 7));
  });
});
