// The speed slider runs from 1 to 100. It maps to between 1 and 30 generations a second.
export const MIN_SPEED = 1;
export const MAX_SPEED = 100;
export const DEFAULT_SPEED = 50;

const SLOWEST = 1; // generations per second
const FASTEST = 30;

export function generationsPerSecond(speed: number): number {
  const clamped = Math.min(MAX_SPEED, Math.max(MIN_SPEED, speed));
  const fraction = (clamped - MIN_SPEED) / (MAX_SPEED - MIN_SPEED);
  return SLOWEST + fraction * (FASTEST - SLOWEST);
}

// Milliseconds between generations.
export function delayFor(speed: number): number {
  return Math.round(1000 / generationsPerSecond(speed));
}
