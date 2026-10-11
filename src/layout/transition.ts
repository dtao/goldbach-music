import type { Block, Frame } from './frame';

export interface BlockMove {
  from: Block | null; // null: block drops in
  to: Block | null; // null: block fades out
  /** True when the block belongs to a prime piece present in both frames. */
  rigid: boolean;
}

const rowMajor = (a: Block, b: Block) => a.y - b.y || a.x - b.x;

/**
 * Pair up blocks between two frames. Prime pieces present in both frames map
 * block-for-block (same shape, so they translate as a rigid unit). Everything
 * else pairs in row-major order; leftovers drop in or fade out.
 */
export function planTransition(from: Frame, to: Frame): BlockMove[] {
  const moves: BlockMove[] = [];
  const toPieces = new Map<string, Block[]>();
  for (const b of to.blocks) {
    if (b.piece) toPieces.set(b.piece, [...(toPieces.get(b.piece) ?? []), b]);
  }
  const fromPieces = new Map<string, Block[]>();
  for (const b of from.blocks) {
    if (b.piece) fromPieces.set(b.piece, [...(fromPieces.get(b.piece) ?? []), b]);
  }

  const shared = new Set([...fromPieces.keys()].filter((k) => toPieces.has(k)));
  for (const k of shared) {
    const a = fromPieces.get(k)!;
    const b = toPieces.get(k)!;
    a.forEach((block, i) => moves.push({ from: block, to: b[i], rigid: true }));
  }

  const looseFrom = from.blocks.filter((b) => !b.piece || !shared.has(b.piece)).sort(rowMajor);
  const looseTo = to.blocks.filter((b) => !b.piece || !shared.has(b.piece)).sort(rowMajor);
  const len = Math.max(looseFrom.length, looseTo.length);
  for (let i = 0; i < len; i++) {
    moves.push({ from: looseFrom[i] ?? null, to: looseTo[i] ?? null, rigid: false });
  }
  return moves;
}
