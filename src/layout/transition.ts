import type { Block, Frame } from './frame';

/** A block's start and end in world coordinates. */
export interface BlockMove {
  from: Block | null; // null: block drops in
  to: Block | null; // null: block fades out
  /** True when the block belongs to a prime piece present in both frames. */
  rigid: boolean;
}

export interface Offset {
  x: number;
  y: number;
}

export interface TransitionPlan {
  /** Where the new frame sits in world coordinates. */
  offset: Offset;
  moves: BlockMove[];
}

const cellKey = (x: number, y: number) => x * 65536 + y;

/**
 * Integer translation for `to` that lands as many of its cells as possible on
 * cells occupied by `from` (already placed at `fromOffset`). Ties go to the
 * placement whose centre is nearest the old centre, so the view stays put.
 */
export function alignFrame(from: Frame, fromOffset: Offset, to: Frame): Offset {
  const occupied = new Set(from.blocks.map((b) => cellKey(b.x + fromOffset.x, b.y + fromOffset.y)));
  const oldCx = fromOffset.x + (from.width - 1) / 2;
  const oldCy = fromOffset.y + (from.height - 1) / 2;
  let best = { x: 0, y: 0, overlap: -1, dist: Infinity };
  for (let oy = fromOffset.y - to.height + 1; oy <= fromOffset.y + from.height - 1; oy++) {
    for (let ox = fromOffset.x - to.width + 1; ox <= fromOffset.x + from.width - 1; ox++) {
      let overlap = 0;
      for (const b of to.blocks) if (occupied.has(cellKey(b.x + ox, b.y + oy))) overlap++;
      const dist = Math.hypot(ox + (to.width - 1) / 2 - oldCx, oy + (to.height - 1) / 2 - oldCy);
      if (overlap > best.overlap || (overlap === best.overlap && dist < best.dist)) {
        best = { x: ox, y: oy, overlap, dist };
      }
    }
  }
  return { x: best.x, y: best.y };
}

const place = (blocks: Block[], o: Offset): Block[] => blocks.map((b) => ({ ...b, x: b.x + o.x, y: b.y + o.y }));

/**
 * Plan the morph between two frames with as little motion as possible:
 * 1. align the new frame to maximise overlap with the old one;
 * 2. prime pieces present in both frames move as rigid units;
 * 3. blocks whose cell stays occupied stay put (possibly changing colour);
 * 4. remaining blocks glide to the nearest free target;
 * 5. leftovers drop in or fade out.
 */
export function planTransition(from: Frame, fromOffset: Offset, to: Frame): TransitionPlan {
  const offset = alignFrame(from, fromOffset, to);
  const fromBlocks = place(from.blocks, fromOffset);
  const toBlocks = place(to.blocks, offset);
  const moves: BlockMove[] = [];

  const byPiece = (blocks: Block[]) => {
    const m = new Map<string, Block[]>();
    for (const b of blocks) if (b.piece) m.set(b.piece, [...(m.get(b.piece) ?? []), b]);
    return m;
  };
  const fromPieces = byPiece(fromBlocks);
  const toPieces = byPiece(toBlocks);
  const shared = new Set([...fromPieces.keys()].filter((k) => toPieces.has(k)));
  for (const k of shared) {
    const b = toPieces.get(k)!;
    fromPieces.get(k)!.forEach((block, i) => moves.push({ from: block, to: b[i], rigid: true }));
  }

  const isLoose = (b: Block) => !b.piece || !shared.has(b.piece);
  let looseFrom = fromBlocks.filter(isLoose);
  let looseTo = toBlocks.filter(isLoose);

  // Blocks that keep their cell.
  const toAt = new Map(looseTo.map((b) => [cellKey(b.x, b.y), b]));
  const matchedTo = new Set<Block>();
  looseFrom = looseFrom.filter((b) => {
    const t = toAt.get(cellKey(b.x, b.y));
    if (!t) return true;
    moves.push({ from: b, to: t, rigid: false });
    matchedTo.add(t);
    return false;
  });
  looseTo = looseTo.filter((b) => !matchedTo.has(b));

  // Greedy nearest pairing for the rest.
  const pairs: [number, number, number][] = [];
  looseFrom.forEach((a, i) =>
    looseTo.forEach((b, j) => pairs.push([(a.x - b.x) ** 2 + (a.y - b.y) ** 2, i, j])),
  );
  pairs.sort((p, q) => p[0] - q[0] || p[1] - q[1] || p[2] - q[2]);
  const usedFrom = new Set<number>();
  const usedTo = new Set<number>();
  for (const [, i, j] of pairs) {
    if (usedFrom.has(i) || usedTo.has(j)) continue;
    usedFrom.add(i);
    usedTo.add(j);
    moves.push({ from: looseFrom[i], to: looseTo[j], rigid: false });
  }
  looseFrom.forEach((b, i) => usedFrom.has(i) || moves.push({ from: b, to: null, rigid: false }));
  looseTo.forEach((b, j) => usedTo.has(j) || moves.push({ from: null, to: b, rigid: false }));

  return { offset, moves };
}
