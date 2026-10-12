/**
 * Deterministic pseudo-random number generator for reproducible 3D procedural placement.
 */
export function createSeededRandom(seed = 42) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;

  return function next(): number {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
