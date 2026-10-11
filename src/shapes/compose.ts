import { bounds, type Cell } from './polyomino';

export interface Composition {
  /** Cells of the larger shape, in its own order. */
  large: Cell[];
  /** Cells of the smaller shape, translated into place, in its own order. */
  small: Cell[];
}

/**
 * Place `small` against `large` so they touch edge-to-edge without
 * overlapping. Scores every offset: most shared edges first (tucks the small
 * shape into concavities), then smallest bounding box, then scan order.
 * Neither shape is rotated so each stays recognizable.
 */
export function compose(large: readonly Cell[], small: readonly Cell[]): Composition {
  const lb = bounds(large);
  const sb = bounds(small);
  // Integer grid keyed occupancy for the large shape, with a margin.
  const pad = sb.width + sb.height + 2;
  const gw = lb.width + 2 * pad;
  const gh = lb.height + 2 * pad;
  const grid = new Uint8Array(gw * gh);
  for (const [x, y] of large) grid[(y - lb.minY + pad) * gw + (x - lb.minX + pad)] = 1;
  const at = (x: number, y: number) => {
    const gx = x - lb.minX + pad;
    const gy = y - lb.minY + pad;
    return gx < 0 || gy < 0 || gx >= gw || gy >= gh ? 0 : grid[gy * gw + gx];
  };

  let best: { dx: number; dy: number; edges: number; area: number } | null = null;
  for (let dy = lb.minY - sb.maxY - 1; dy <= lb.maxY - sb.minY + 1; dy++) {
    for (let dx = lb.minX - sb.maxX - 1; dx <= lb.maxX - sb.minX + 1; dx++) {
      let edges = 0;
      let overlap = false;
      for (const [sx, sy] of small) {
        const x = sx + dx;
        const y = sy + dy;
        if (at(x, y)) {
          overlap = true;
          break;
        }
        edges += at(x + 1, y) + at(x - 1, y) + at(x, y + 1) + at(x, y - 1);
      }
      if (overlap || edges === 0) continue;
      const w = Math.max(lb.maxX, sb.maxX + dx) - Math.min(lb.minX, sb.minX + dx) + 1;
      const h = Math.max(lb.maxY, sb.maxY + dy) - Math.min(lb.minY, sb.minY + dy) + 1;
      const area = w * h;
      if (!best || edges > best.edges || (edges === best.edges && area < best.area)) {
        best = { dx, dy, edges, area };
      }
    }
  }
  if (!best) throw new Error('No touching placement found');
  const { dx, dy } = best;
  return {
    large: [...large],
    small: small.map(([x, y]) => [x + dx, y + dy] as Cell),
  };
}
