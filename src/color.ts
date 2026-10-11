import { primeIndex } from './math/primes';

export const GREY = 'hsl(220, 8%, 46%)';

/** Golden-angle hue on the prime's index; `variant` lightens repeat copies (e.g. 4 = 2 + 2). */
export function primeColor(p: number, variant = 0): string {
  const hue = (primeIndex(p) * 137.508) % 360;
  return `hsl(${hue.toFixed(1)}, 78%, ${58 + variant * 14}%)`;
}
