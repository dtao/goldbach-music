import { primeIndex } from '../math/primes';

/** Major pentatonic over two octaves: digits 0–9 map onto exactly 10 degrees. */
const PENTATONIC = [0, 2, 4, 7, 9];
export const LEAD_ROOT_HZ = 220; // A3

export function degreeToSemitones(degree: number): number {
  return 12 * Math.floor(degree / 5) + PENTATONIC[degree % 5];
}

export function degreeToHz(degree: number, rootHz = LEAD_ROOT_HZ): number {
  return rootHz * 2 ** (degreeToSemitones(degree) / 12);
}

export interface MotifNote {
  degree: number;
  /** Start, as a fraction of the motif's duration. */
  start: number;
  /** Length, as a fraction of the motif's duration. */
  length: number;
}

export interface Motif {
  prime: number;
  notes: MotifNote[];
  /** Pulse-wave duty cycle, the chiptune "timbre". */
  duty: number;
}

const DUTIES = [0.125, 0.25, 0.5];
const digits = (n: number) => String(n).split('').map(Number);

/** Relative note lengths for a rhythmic variant. */
function rhythm(count: number, variant: number): number[] {
  const weights = Array<number>(count).fill(1);
  if (count > 1 && variant === 1) {
    // Long–short swing.
    for (let i = 0; i < count; i++) weights[i] = i % 2 === 0 ? 1.5 : 0.5;
  } else if (count > 1 && variant === 2) {
    // Quick pickup notes, then a held final note.
    weights[count - 1] = count;
  }
  return weights;
}

/**
 * Motif for prime p: the digits of p, then the digits of its index among the
 * primes, mapped to pentatonic degrees. The index picks rhythm and timbre.
 * E.g. 13 (the 6th prime) → degrees 1, 3, 6.
 */
export function motifFor(p: number): Motif {
  const k = primeIndex(p);
  const degrees = [...digits(p), ...digits(k)];
  const weights = rhythm(degrees.length, k % 3);
  const total = weights.reduce((a, b) => a + b, 0);
  let t = 0;
  const notes = degrees.map((degree, i) => {
    const note = { degree, start: t / total, length: weights[i] / total };
    t += weights[i];
    return note;
  });
  return { prime: p, notes, duty: DUTIES[Math.floor(k / 3) % DUTIES.length] };
}
