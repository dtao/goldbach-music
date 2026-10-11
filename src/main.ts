import './style.css';
import { primeColor } from './color';
import { frameFor, type Frame } from './layout/frame';
import { Player } from './player';
import { Renderer } from './render/renderer';

const params = new URLSearchParams(location.search);
const intParam = (name: string, fallback: number, min: number, max: number) => {
  const v = Number(params.get(name));
  return Number.isFinite(v) && v >= min ? Math.min(max, Math.round(v)) : fallback;
};
const BPM = intParam('bpm', 120, 30, 300);
const CAP = intParam('cap', 500, 4, 5000);

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const canvas = $<HTMLCanvasElement>('stage');
const numberEl = $('number');
const captionEl = $('caption');
const playBtn = $<HTMLButtonElement>('play');
const jumpForm = $<HTMLFormElement>('jump');
const jumpInput = $<HTMLInputElement>('jump-n');
jumpInput.max = String(CAP);

const renderer = new Renderer(canvas);

function primeSpan(p: number): string {
  return `<span class="prime" style="color:${primeColor(p)}">${p}</span>`;
}

function caption(frame: Frame): string {
  switch (frame.kind) {
    case 'prime':
      return `${primeSpan(frame.n)} is prime`;
    case 'even':
      return `${frame.n} = ${primeSpan(frame.primes[0])} + ${primeSpan(frame.primes[1])}`;
    default:
      return '';
  }
}

const player = new Player({
  bpm: BPM,
  cap: CAP,
  onNumber(n) {
    const frame = frameFor(n);
    numberEl.textContent = String(n);
    captionEl.innerHTML = caption(frame);
    renderer.show(frame, performance.now() / 1000, Math.min(0.45, (60 / BPM) * 0.8));
  },
});

function setPlaying(playing: boolean) {
  if (playing) player.play();
  else player.pause();
  playBtn.textContent = playing ? '❚❚' : '▶';
  playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
}

playBtn.addEventListener('click', () => setPlaying(!player.playing));
$('back').addEventListener('click', () => player.step(-1));
$('forward').addEventListener('click', () => player.step(1));
jumpForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const n = Number(jumpInput.value);
  if (Number.isFinite(n) && n >= 1) player.goTo(n);
  jumpInput.blur();
});
window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement) return;
  if (e.key === ' ') {
    e.preventDefault();
    setPlaying(!player.playing);
  } else if (e.key === 'ArrowRight') player.step(1);
  else if (e.key === 'ArrowLeft') player.step(-1);
});

renderer.show(frameFor(1), performance.now() / 1000, 0.4);
captionEl.textContent = 'press play';

function loop() {
  player.syncVisuals();
  renderer.draw(performance.now() / 1000);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
