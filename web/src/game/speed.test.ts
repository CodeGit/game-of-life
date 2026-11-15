import { describe, expect, it } from 'vitest';
import { MAX_SPEED, MIN_SPEED, delayFor, generationsPerSecond } from './speed';

describe('generationsPerSecond', () => {
  it('is 1 at the slowest speed and 30 at the fastest', () => {
    expect(generationsPerSecond(MIN_SPEED)).toBe(1);
    expect(generationsPerSecond(MAX_SPEED)).toBe(30);
  });

  it('never goes outside that range, whatever the slider gives', () => {
    expect(generationsPerSecond(-10)).toBe(1);
    expect(generationsPerSecond(1000)).toBe(30);
  });
});

describe('delayFor', () => {
  it('is a second at the slowest speed and about 33 ms at the fastest', () => {
    expect(delayFor(MIN_SPEED)).toBe(1000);
    expect(delayFor(MAX_SPEED)).toBe(33);
  });

  it('shortens as the speed rises', () => {
    for (let speed = MIN_SPEED; speed < MAX_SPEED; speed++) {
      expect(delayFor(speed + 1)).toBeLessThanOrEqual(delayFor(speed));
    }
  });
});
