export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

const primeIndexCache = new Map<number, number>();

/** 1-based index of a prime among the primes: 2 → 1, 3 → 2, 5 → 3, … */
export function primeIndex(p: number): number {
  if (!isPrime(p)) throw new Error(`${p} is not prime`);
  const cached = primeIndexCache.get(p);
  if (cached !== undefined) return cached;
  let k = 0;
  for (let i = 2; i <= p; i++) if (isPrime(i)) k++;
  primeIndexCache.set(p, k);
  return k;
}

/**
 * Goldbach decomposition of an even n ≥ 4: n = p + q with p ≤ q both prime
 * and the pair as balanced as possible (p closest to n/2).
 */
export function goldbachPair(n: number): [number, number] {
  if (n < 4 || n % 2 !== 0) throw new Error(`${n} is not an even number ≥ 4`);
  for (let p = n / 2; p >= 2; p--) {
    if (isPrime(p) && isPrime(n - p)) return [p, n - p];
  }
  throw new Error(`No Goldbach pair for ${n} — you just disproved the conjecture!`);
}

export type NumberKind = 'one' | 'prime' | 'even' | 'composite';

export function classify(n: number): NumberKind {
  if (n === 1) return 'one';
  if (isPrime(n)) return 'prime';
  if (n % 2 === 0) return 'even';
  return 'composite';
}
