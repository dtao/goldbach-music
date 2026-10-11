import { classify, goldbachPair } from '../math/primes';
import { degreeToHz, motifFor, type Motif } from './motif';
import { bassHz, beatsFor } from './sequence';

/** Fourier coefficients for a pulse wave of the given duty cycle. */
function pulseWave(ctx: BaseAudioContext, duty: number): PeriodicWave {
  const harmonics = 48;
  const real = new Float32Array(harmonics);
  const imag = new Float32Array(harmonics);
  for (let n = 1; n < harmonics; n++) {
    real[n] = Math.sin(2 * Math.PI * n * duty) / (Math.PI * n);
    imag[n] = (1 - Math.cos(2 * Math.PI * n * duty)) / (Math.PI * n);
  }
  return ctx.createPeriodicWave(real, imag);
}

/** NES-style four-channel-ish chip synth: pulse lead, triangle bass, noise + kick drums. */
export class ChipSynth {
  readonly ctx: AudioContext;
  private bus: GainNode;
  private waves = new Map<number, PeriodicWave>();
  private noise: AudioBuffer;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.bus = this.newBus();
    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }

  private newBus(): GainNode {
    const g = this.ctx.createGain();
    g.gain.value = 0.5;
    g.connect(this.ctx.destination);
    return g;
  }

  /** Silence everything already scheduled by swapping out the output bus. */
  cancelScheduled(): void {
    const old = this.bus;
    old.gain.setValueAtTime(old.gain.value, this.ctx.currentTime);
    old.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.02);
    setTimeout(() => old.disconnect(), 100);
    this.bus = this.newBus();
  }

  private wave(duty: number): PeriodicWave {
    let w = this.waves.get(duty);
    if (!w) this.waves.set(duty, (w = pulseWave(this.ctx, duty)));
    return w;
  }

  private tone(
    setup: (osc: OscillatorNode) => void,
    hz: number,
    time: number,
    dur: number,
    peak: number,
  ): void {
    const osc = this.ctx.createOscillator();
    setup(osc);
    osc.frequency.setValueAtTime(hz, time);
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(peak, time + 0.005);
    env.gain.setValueAtTime(peak, time + Math.max(0.006, dur * 0.7));
    env.gain.linearRampToValueAtTime(0, time + dur);
    osc.connect(env).connect(this.bus);
    osc.start(time);
    osc.stop(time + dur + 0.01);
  }

  kick(time: number, accent: boolean): void {
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.12);
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(accent ? 0.9 : 0.55, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    osc.connect(env).connect(this.bus);
    osc.start(time);
    osc.stop(time + 0.16);
  }

  hat(time: number): void {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.18, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    src.connect(hp).connect(env).connect(this.bus);
    src.start(time);
    src.stop(time + 0.06);
  }

  bass(hz: number, time: number, dur: number): void {
    this.tone((o) => (o.type = 'triangle'), hz, time, dur, 0.45);
  }

  motif(motif: Motif, time: number, dur: number): void {
    const wave = this.wave(motif.duty);
    for (const note of motif.notes) {
      this.tone(
        (o) => o.setPeriodicWave(wave),
        degreeToHz(note.degree),
        time + note.start * dur,
        Math.max(0.03, note.length * dur * 0.9),
        0.16,
      );
    }
  }

  /** Schedule all the sound for number n starting at `time`. */
  playNumber(n: number, time: number, beat: number): void {
    const beats = beatsFor(n);
    for (let b = 0; b < beats; b++) {
      const t = time + b * beat;
      this.kick(t, b === 0);
      this.hat(t + beat / 2);
      this.bass(bassHz(n), t, beat * 0.9);
    }
    switch (classify(n)) {
      case 'prime':
        this.motif(motifFor(n), time, beats * beat);
        break;
      case 'even': {
        // A one-beat flourish: p's motif, then q's.
        const [p, q] = goldbachPair(n);
        this.motif(motifFor(p), time, beat / 2);
        this.motif(motifFor(q), time + beat / 2, beat / 2);
        break;
      }
    }
  }
}
