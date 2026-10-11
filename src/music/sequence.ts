import { classify } from '../math/primes';

/** Beats each number occupies: primes linger an extra beat. */
export function beatsFor(n: number): number {
  return classify(n) === 'prime' ? 2 : 1;
}

/** Walking bass: root – fifth – octave – fifth, advancing with n. */
const BASS_PATTERN = [0, 7, 12, 7];
export const BASS_ROOT_HZ = 55; // A1

export function bassHz(n: number): number {
  return BASS_ROOT_HZ * 2 ** (BASS_PATTERN[(n - 1) % BASS_PATTERN.length] / 12);
}

export function nextNumber(n: number, cap: number): number {
  return n >= cap ? 1 : n + 1;
}
