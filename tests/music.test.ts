import { describe, expect, it } from 'vitest';
import { degreeToSemitones, motifFor } from '../src/music/motif';
import { bassHz, beatsFor, nextNumber } from '../src/music/sequence';

describe('motifs', () => {
  it('are built from the digits of p and its prime index', () => {
    expect(motifFor(13).notes.map((n) => n.degree)).toEqual([1, 3, 6]);
    expect(motifFor(2).notes.map((n) => n.degree)).toEqual([2, 1]);
  });

  it('fill their duration exactly', () => {
    for (const p of [2, 3, 5, 7, 11, 97, 499]) {
      const notes = motifFor(p).notes;
      const last = notes[notes.length - 1];
      expect(notes[0].start).toBe(0);
      expect(last.start + last.length).toBeCloseTo(1);
    }
  });

  it('are unique per prime', () => {
    const seen = new Set<string>();
    for (const p of [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]) {
      const m = motifFor(p);
      seen.add(JSON.stringify([m.notes, m.duty]));
    }
    expect(seen.size).toBe(15);
  });

  it('map digits onto two octaves of pentatonic', () => {
    expect([0, 1, 2, 3, 4, 5, 9].map(degreeToSemitones)).toEqual([0, 2, 4, 7, 9, 12, 21]);
  });
});

describe('sequence', () => {
  it('gives primes two beats, everything else one', () => {
    expect([1, 2, 3, 4, 9, 10, 11].map(beatsFor)).toEqual([1, 2, 2, 1, 1, 1, 2]);
  });

  it('walks the bass and loops at the cap', () => {
    expect(bassHz(1)).toBe(55);
    expect(bassHz(3)).toBe(110);
    expect(bassHz(5)).toBe(55);
    expect(nextNumber(500, 500)).toBe(1);
    expect(nextNumber(7, 500)).toBe(8);
  });
});
