// Player colours: 8 hues, each with 8 shades from newborn (brightest) to oldest (dimmest).
// Each player has a distinct colour defined by a hue and a set of shades.
export type ShadeRange = [number, number];

export type PlayerColour = {
  name: string;
  hue: number;
  shades: readonly ShadeRange[];
};

const PLAYER_COLOURS: readonly PlayerColour[] = [
  {
    name: 'red',
    hue: 29,
    shades: [
      [0.625, 0.257],
      [0.582, 0.239],
      [0.539, 0.222],
      [0.496, 0.204],
      [0.453, 0.187],
      [0.41, 0.17],
      [0.367, 0.153],
      [0.325, 0.136],
    ],
  },
  {
    name: 'orange',
    hue: 60,
    shades: [
      [0.755, 0.177],
      [0.712, 0.167],
      [0.669, 0.157],
      [0.626, 0.147],
      [0.583, 0.137],
      [0.54, 0.127],
      [0.497, 0.118],
      [0.455, 0.108],
    ],
  },
  {
    name: 'yellow',
    hue: 105,
    shades: [
      [0.935, 0.198],
      [0.892, 0.189],
      [0.849, 0.18],
      [0.806, 0.171],
      [0.763, 0.162],
      [0.72, 0.153],
      [0.677, 0.144],
      [0.635, 0.135],
    ],
  },
  {
    name: 'green',
    hue: 145,
    shades: [
      [0.865, 0.272],
      [0.822, 0.259],
      [0.779, 0.245],
      [0.736, 0.232],
      [0.693, 0.218],
      [0.65, 0.205],
      [0.607, 0.192],
      [0.565, 0.178],
    ],
  },
  {
    name: 'teal',
    hue: 195,
    shades: [
      [0.9, 0.153],
      [0.857, 0.146],
      [0.814, 0.139],
      [0.771, 0.131],
      [0.728, 0.124],
      [0.685, 0.117],
      [0.642, 0.11],
      [0.6, 0.102],
    ],
  },
  {
    name: 'blue',
    hue: 262,
    shades: [
      [0.54, 0.253],
      [0.505, 0.237],
      [0.471, 0.222],
      [0.437, 0.207],
      [0.402, 0.192],
      [0.368, 0.177],
      [0.334, 0.163],
      [0.3, 0.15],
    ],
  },
  {
    name: 'purple',
    hue: 305,
    shades: [
      [0.57, 0.297],
      [0.531, 0.277],
      [0.492, 0.257],
      [0.454, 0.237],
      [0.415, 0.218],
      [0.377, 0.198],
      [0.338, 0.179],
      [0.3, 0.159],
    ],
  },
  {
    name: 'pink',
    hue: 350,
    shades: [
      [0.66, 0.274],
      [0.617, 0.258],
      [0.574, 0.24],
      [0.531, 0.223],
      [0.488, 0.205],
      [0.445, 0.187],
      [0.402, 0.17],
      [0.36, 0.153],
    ],
  },
];

export class Palette {
  static readonly playerCount = PLAYER_COLOURS.length;
  static readonly shadeCount = PLAYER_COLOURS[0]?.shades.length ?? 0;

  // CSS colour strings, indexed [player][shade].
  private readonly css: readonly (readonly string[])[];

  constructor() {
    this.css = PLAYER_COLOURS.map((player) =>
      player.shades.map(([lightness, chroma]) => `oklch(${lightness} ${chroma} ${player.hue})`),
    );
  }

  private playerIndex(owner: number): number {
    if (!Number.isInteger(owner) || owner < 1) {
      throw new RangeError(`Owner must be a player id of 1 or more, got ${owner}`);
    }
    // Players beyond the eighth reuse the colours from the start.
    return (owner - 1) % Palette.playerCount;
  }

  // The colour name for a player, e.g. 'red'.
  name(owner: number): string {
    return PLAYER_COLOURS[this.playerIndex(owner)]?.name ?? '';
  }

  // Which shade (0 = newborn, 7 = oldest) a cell of this age gets, spread evenly over the lifespan.
  shadeFor(age: number, lifespan: number): number {
    if (lifespan <= 1) return 0;
    const shadeCount = Palette.shadeCount;
    const shade = Math.floor((age * shadeCount) / lifespan);
    return Math.min(shadeCount - 1, Math.max(0, shade));
  }

  // A specific shade of a player's colour, as a CSS colour string.
  shade(owner: number, shade: number): string {
    const colour = this.css[this.playerIndex(owner)]?.[shade];
    if (colour === undefined)
      throw new RangeError(`Shade must be 0 to ${Palette.shadeCount - 1}, got ${shade}`);
    return colour;
  }

  // The colour for a cell of the given owner and age.
  colour(owner: number, age: number, lifespan: number): string {
    return this.shade(owner, this.shadeFor(age, lifespan));
  }
}
