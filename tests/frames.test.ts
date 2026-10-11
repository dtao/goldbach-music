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
    expect(f.primes).toEqual([11, 17]);
    expect(new Set(f.blocks.map((b) => b.piece))).toEqual(new Set(['17#0', '11#0']));
    expect(new Set(frameFor(4).blocks.map((b) => b.piece))).toEqual(new Set(['2#0', '2#1']));
  });

  it('render odd composites as grey blocks', () => {
    expect(frameFor(9).blocks.every((b) => b.piece === null)).toBe(true);
  });
});

const ORIGIN = { x: 0, y: 0 };
const moved = (m: { from: { x: number; y: number } | null; to: { x: number; y: number } | null }) =>
  m.from && m.to && (m.from.x !== m.to.x || m.from.y !== m.to.y);

describe('transitions', () => {
  it('add exactly one dropping block when counting up', () => {
    for (let n = 1; n < 150; n++) {
      const { moves } = planTransition(frameFor(n), ORIGIN, frameFor(n + 1));
      expect(moves).toHaveLength(n + 1);
      expect(moves.filter((m) => !m.from)).toHaveLength(1);
      expect(moves.filter((m) => !m.to)).toHaveLength(0);
    }
  });

  it('keep most blocks in place when counting up', () => {
    let total = 0;
    let stayed = 0;
    for (let n = 2; n < 300; n++) {
      const { moves } = planTransition(frameFor(n), ORIGIN, frameFor(n + 1));
      total += n;
      stayed += moves.filter((m) => m.from && m.to && !moved(m)).length;
    }
    expect(stayed / total).toBeGreaterThan(0.6);
  });

  it('move shared prime pieces rigidly', () => {
    // 12 = 5 + 7 and 18 = 7 + 11 share the 7-piece.
    const moves = planTransition(frameFor(12), ORIGIN, frameFor(18)).moves.filter((m) => m.rigid);
    expect(moves).toHaveLength(7);
    const offsets = new Set(moves.map((m) => `${m.to!.x - m.from!.x},${m.to!.y - m.from!.y}`));
    expect(offsets.size).toBe(1);
  });
});
