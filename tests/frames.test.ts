import { describe, expect, it } from 'vitest';
import { frameFor } from '../src/layout/frame';
import { planTransition } from '../src/layout/transition';

describe('frames', () => {
  it('have exactly n blocks with no overlaps', () => {
    for (let n = 1; n <= 300; n++) {
      const f = frameFor(n);
      expect(f.blocks).toHaveLength(n);
      expect(new Set(f.blocks.map((b) => `${b.x},${b.y}`)).size).toBe(n);
    }
  });

  it('describe even numbers as two prime pieces', () => {
    const f = frameFor(28);
    expect(f.primes).toEqual([5, 23]);
    expect(new Set(f.blocks.map((b) => b.piece))).toEqual(new Set(['23#0', '5#0']));
    expect(new Set(frameFor(4).blocks.map((b) => b.piece))).toEqual(new Set(['2#0', '2#1']));
  });

  it('render odd composites as grey blocks', () => {
    expect(frameFor(9).blocks.every((b) => b.piece === null)).toBe(true);
  });
});

describe('transitions', () => {
  it('add exactly one dropping block when counting up', () => {
    for (let n = 1; n < 100; n++) {
      const moves = planTransition(frameFor(n), frameFor(n + 1));
      expect(moves.filter((m) => !m.from)).toHaveLength(1);
      expect(moves.filter((m) => !m.to)).toHaveLength(0);
    }
  });

  it('move shared prime pieces rigidly', () => {
    // 12 = 5 + 7 and 18 = 5 + 13 share the 5-piece.
    const moves = planTransition(frameFor(12), frameFor(18)).filter((m) => m.rigid);
    expect(moves).toHaveLength(5);
    const offsets = new Set(moves.map((m) => `${m.to!.x - m.from!.x},${m.to!.y - m.from!.y}`));
    expect(offsets.size).toBe(1);
  });
});
