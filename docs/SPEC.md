# Goldbach Music — Specification

> Living spec. Each significant clarification gets its own commit.
> Status: **Draft v1 — core decisions made, details being clarified.**

## 1. Concept

An app that visualizes [Goldbach's Conjecture](https://en.wikipedia.org/wiki/Goldbach%27s_conjecture)
("every even integer greater than 2 is the sum of two primes") through
**blocks** and **musical motifs**. The app counts upward through the integers;
each number is both seen (as a collection of blocks) and heard (as sound
layered over a steady beat).

## 2. Platform

- **Web app** running in the browser.
- Rendering: Canvas or SVG for the block grid.
- Audio: Web Audio API (likely via Tone.js).

## 3. Timeline

- The app counts upward, **one number per beat**.
- **Primes hold for 2 beats** (the "extra beat" in §4).
- Each step adds one block (n has n blocks); blocks then shift/reform into
  the shape for the new number.

## 4. Goldbach pair selection

For each even number n ≥ 4, use the decomposition n = p + q (p ≤ q, both
prime) with the **smallest possible p**. Examples: 10 → 3 + 7, 28 → 5 + 23,
4 → 2 + 2. This is deterministic, so every even number always has the same
shape and sound.

## 5. Audio

- A **steady beat** plays underneath everything.
- **Odd composite numbers**: only the beat and an underlying bass note.
- **Prime numbers**:
  - Each prime has its own **unique musical signature** (motif).
  - Motifs are **derived from the number itself**: pitches come from p's
    digits and/or its index among the primes, mapped onto a scale; rhythm is
    also derived from p. Deterministic and defined for every prime.
  - A prime **lingers an extra beat** (occupies two beats instead of one).
- **Even numbers**: play **two musical sounds** — the signatures of the two
  primes that sum to that number, **played in sequence** (p's motif, then q's).

## 6. Visuals

- Each number *n* is shown as a collection of *n* **blocks** on a
  **rectangular grid**.
- The view **zooms out to fit**: block size shrinks so the whole number is
  always on screen.
- Blocks are **added one at a time** as the app counts up.
- Each **prime has its own shape** (made of blocks) and **its own color**.
- **Prime shapes**: each prime p is a **connected polyomino of p blocks**,
  generated pseudo-randomly from a **fixed seed derived from p**. Random-looking
  but fully deterministic: prime p always gets the same shape.
  Generation should favor shapes that are visually distinct from one another.
- **Odd composite numbers** appear as a **plain grey blob**: n neutral grey
  blocks in a compact, roughly square layout, with no prime shapes.
- **Even numbers** appear as the composition of two recognizable prime shapes.
- As the count advances, blocks **shift and reform** to make the new shapes.
- Every even number has a **deterministic shape**: the combination of two
  specific primes.

## 7. Open questions

_To be resolved; answers will be folded into the sections above._

- Handling of edge cases: 1, 2, 3, 4 (= 2 + 2, same prime twice)
- Controls (play/pause, tempo, jump to *n*, range)
