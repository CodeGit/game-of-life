import { describe, expect, it } from 'vitest';
import {
  CONWAY,
  DEFAULT_RULE_ID,
  RULE_PRESETS,
  findPreset,
  parseRuleString,
  ruleString,
} from './rules';
import { fullWorld, pictureOf, step, worldFrom } from './testing';
import { RULE_TYPE } from './types';

describe('parseRuleString', () => {
  it('reads birth and survival counts', () => {
    expect(parseRuleString('B3/S23')).toEqual({
      type: RULE_TYPE.SQUARE,
      range: 1,
      Birth: [3],
      Survival: [2, 3],
    });
  });

  it('accepts an empty survival list', () => {
    expect(parseRuleString('B2/S').Survival).toEqual([]);
  });

  it('accepts an empty birth list', () => {
    expect(parseRuleString('B/S23').Birth).toEqual([]);
  });

  it('is not case sensitive and ignores surrounding spaces', () => {
    expect(parseRuleString(' b36/s23 ')).toEqual(parseRuleString('B36/S23'));
  });

  it('can set the neighbourhood and range', () => {
    const rules = parseRuleString('B3/S23', RULE_TYPE.DIAMOND, 2);
    expect(rules.type).toBe(RULE_TYPE.DIAMOND);
    expect(rules.range).toBe(2);
  });

  it.each(['', 'B3', '3/23', 'B3S23', 'B3/S2x', 'S23/B3'])('rejects "%s"', (text) => {
    expect(() => parseRuleString(text)).toThrow(/Invalid rule/);
  });
});

describe('ruleString', () => {
  it('is the reverse of parseRuleString', () => {
    for (const notation of ['B3/S23', 'B2/S', 'B3678/S34678']) {
      expect(ruleString(parseRuleString(notation))).toBe(notation);
    }
  });
});

describe('RULE_PRESETS', () => {
  it('has unique ids and names', () => {
    expect(new Set(RULE_PRESETS.map((p) => p.id)).size).toBe(RULE_PRESETS.length);
    expect(new Set(RULE_PRESETS.map((p) => p.name)).size).toBe(RULE_PRESETS.length);
  });

  it('only counts neighbours that are possible', () => {
    for (const { rules } of RULE_PRESETS) {
      for (const count of [...rules.Birth, ...rules.Survival]) {
        expect(count).toBeGreaterThanOrEqual(0);
        expect(count).toBeLessThanOrEqual(8);
      }
    }
  });

  it('describes every preset', () => {
    for (const p of RULE_PRESETS) {
      expect(p.name).not.toBe('');
      expect(p.description).not.toBe('');
    }
  });

  it('includes the default rule, which is Conway', () => {
    expect(findPreset(DEFAULT_RULE_ID)?.rules).toEqual(CONWAY);
    expect(ruleString(CONWAY)).toBe('B3/S23');
  });

  it('finds a preset by id, and nothing for an unknown id', () => {
    expect(findPreset('highlife')?.name).toBe('HighLife');
    expect(findPreset('nonsense')).toBeUndefined();
  });
});

describe('rules in play', () => {
  const blinker = ['.....', '.....', '.###.', '.....', '.....'];

  it('Conway turns a blinker on its side', () => {
    const world = worldFrom(blinker);
    step(world, CONWAY);
    expect(pictureOf(world)).toEqual(['.....', '..#..', '..#..', '..#..', '.....']);
  });

  it('Seeds kills every cell that was alive', () => {
    const seeds = RULE_PRESETS.find((p) => p.id === 'seeds')!.rules;
    const world = worldFrom(['.....', '..#..', '.....']);
    step(world, seeds);
    expect(world.main[1 * 5 + 2]).toBe(0);
  });

  it('Life without Death never removes a cell', () => {
    const rules = RULE_PRESETS.find((p) => p.id === 'no-death')!.rules;
    const world = worldFrom(blinker);
    const alive = [...world.main].map((cell) => cell > 0);
    step(world, rules, 5);
    alive.forEach((wasAlive, i) => {
      if (wasAlive) expect(world.main[i]).toBeGreaterThan(0);
    });
  });

  it('rules can be changed between generations', () => {
    const world = worldFrom(blinker);
    step(world, CONWAY); // vertical blinker
    step(world, RULE_PRESETS.find((p) => p.id === 'seeds')!.rules);
    expect(pictureOf(world)).not.toEqual(['.....', '..#..', '..#..', '..#..', '.....']);
  });

  it('a full world under Conway is overcrowded and dies on a bounded board', () => {
    const world = fullWorld(5, 5, { wrap: false });
    step(world, CONWAY);
    expect(world.main[2 * 5 + 2]).toBe(0); // the centre cell has 8 neighbours
  });
});
