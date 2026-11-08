import { describe, expect, it, vi } from 'vitest';
import { RULE_TYPE } from './types';
import type { Rules } from './types';
import { ageAt, conway, ownerAt, pictureOf, step, worldFrom } from './testing';

describe('still lifes and oscillators (Conway rules)', () => {
  it('a block does not change', () => {
    const block = [
      '.....', //
      '.##..',
      '.##..',
      '.....',
      '.....',
    ];
    const world = worldFrom(block);
    step(world, conway);
    expect(pictureOf(world)).toEqual(block);
  });

  it('a blinker flips between horizontal and vertical', () => {
    const horizontal = [
      '.....', //
      '.....',
      '.###.',
      '.....',
      '.....',
    ];
    const vertical = [
      '.....', //
      '..#..',
      '..#..',
      '..#..',
      '.....',
    ];
    const world = worldFrom(horizontal);
    step(world, conway);
    expect(pictureOf(world)).toEqual(vertical);
    step(world, conway);
    expect(pictureOf(world)).toEqual(horizontal);
  });

  it('a lone cell dies and stays gone (no stale cells in the buffer)', () => {
    const world = worldFrom(['...', '.#.', '...']);
    step(world, conway);
    expect(pictureOf(world)).toEqual(['...', '...', '...']);
    step(world, conway);
    expect(pictureOf(world)).toEqual(['...', '...', '...']);
  });
});

describe('edges', () => {
  const vertical = [
    '.....', //
    '#....',
    '#....',
    '#....',
    '.....',
  ];

  it('without wrap, cells past the edge are dead', () => {
    const world = worldFrom(vertical, { wrap: false });
    step(world, conway);
    expect(pictureOf(world)).toEqual([
      '.....', //
      '.....',
      '##...',
      '.....',
      '.....',
    ]);
  });

  it('with wrap, the same pattern continues across the edge', () => {
    const world = worldFrom(vertical, { wrap: true });
    step(world, conway);
    expect(pictureOf(world)).toEqual([
      '.....', //
      '.....',
      '##..#',
      '.....',
      '.....',
    ]);
  });

  it('a glider travels once around a wrapped 6x6 world in 24 generations', () => {
    const glider = [
      '.#....', //
      '..#...',
      '###...',
      '......',
      '......',
      '......',
    ];
    const world = worldFrom(glider, { wrap: true });

    step(world, conway, 4);
    expect(pictureOf(world)).toEqual([
      '......', //
      '..#...',
      '...#..',
      '.###..',
      '......',
      '......',
    ]);

    step(world, conway, 20);
    expect(pictureOf(world)).toEqual(glider);
  });
});

describe('ownership', () => {
  it('survivors keep their owner', () => {
    const block = [
      '....', //
      '.22.',
      '.22.',
      '....',
    ];
    const world = worldFrom(block);
    step(world, conway);
    expect(pictureOf(world)).toEqual(block);
  });

  it('a newborn cell takes the majority owner of its neighbours', () => {
    const world = worldFrom([
      '11.', // two neighbours owned by 1...
      '2..', // ...and one owned by 2
      '...',
    ]);
    step(world, conway);
    expect(ownerAt(world, 1, 1)).toBe(1);
  });

  it('draws no random number when there is no tie', () => {
    const world = worldFrom(['11.', '2..', '...']);
    const rng = vi.fn(() => 0.5);
    world.rng = rng;
    step(world, conway);
    expect(rng).not.toHaveBeenCalled();
  });

  it('breaks a three-way tie with exactly one random draw', () => {
    const world = worldFrom([
      '123', // the middle cell below has one neighbour of each owner
      '...',
      '...',
    ]);
    const rng = vi.fn(() => 0.5);
    world.rng = rng;
    step(world, conway);
    expect(rng).toHaveBeenCalledTimes(1);
    expect([1, 2, 3]).toContain(ownerAt(world, 1, 1));
  });

  it('breaks ties the same way for the same seed', () => {
    const picture = ['123', '...', '...'];
    const first = worldFrom(picture, { seed: 42 });
    const second = worldFrom(picture, { seed: 42 });
    step(first, conway);
    step(second, conway);
    expect(ownerAt(first, 1, 1)).toBe(ownerAt(second, 1, 1));
  });

  it('can break the tie in favour of any of the tied owners', () => {
    const winners = new Set<number>();
    for (let seed = 1; seed <= 30; seed++) {
      const world = worldFrom(['123', '...', '...'], { seed });
      step(world, conway);
      winners.add(ownerAt(world, 1, 1));
    }
    expect([...winners].sort()).toEqual([1, 2, 3]);
  });
});

describe('neighbourhood shape in the rules', () => {
  // Birth with exactly 4 neighbours, nothing survives.
  const cornersOnly = ['#.#', '...', '#.#'];
  const fourNeighbours = (type: Rules['type']): Rules => ({
    type,
    range: 1,
    Birth: [4],
    Survival: [],
  });

  it('a square neighbourhood sees diagonal neighbours', () => {
    const world = worldFrom(cornersOnly);
    step(world, fourNeighbours(RULE_TYPE.SQUARE));
    expect(ownerAt(world, 1, 1)).toBe(1);
  });

  it('a diamond neighbourhood does not', () => {
    const world = worldFrom(cornersOnly);
    step(world, fourNeighbours(RULE_TYPE.DIAMOND));
    expect(ownerAt(world, 1, 1)).toBe(0);
  });

  it('refuses a user-defined neighbourhood for now', () => {
    const world = worldFrom(['...']);
    expect(() => step(world, { ...conway, type: RULE_TYPE.USER_DEFINED })).toThrow(
      /not implemented/,
    );
  });
});

describe('age', () => {
  it('survivors get older each generation', () => {
    const world = worldFrom(['....', '.##.', '.##.', '....'], { age: true });
    step(world, conway, 3);
    expect(ageAt(world, 1, 1)).toBe(3);
    expect(ageAt(world, 2, 2)).toBe(3);
    expect(ageAt(world, 0, 0)).toBe(0);
  });

  it('dies when it reaches its lifespan', () => {
    const block = ['....', '.##.', '.##.', '....'];
    const world = worldFrom(block, { age: true, maxAge: 3 });

    step(world, conway, 2);
    expect(pictureOf(world)).toEqual(block); // ages 0, 1, 2: still alive
    expect(ageAt(world, 1, 1)).toBe(2);

    step(world, conway);
    expect(pictureOf(world)).toEqual(['....', '....', '....', '....']); // gone
    expect(ageAt(world, 1, 1)).toBe(0);
  });

  it('newborn and dead cells go back to age 0', () => {
    const world = worldFrom(['.....', '.....', '.###.', '.....', '.....'], { age: true });
    step(world, conway); // the blinker's middle cell survives, the ends die, two cells are born
    expect(ageAt(world, 2, 2)).toBe(1);
    expect(ageAt(world, 2, 1)).toBe(0);
    expect(ageAt(world, 1, 2)).toBe(0);
  });
});
