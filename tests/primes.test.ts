import { describe, expect, it } from 'vitest';
import { classify, goldbachPair, isPrime, primeIndex } from '../src/math/primes';

describe('primes', () => {
  it('identifies primes', () => {
    const primes = Array.from({ length: 50 }, (_, i) => i).filter(isPrime);
    expect(primes).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]);
  });

  it('indexes primes from 1', () => {
    expect([2, 3, 5, 7, 11, 13].map(primeIndex)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(() => primeIndex(9)).toThrow();
  });

  it('picks the most balanced Goldbach pair', () => {
    expect(goldbachPair(4)).toEqual([2, 2]);
    expect(goldbachPair(6)).toEqual([3, 3]);
    expect(goldbachPair(10)).toEqual([5, 5]);
    expect(goldbachPair(12)).toEqual([5, 7]);
    expect(goldbachPair(28)).toEqual([11, 17]);
    expect(goldbachPair(98)).toEqual([37, 61]);
    for (let n = 4; n <= 2000; n += 2) {
      const [p, q] = goldbachPair(n);
      expect(isPrime(p) && isPrime(q) && p + q === n && p <= q).toBe(true);
    }
  });

  it('classifies numbers', () => {
    expect([1, 2, 4, 9, 11].map(classify)).toEqual(['one', 'prime', 'even', 'composite', 'prime']);
  });
});
