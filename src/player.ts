import { frameFor } from './layout/frame';
import { beatsFor, nextNumber } from './music/sequence';
import { ChipSynth } from './music/synth';

export interface PlayerOptions {
  bpm: number;
  cap: number;
  onNumber: (n: number) => void;
}

const LOOKAHEAD = 0.12; // seconds of audio scheduled ahead of time
const TICK_MS = 25;

/**
 * Owns the count and keeps audio and visuals in step: audio is scheduled a
 * little ahead on the AudioContext clock, and each number is announced to the
 * UI when the clock reaches its start time.
 */
export class Player {
  n = 1;
  playing = false;
  private synth: ChipSynth | null = null;
  private nextTime = 0;
  private nextN = 1;
  private pending: { n: number; time: number }[] = [];
  private timer: number | undefined;

  constructor(private opts: PlayerOptions) {}

  get beat(): number {
    return 60 / this.opts.bpm;
  }

  get cap(): number {
    return this.opts.cap;
  }

  /** AudioContext must be created/resumed from a user gesture. */
  private ensureSynth(): ChipSynth {
    if (!this.synth) this.synth = new ChipSynth(new AudioContext());
    if (this.synth.ctx.state === 'suspended') void this.synth.ctx.resume();
    return this.synth;
  }

  play(): void {
    if (this.playing) return;
    const synth = this.ensureSynth();
    this.playing = true;
    this.nextN = nextNumber(this.n, this.cap);
    this.nextTime = synth.ctx.currentTime + 0.05;
    this.tick();
    this.timer = window.setInterval(() => this.tick(), TICK_MS);
  }

  pause(): void {
    if (!this.playing) return;
    this.playing = false;
    window.clearInterval(this.timer);
    this.pending = [];
    this.synth?.cancelScheduled();
  }

  /** Jump (or step) to n. While paused, sounds n once so stepping is audible. */
  goTo(n: number): void {
    n = Math.min(this.cap, Math.max(1, Math.round(n)));
    const wasPlaying = this.playing;
    if (wasPlaying) this.pause();
    this.setNumber(n);
    if (wasPlaying) this.play();
    else {
      const synth = this.ensureSynth();
      synth.cancelScheduled();
      synth.playNumber(n, synth.ctx.currentTime + 0.02, this.beat);
    }
  }

  step(delta: number): void {
    const n = this.n + delta;
    this.goTo(n < 1 ? this.cap : n > this.cap ? 1 : n);
  }

  private setNumber(n: number): void {
    this.n = n;
    this.opts.onNumber(n);
  }

  private tick(): void {
    const synth = this.synth!;
    const now = synth.ctx.currentTime;
    while (this.nextTime < now + LOOKAHEAD) {
      const n = this.nextN;
      frameFor(n); // warm the layout cache before it's needed on screen
      synth.playNumber(n, this.nextTime, this.beat);
      this.pending.push({ n, time: this.nextTime });
      this.nextTime += beatsFor(n) * this.beat;
      this.nextN = nextNumber(n, this.cap);
    }
    this.syncVisuals();
  }

  /** Announce numbers whose start time has arrived. Call every animation frame for tight sync. */
  syncVisuals(): void {
    if (!this.synth) return;
    const now = this.synth.ctx.currentTime;
    while (this.pending.length && this.pending[0].time <= now) {
      this.setNumber(this.pending.shift()!.n);
    }
  }
}
