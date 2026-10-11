# Goldbach Music — Specification

> Living spec. Each significant clarification gets its own commit.
> Status: **Draft v0 — initial idea, requirements being clarified.**

## 1. Concept

An app that visualizes [Goldbach's Conjecture](https://en.wikipedia.org/wiki/Goldbach%27s_conjecture)
("every even integer greater than 2 is the sum of two primes") through
**blocks** and **musical motifs**. The app counts upward through the integers;
each number is both seen (as a collection of blocks) and heard (as sound
layered over a steady beat).

## 2. Audio

- A **steady beat** plays underneath everything.
- **Odd composite numbers**: only the beat and an underlying bass note.
- **Prime numbers**:
  - Each prime has its own **unique musical signature** (motif).
  - A prime **lingers an extra beat** (occupies two beats instead of one).
- **Even numbers**: play **two musical sounds** — the signatures of the two
  primes that sum to that number.

## 3. Visuals

- Each number *n* is shown as a collection of *n* **blocks** on a
  **rectangular grid**.
- Blocks are **added one at a time** as the app counts up.
- Each **prime has its own shape** (made of blocks) and **its own color**.
- **Even numbers** appear as the composition of two recognizable prime shapes.
- As the count advances, blocks **shift and reform** to make the new shapes.
- Every even number has a **deterministic shape**: the combination of two
  specific primes.

## 4. Open questions

_To be resolved; answers will be folded into the sections above._

- Platform / tech stack
- Which Goldbach pair is chosen for each even number (there are often many)
- How prime shapes are designed/generated (primes are unbounded)
- How prime motifs are designed/generated
- Handling of edge cases: 1, 2, 3, 4 (= 2 + 2, same prime twice)
- What odd composites look like visually
- Timing: one number per beat? Do even-number motifs play together or in sequence?
- Controls (play/pause, tempo, jump to *n*, range)
