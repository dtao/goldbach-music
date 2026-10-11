import { describe, expect, it } from 'vitest';
import { isPrime } from '../src/math/primes';
import { compose } from '../src/shapes/compose';
import { isConnected, key, sharedEdges, shapeFor } from '../src/shapes/polyomino';

const primes = Array.from({ length: 500 }, (_, i) => i).filter(isPrime);
const canonical = (cells: readonly (readonly [number, number])[]) =>
  cells.map(([x, y]) => key(x, y)).sort().join(' ');

describe('prime shapes', () => {
  it('are connected polyominoes of p distinct cells', () => {
    for (const p of primes) {
      const s = shapeFor(p);
      expect(s).toHaveLength(p);
      expect(new Set(s.map(([x, y]) => key(x, y))).size).toBe(p);
      expect(isConnected(s)).toBe(true);
    }
  });

  it('are deterministic', () => {
    expect(canonical(shapeFor(97))).toBe(canonical(shapeFor(97)));
  });

  it('differ between primes of similar size', () => {
    const shapes = new Set(primes.filter((p) => p > 5).map((p) => canonical(shapeFor(p))));
    expect(shapes.size).toBe(primes.filter((p) => p > 5).length);
  });
});

describe('compose', () => {
  it('places shapes touching without overlap', () => {
    for (const [p, q] of [[2, 2], [3, 7], [5, 23], [3, 97], [113, 131]]) {
      const { large, small } = compose(shapeFor(q), shapeFor(p));
      const all = new Set([...large, ...small].map(([x, y]) => key(x, y)));
      expect(all.size).toBe(p + q);
      expect(sharedEdges(large, small)).toBeGreaterThan(0);
      expect(canonical(small.map(([x, y]) => [x - small[0][0], y - small[0][1]]))).toBe(
        canonical(shapeFor(p).map(([x, y]) => [x - shapeFor(p)[0][0], y - shapeFor(p)[0][1]])),
      );
    }
  });
});
