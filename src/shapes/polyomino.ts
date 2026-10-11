import { mulberry32 } from '../random';

export type Cell = readonly [x: number, y: number];

const NEIGHBORS: readonly Cell[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export const key = (x: number, y: number): string => `${x},${y}`;

/** Shift cells so the minimum x and y are 0, ordered row-major. */
export function normalize(cells: readonly Cell[]): Cell[] {
  const minX = Math.min(...cells.map(([x]) => x));
  const minY = Math.min(...cells.map(([, y]) => y));
  return cells
    .map(([x, y]) => [x - minX, y - minY] as Cell)
    .sort((a, b) => a[1] - b[1] || a[0] - b[0]);
}

export function bounds(cells: readonly Cell[]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of cells) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

const shapeCache = new Map<number, Cell[]>();

/**
 * Deterministic, random-looking connected polyomino of `size` cells, seeded by
 * `size`. Grows from one cell by repeatedly adding a frontier cell, weighted
 * toward cells with more filled neighbours so shapes stay compact.
 */
export function shapeFor(size: number): Cell[] {
  const cached = shapeCache.get(size);
  if (cached) return cached;

  const rand = mulberry32(Math.imul(size, 2654435761) ^ 0x9e3779b9);
  const filled = new Set<string>([key(0, 0)]);
  const cells: Cell[] = [[0, 0]];
  // Frontier in insertion order keeps iteration (and thus output) deterministic.
  const frontier = new Map<string, Cell>();
  const addFrontier = ([x, y]: Cell) => {
    for (const [dx, dy] of NEIGHBORS) {
      const k = key(x + dx, y + dy);
      if (!filled.has(k)) frontier.set(k, [x + dx, y + dy]);
    }
  };
  addFrontier([0, 0]);

  while (cells.length < size) {
    const candidates = [...frontier.values()];
    const weights = candidates.map(([x, y]) => {
      let n = 0;
      for (const [dx, dy] of NEIGHBORS) if (filled.has(key(x + dx, y + dy))) n++;
      return n * n;
    });
    const total = weights.reduce((a, b) => a + b, 0);
    let r = rand() * total;
    let i = 0;
    while (r >= weights[i] && i < weights.length - 1) r -= weights[i++];
    const pick = candidates[i];
    const k = key(pick[0], pick[1]);
    frontier.delete(k);
    filled.add(k);
    cells.push(pick);
    addFrontier(pick);
  }

  const shape = normalize(cells);
  shapeCache.set(size, shape);
  return shape;
}

export function isConnected(cells: readonly Cell[]): boolean {
  if (cells.length === 0) return true;
  const set = new Set(cells.map(([x, y]) => key(x, y)));
  const seen = new Set<string>([key(...cells[0])]);
  const stack: Cell[] = [cells[0]];
  while (stack.length) {
    const [x, y] = stack.pop()!;
    for (const [dx, dy] of NEIGHBORS) {
      const k = key(x + dx, y + dy);
      if (set.has(k) && !seen.has(k)) {
        seen.add(k);
        stack.push([x + dx, y + dy]);
      }
    }
  }
  return seen.size === set.size;
}

export function sharedEdges(a: readonly Cell[], b: readonly Cell[]): number {
  const set = new Set(a.map(([x, y]) => key(x, y)));
  let n = 0;
  for (const [x, y] of b) {
    for (const [dx, dy] of NEIGHBORS) if (set.has(key(x + dx, y + dy))) n++;
  }
  return n;
}
