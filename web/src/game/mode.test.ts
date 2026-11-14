import { describe, expect, it } from 'vitest';
import { MODE, MODE_MESSAGES } from './mode';

describe('game modes', () => {
  it('has a distinct value for every mode', () => {
    const values = Object.values(MODE);
    expect(new Set(values).size).toBe(values.length);
  });

  it('has a message for every mode', () => {
    for (const mode of Object.values(MODE)) {
      expect(MODE_MESSAGES[mode]).toBeTruthy();
    }
  });

  it('has no messages for modes that do not exist', () => {
    expect(Object.keys(MODE_MESSAGES).sort()).toEqual(Object.values(MODE).sort());
  });
});
