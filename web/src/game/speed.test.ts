import { describe, expect, it } from 'vitest';
import { DEFAULT_SPEED, MAX_SPEED, MIN_SPEED, delayFor, generationsPerSecond } from './speed';

describe('generationsPerSecond', () => {
  it('is 1 at the slowest speed and 30 at the fastest', () => {
    expect(generationsPerSecond(MIN_SPEED)).toBe(1);
    expect(generationsPerSecond(MAX_SPEED)).toBe(30);
  });

  it('rises with the speed', () => {
    for (let speed = MIN_SPEED; speed < MAX_SPEED; speed++) {
      expect(generationsPerSecond(speed + 1)).toBeGreaterThan(generationsPerSecond(speed));
    }
  });

  it('stays in range for speeds outside the slider', () => {
    expect(generationsPerSecond(-10)).toBe(1);
    expect(generationsPerSecond(0)).toBe(1);
    expect(generationsPerSecond(1000)).toBe(30);
  });
});

describe('delayFor', () => {
  it('is a second at the slowest speed', () => {
    expect(delayFor(MIN_SPEED)).toBe(1000);
  });

  it('is about 33 ms at the fastest speed', () => {
    expect(delayFor(MAX_SPEED)).toBe(33);
  });

  it('shortens as the speed rises', () => {
    for (let speed = MIN_SPEED; speed < MAX_SPEED; speed++) {
      expect(delayFor(speed + 1)).toBeLessThanOrEqual(delayFor(speed));
    }
  });

  it('is a whole number of milliseconds, and never zero', () => {
    for (let speed = MIN_SPEED; speed <= MAX_SPEED; speed++) {
      expect(Number.isInteger(delayFor(speed))).toBe(true);
      expect(delayFor(speed)).toBeGreaterThan(0);
    }
  });

  it('starts at a middling pace', () => {
    expect(delayFor(DEFAULT_SPEED)).toBeGreaterThan(delayFor(MAX_SPEED));
    expect(delayFor(DEFAULT_SPEED)).toBeLessThan(delayFor(MIN_SPEED));
  });
});
