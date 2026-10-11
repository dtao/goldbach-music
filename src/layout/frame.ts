import { GREY, primeColor } from '../color';
import { classify, goldbachPair, type NumberKind } from '../math/primes';
import { compose } from '../shapes/compose';
import { bounds, shapeFor, type Cell } from '../shapes/polyomino';

export interface Block {
  x: number;
  y: number;
  color: string;
  /** Identifies a prime piece (e.g. "7#0") so it can move as a rigid unit; null for grey blocks. */
  piece: string | null;
}

export interface Frame {
  n: number;
  kind: NumberKind;
  /** Primes making up the number: [p] for a prime, [p, q] for an even number. */
  primes: number[];
  blocks: Block[];
  width: number;
  height: number;
}

function pieceBlocks(cells: readonly Cell[], p: number, copy: number): Block[] {
  const color = primeColor(p, copy);
  return cells.map(([x, y]) => ({ x, y, color, piece: `${p}#${copy}` }));
}

function greyBlocks(n: number): Block[] {
  const w = Math.ceil(Math.sqrt(n));
  return Array.from({ length: n }, (_, i) => ({ x: i % w, y: Math.floor(i / w), color: GREY, piece: null }));
}

/** Translate blocks so their bounding box starts at (0, 0); coordinates stay integers. */
function normalizeBlocks(blocks: Block[]): { blocks: Block[]; width: number; height: number } {
  const b = bounds(blocks.map((bl) => [bl.x, bl.y] as Cell));
  return {
    blocks: blocks.map((bl) => ({ ...bl, x: bl.x - b.minX, y: bl.y - b.minY })),
    width: b.width,
    height: b.height,
  };
}

const frameCache = new Map<number, Frame>();

export function frameFor(n: number): Frame {
  const cached = frameCache.get(n);
  if (cached) return cached;

  const kind = classify(n);
  let primes: number[] = [];
  let blocks: Block[];
  switch (kind) {
    case 'one':
    case 'composite':
      blocks = greyBlocks(n);
      break;
    case 'prime':
      primes = [n];
      blocks = pieceBlocks(shapeFor(n), n, 0);
      break;
    case 'even': {
      const [p, q] = goldbachPair(n);
      primes = [p, q];
      const { large, small } = compose(shapeFor(q), shapeFor(p));
      blocks = [...pieceBlocks(large, q, 0), ...pieceBlocks(small, p, p === q ? 1 : 0)];
      break;
    }
  }
  const frame: Frame = { n, kind, primes, ...normalizeBlocks(blocks) };
  frameCache.set(n, frame);
  return frame;
}
