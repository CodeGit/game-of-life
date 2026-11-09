import { describe, expect, it } from 'vitest';
import { Palette } from './palette';

const palette = new Palette();

describe('Palette', () => {
  it('has 8 colours with 8 shades each, all different', () => {
    const all = new Set<string>();
    for (let owner = 1; owner <= Palette.playerCount; owner++) {
      for (let shade = 0; shade < Palette.shadeCount; shade++) {
        all.add(palette.shade(owner, shade));
      }
    }
    expect(Palette.playerCount).toBe(8);
    expect(Palette.shadeCount).toBe(8);
    expect(all.size).toBe(64);
  });

  it('names the players in order', () => {
    const names = Array.from({ length: 8 }, (_, i) => palette.name(i + 1));
    expect(names).toEqual(['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink']);
  });

  it('gives CSS oklch strings', () => {
    expect(palette.shade(1, 0)).toMatch(/^oklch\(0\.\d+ 0\.\d+ \d+\)$/);
  });

  it('gets dimmer as the shade increases', () => {
    const lightness = (colour: string) => Number(/^oklch\(([\d.]+)/.exec(colour)?.[1]);
    for (let owner = 1; owner <= 8; owner++) {
      for (let shade = 1; shade < 8; shade++) {
        expect(lightness(palette.shade(owner, shade))).toBeLessThan(
          lightness(palette.shade(owner, shade - 1)),
        );
      }
    }
  });

  it('reuses the colours for players beyond the eighth', () => {
    expect(palette.shade(9, 3)).toBe(palette.shade(1, 3));
    expect(palette.name(10)).toBe('orange');
  });

  it('rejects owner 0 (a dead cell) and other bad ids', () => {
    expect(() => palette.shade(0, 0)).toThrow(RangeError);
    expect(() => palette.shade(-1, 0)).toThrow(RangeError);
    expect(() => palette.shade(1.5, 0)).toThrow(RangeError);
  });

  it('rejects a shade outside 0 to 7', () => {
    expect(() => palette.shade(1, 8)).toThrow(RangeError);
    expect(() => palette.shade(1, -1)).toThrow(RangeError);
  });

  describe('shadeFor', () => {
    it('uses the first shade for a newborn and the last just before death', () => {
      expect(palette.shadeFor(0, 100)).toBe(0);
      expect(palette.shadeFor(99, 100)).toBe(7);
    });

    it('maps ages one to one when the lifespan is 8', () => {
      expect(Array.from({ length: 8 }, (_, age) => palette.shadeFor(age, 8))).toEqual([
        0, 1, 2, 3, 4, 5, 6, 7,
      ]);
    });

    it('spreads a longer lifespan evenly', () => {
      expect(Array.from({ length: 16 }, (_, age) => palette.shadeFor(age, 16))).toEqual([
        0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7,
      ]);
    });

    it('handles a lifespan of 1 or less, and ages out of range', () => {
      expect(palette.shadeFor(0, 1)).toBe(0);
      expect(palette.shadeFor(0, 0)).toBe(0);
      expect(palette.shadeFor(500, 100)).toBe(7);
      expect(palette.shadeFor(-3, 100)).toBe(0);
    });
  });

  it('colour() combines owner, age and lifespan', () => {
    expect(palette.colour(3, 0, 100)).toBe(palette.shade(3, 0));
    expect(palette.colour(3, 99, 100)).toBe(palette.shade(3, 7));
  });
});
