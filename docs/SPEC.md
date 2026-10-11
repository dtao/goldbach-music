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
- **Sound palette: chiptune** — square/triangle/pulse waves, noise-channel
  percussion for the beat, default tempo **~120 BPM**.

## 3. Timeline

- The app counts upward, **one number per beat**.
- Durations: **odd composite = 1 beat**, **prime = 2 beats**,
  **even = 1 beat**.
- The sequence **starts at 1**.
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
  primes that sum to that number, **played in sequence** (p's motif, then q's),
  compressed into a **single quick beat** like a flourish. The full-length
  motif is heard when the prime itself is reached.

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
- **Prime colors**: golden-angle hue — hue = (k × 137.5°) mod 360, where k is
  the prime's index (2 → k=1, 3 → k=2, 5 → k=3, …). Fixed saturation/lightness
  so every prime is vivid and neighbors contrast.
- **Even-number composition**: the p-shape and q-shape are placed
  **interlocking and touching** — edge-adjacent, never overlapping — with the
  smaller shape tucked against the larger by a deterministic placement rule
  (e.g. scan candidate positions in a fixed order and choose the one that
  maximizes shared edges / minimizes bounding box). Same n → same picture.
- **On-screen text**: the **current number** in large type, plus an
  **equation/caption**: e.g. "28 = 5 + 23", "23 is prime", "21" (composite).
- **Odd composite numbers** appear as a **plain grey blob**: n neutral grey
  blocks in a compact, roughly square layout, with no prime shapes.
- **Even numbers** appear as the composition of two recognizable prime shapes.
- As the count advances, blocks **shift and reform** to make the new shapes:
  - Prime shapes present in both the old and new number **slide as rigid
    units** to their new positions.
  - All other blocks break apart and glide individually into their new
    arrangement; the newly added block drops in.
- Every even number has a **deterministic shape**: the combination of two
  specific primes.

## 7. Edge cases

- **1**: a single grey block (neither prime nor composite); beat + bass only.
- **2**: prime (its own shape, color, motif; 2 beats).
- **3**: prime.
- **4 = 2 + 2**: the 2-shape shown twice; the 2-motif played twice.

## 8. Controls

- **Play / pause** (also satisfies the browser's user-gesture requirement
  for starting audio).
- **Jump to n**: enter a number and continue from there.
- **Step forward / back** one number at a time while paused.

## 9. Open questions

_To be resolved; answers will be folded into the sections above._

