import { describe, expect, it } from 'vitest';
import type { WorldOptions } from './types';
import { createWorld, randomiseWorld } from './world';
import { pictureOf, worldFrom } from './testing';

const options: WorldOptions = { id: 'test', rows: 10, cols: 10, wrap: false, age: false, seed: 1 };

const liveCells = (cells: Uint8Array) => cells.filter((owner) => owner > 0).length;

describe('createWorld', () => {
  it('world is initialised at generation 0', () => {
    const world = createWorld(options);
    expect(world.generation).toBe(0);
  });

  it('makes an empty world of the right size', () => {
    const world = createWorld(options);
    expect(world.rows).toBe(10);
    expect(world.cols).toBe(10);
    expect(world.main).toHaveLength(100);
    expect(world.buffer).toHaveLength(100);
    expect(liveCells(world.main)).toBe(0);
  });

  it('uses the defaults for lifespan and the age layer', () => {
    const world = createWorld(options);
    expect(world.lifespan).toBe(255);
    expect(world.ageGrid).toBeNull();
    expect(createWorld({ ...options, age: true }).ageGrid).toHaveLength(100);
  });

  it('keeps the options it was given', () => {
    const world = createWorld({ ...options, id: 'x', wrap: true, lifespan: 7, seed: 42 });
    expect(world.id).toBe('x');
    expect(world.wrap).toBe(true);
    expect(world.lifespan).toBe(7);
    expect(world.seed).toBe(42);
  });
});

describe('density when creating a world', () => {
  it('0 leaves the world empty', () => {
    expect(liveCells(createWorld({ ...options, density: 0 }).main)).toBe(0);
  });

  it('1 fills every cell', () => {
    expect(liveCells(createWorld({ ...options, density: 1 }).main)).toBe(100);
  });

  it('a middle density fills some but not all cells', () => {
    const live = liveCells(createWorld({ ...options, density: 0.5 }).main);
    expect(live).toBeGreaterThan(20);
    expect(live).toBeLessThan(80);
  });

  it('all cells are colour 1 by default', () => {
    const world = createWorld({ ...options, density: 1 });
    expect(new Set(world.main)).toEqual(new Set([1]));
  });

  it('shares the cells between colours, and no one else', () => {
    const world = createWorld({ ...options, density: 1, colours: 3 });
    expect(new Set(world.main)).toEqual(new Set([1, 2, 3]));
  });

  it('starts every new cell at age 0', () => {
    const world = createWorld({ ...options, age: true, density: 1 });
    expect(liveCells(world.ageGrid ?? new Uint8Array())).toBe(0);
  });
});

describe('seeds', () => {
  it('the same seed gives the same board', () => {
    const a = createWorld({ ...options, density: 0.4, colours: 2, seed: 7 });
    const b = createWorld({ ...options, density: 0.4, colours: 2, seed: 7 });
    expect(pictureOf(a)).toEqual(pictureOf(b));
  });

  it('a different seed gives a different board', () => {
    const a = createWorld({ ...options, density: 0.4, seed: 7 });
    const b = createWorld({ ...options, density: 0.4, seed: 8 });
    expect(pictureOf(a)).not.toEqual(pictureOf(b));
  });
});

describe('randomiseWorld', () => {
  it('never overwrites a live cell', () => {
    const world = worldFrom([
      '#...', //
      '.2..',
      '....',
      '...#',
    ]);
    randomiseWorld(world, 1, 3);
    const picture = pictureOf(world);
    expect(picture[0]?.[0]).toBe('#');
    expect(picture[1]?.[1]).toBe('2');
    expect(picture[3]?.[3]).toBe('#');
  });

  it('fills the dead cells at density 1', () => {
    const world = worldFrom([
      '#...', //
      '....',
      '....',
      '....',
    ]);
    randomiseWorld(world, 1);
    expect(liveCells(world.main)).toBe(16);
  });

  it('changes nothing at density 0', () => {
    const picture = [
      '#...', //
      '.2..',
      '....',
      '...#',
    ];
    const world = worldFrom(picture);
    randomiseWorld(world, 0);
    expect(pictureOf(world)).toEqual(picture);
  });
});
