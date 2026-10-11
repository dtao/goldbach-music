import type { Block, Frame } from '../layout/frame';
import { planTransition, type BlockMove } from '../layout/transition';

interface Sprite {
  move: BlockMove;
  delay: number; // fraction of the transition before this block starts moving
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOutBack = (t: number) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** Draws frames on a canvas and animates the blocks between them. */
export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private sprites: Sprite[] = [];
  private start = 0;
  private duration = 0.3;
  private fromScale = 1;
  private toScale = 1;
  private current: Frame | null = null;
  private colorCache = new Map<string, [number, number, number]>();

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
  }

  /** Region between the number/caption header and the control bar. */
  private stage() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const top = Math.min(170, h * 0.26);
    const bottom = h - Math.min(110, h * 0.16);
    return { w, top, bottom, h: bottom - top };
  }

  private fitScale(frame: Frame): number {
    const { w, h } = this.stage();
    const s = Math.min((w * 0.9) / (frame.width + 1), (h * 0.95) / (frame.height + 1));
    return Math.max(0.5, Math.min(s, Math.min(w, h) / 5));
  }

  /** Begin animating from the currently shown frame to `frame`. */
  show(frame: Frame, now: number, duration: number): void {
    const prev = this.current;
    this.fromScale = prev ? this.currentScale(now) : this.fitScale(frame);
    this.toScale = this.fitScale(frame);
    this.start = now;
    this.duration = duration;
    const moves: BlockMove[] = prev
      ? planTransition(prev, frame)
      : frame.blocks.map((b) => ({ from: null, to: b, rigid: false }));
    this.sprites = moves.map((move, i) => ({
      move,
      // Rigid pieces glide together; loose blocks scatter with a small deterministic stagger.
      delay: move.rigid ? 0 : ((i * 0.618) % 1) * 0.35,
    }));
    this.current = frame;
  }

  private currentScale(now: number): number {
    const t = easeInOut(clamp01((now - this.start) / this.duration));
    return this.fromScale + (this.toScale - this.fromScale) * t;
  }

  private rgb(color: string): [number, number, number] {
    let c = this.colorCache.get(color);
    if (!c) {
      this.ctx.fillStyle = color;
      const hex = this.ctx.fillStyle; // browsers normalise to #rrggbb
      c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
      this.colorCache.set(color, c);
    }
    return c;
  }

  private mix(a: string, b: string, t: number): string {
    const ca = this.rgb(a);
    const cb = this.rgb(b);
    const m = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
    return `rgb(${m[0]},${m[1]},${m[2]})`;
  }

  draw(now: number): void {
    const { canvas, ctx } = this;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      if (this.current) this.toScale = this.fitScale(this.current);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const scale = this.currentScale(now);
    const progress = clamp01((now - this.start) / this.duration);
    const size = scale * 0.88;
    const radius = Math.min(size * 0.18, 6);
    const stage = this.stage();
    const cx = w / 2;
    const cy = (stage.top + stage.bottom) / 2;

    for (const { move, delay } of this.sprites) {
      const t = clamp01((progress - delay) / (1 - delay));
      const { from, to } = move;
      let x: number, y: number, color: string, alpha: number;
      if (from && to) {
        const e = easeInOut(t);
        x = from.x + (to.x - from.x) * e;
        y = from.y + (to.y - from.y) * e;
        color = this.mix(from.color, to.color, e);
        alpha = 1;
      } else if (to) {
        // New block drops in from above.
        x = to.x;
        y = to.y - 3 * (1 - easeOutBack(t));
        color = to.color;
        alpha = clamp01(t * 3);
      } else {
        const b = from as Block;
        x = b.x;
        y = b.y;
        color = b.color;
        alpha = 1 - t;
      }
      if (alpha <= 0) continue;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(cx + x * scale - size / 2, cy + y * scale - size / 2, size, size, radius);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
