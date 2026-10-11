# Goldbach Music

Watch and listen to [Goldbach's Conjecture](https://en.wikipedia.org/wiki/Goldbach%27s_conjecture):
the app counts up from 1, drawing each number as blocks over a chiptune beat.

- **Primes** have their own block shape, color and melody, and last two beats.
- **Even numbers** are drawn as two prime shapes fitted together, using the
  most balanced pair (28 = 11 + 17), and play both primes' melodies
  as a quick flourish.
- **Odd composites** are a grey block with just the beat and bass.

See [`docs/SPEC.md`](docs/SPEC.md) for the full specification.

## Running

```sh
npm install
npm run dev       # local dev server
npm test          # unit tests
npm run build     # static site in dist/
```

## Deploying

Pushes to `main` build, test and deploy to GitHub Pages via
`.github/workflows/deploy.yml`. One-time setup: in the repo's **Settings →
Pages**, set **Source** to **GitHub Actions**. The site is then served at
`https://dtao.github.io/goldbach-music/`.

Controls: **Space** plays or pauses, **← / →** steps back or forward, and the
box jumps to any number. URL options: `?bpm=120&cap=500`.
