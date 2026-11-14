// This pseudo-random number generator is based on the Mulberry32 algorithm.
// It produces a deterministic sequence of pseudo-random numbers based on the seed.
// It's just used as a tie breaker when the game logic requires a random choice.

export default function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
