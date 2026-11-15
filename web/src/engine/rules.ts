import { RULE_TYPE } from './types';
import type { Rules } from './types';

// Rules are not part of a World: updateWorld takes them as an argument, so
// they can be swapped between any two generations.

// Parses the usual "B3/S23" notation: a cell is born with a neighbour count in
// the B list, and a live cell survives with a count in the S list.
export function parseRuleString(
  notation: string,
  type: Rules['type'] = RULE_TYPE.SQUARE,
  range = 1,
): Rules {
  const match = /^B(\d*)\/S(\d*)$/i.exec(notation.trim());
  if (!match) throw new Error(`Invalid rule: "${notation}" (expected something like B3/S23)`);
  const digits = (text: string | undefined) => [...(text ?? '')].map(Number);
  return { type, range, Birth: digits(match[1]), Survival: digits(match[2]) };
}

// The notation for a set of rules, the reverse of parseRuleString.
export function ruleString({ Birth, Survival }: Rules): string {
  return `B${Birth.join('')}/S${Survival.join('')}`;
}

export type RulePreset = {
  id: string;
  name: string;
  description: string;
  rules: Rules;
};

function preset(id: string, name: string, notation: string, description: string): RulePreset {
  return { id, name, description, rules: parseRuleString(notation) };
}

// Well-known life-like rules, all using the 8 surrounding cells.
const CLASSIC_PRESETS: RulePreset[] = [
  preset('conway', "Conway's Life", 'B3/S23', 'The classic. Gliders, oscillators and still lifes.'),
  preset(
    'highlife',
    'HighLife',
    'B36/S23',
    'Like Life, but with a small self-replicating pattern.',
  ),
  preset(
    'day-night',
    'Day & Night',
    'B3678/S34678',
    'Symmetrical: live and dead cells behave alike.',
  ),
  preset('seeds', 'Seeds', 'B2/S', 'Every cell dies each generation. Explosive growth.'),
  preset(
    'no-death',
    'Life without Death',
    'B3/S012345678',
    'Cells never die, so patterns only grow.',
  ),
  preset('2x2', '2x2', 'B36/S125', 'Favours blocky patterns built from 2x2 squares.'),
  preset('maze', 'Maze', 'B3/S12345', 'Grows into winding maze-like walls.'),
  preset('replicator', 'Replicator', 'B1357/S1357', 'Every pattern copies itself.'),
  preset('diamoeba', 'Diamoeba', 'B35678/S5678', 'Forms large, shifting diamond-shaped blobs.'),
  preset('anneal', 'Anneal', 'B4678/S35678', 'Smooths noise into large blobs with clean edges.'),
];

export const RULE_PRESETS: readonly RulePreset[] = CLASSIC_PRESETS;

export const DEFAULT_RULE_ID = 'conway';

export function findPreset(id: string): RulePreset | undefined {
  return RULE_PRESETS.find((p) => p.id === id);
}

// Conway's Life: B3/S23 with the 8 surrounding cells.
export const CONWAY: Rules = parseRuleString('B3/S23');
