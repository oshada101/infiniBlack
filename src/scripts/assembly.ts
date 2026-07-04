/**
 * Assembly engine — "the site builds itself".
 *
 * Boot order: loader (fake build log + progress) -> intro (hero assembles) ->
 * scroll-triggered assembly for every [data-assemble] section.
 *
 * Contract (used by every section):
 *   [data-assemble]          section root; its [data-piece] children snap in on scroll
 *   [data-piece]             element that assembles (dashed ghost + dimension tag -> snap)
 *   [data-piece="left|right|up|scale"]  entry direction (default "up")
 *   [data-typein]            text types in character by character
 *   [data-flicker]           CSS hover/tap re-assemble flicker (no JS needed)
 *   #intro-skip              skip button, visible only while boot plays
 *   [data-rebuild]           replays the whole boot sequence (footer easter egg)
 *
 * No JS / reduced motion => loader stays hidden (CSS) and everything is
 * already in final state, because the static HTML is the finished page.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const FROM: Record<string, gsap.TweenVars> = {
  up: { y: 28, x: 0 },
  left: { x: -32, y: 0 },
  right: { x: 32, y: 0 },
  scale: { scale: 0.92, y: 0, x: 0 },
};

function pieceFrom(el: Element): gsap.TweenVars {
  const dir = el.getAttribute('data-piece') || 'up';
  return FROM[dir] ?? FROM.up;
}

/** acid mono dimension tag pinned to a piece while it is a ghost */
function tagDims(p: HTMLElement): HTMLElement {
  const t = document.createElement('span');
  t.className = 'ghost-dim';
  t.setAttribute('aria-hidden', 'true');
  t.textContent = `${Math.round(p.offsetWidth)} × ${Math.round(p.offsetHeight)}`;
  p.appendChild(t);
  return t;
}

function ghostOn(p: HTMLElement) {
  p.classList.add('piece-ghost');
  if (p.offsetWidth > 40) tagDims(p);
}

function ghostOff(p: HTMLElement) {
  p.classList.remove('piece-ghost');
  p.querySelector('.ghost-dim')?.remove();
}

/** Split a [data-typein] element into char spans once; returns the spans. */
function splitChars(el: HTMLElement): HTMLElement[] {
  if (el.dataset.split) return Array.from(el.querySelectorAll<HTMLElement>('.ch'));
  const text = el.textContent ?? '';
  el.setAttribute('aria-label', text);
  el.textContent = '';
  const frag = document.createDocumentFragment();
  const spans: HTMLElement[] = [];
  // words as inline-blocks so lines wrap at word boundaries; spaces stay
  // real text nodes so wrapped lines never start with a visible space
  text.split(' ').forEach((word, i) => {
    if (i) frag.appendChild(document.createTextNode(' '));
    const w = document.createElement('span');
    w.style.display = 'inline-block';
    w.setAttribute('aria-hidden', 'true');
    for (const ch of word) {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = ch;
      w.appendChild(s);
      spans.push(s);
    }
    frag.appendChild(w);
  });
  el.appendChild(frag);
  el.dataset.split = '1';
  return spans;
}

/** Typewriter: chars appear instantly one by one (no fade). */
function typeIn(tl: gsap.core.Timeline, el: HTMLElement, at: gsap.Position) {
  const chars = splitChars(el);
  tl.set(chars, { visibility: 'hidden' }, 0);
  tl.to(chars, { visibility: 'visible', duration: 0.001, stagger: 0.028 }, at);
}

/* ---------------- loader ---------------- */

const LOG_LINES = [
  '> init infini/black — v1.0',
  '> resolving modules ... ok',
  '> drafting wireframe ... ok',
  '> assembling components',
];

function buildLoader(): gsap.core.Timeline | null {
  const loader = document.querySelector<HTMLElement>('#loader');
  const bar = document.querySelector<HTMLElement>('#loader-bar');
  const pct = document.querySelector<HTMLElement>('#loader-pct');
  const log = document.querySelector<HTMLElement>('#loader-log');
  if (!loader || !bar || !pct || !log) return null;

  const tl = gsap.timeline();
  tl.set(loader, { display: 'flex', autoAlpha: 1, yPercent: 0 }, 0);

  const counter = { v: 0 };
  tl.to(counter, {
    v: 100,
    duration: 1.35,
    ease: 'power2.inOut',
    onUpdate: () => {
      pct.textContent = `${Math.round(counter.v)}%`;
      bar.style.transform = `scaleX(${counter.v / 100})`;
    },
  }, 0);

  LOG_LINES.forEach((line, i) => {
    tl.call(() => { log.textContent = line; }, undefined, i * 0.34);
  });

  // lift the loader off like a plotter sheet
  tl.to(loader, { yPercent: -100, duration: 0.55, ease: 'power4.inOut' }, 1.5);
  tl.set(loader, { display: 'none' });

  return tl;
}

/* ---------------- schematic ---------------- */

const PULSES: Array<{ dot: string; path: [number, number][] }> = [
  { dot: '#pulse1', path: [[112, 22], [210, 22], [210, 100]] },
  { dot: '#pulse2', path: [[270, 136], [359, 136], [359, 210]] },
];

let pulseTls: gsap.core.Timeline[] = [];

function schematicIntro(tl: gsap.core.Timeline, at: number) {
  const root = document.querySelector<HTMLElement>('#schematic');
  if (!root) return;

  const nodes = gsap.utils.toArray<HTMLElement>('.node', root);
  const wires = gsap.utils.toArray<SVGPolylineElement>('.wire', root);

  // hidden until their moment (loader covers the first beats)
  tl.set(nodes, { autoAlpha: 0 }, 0);
  tl.set(wires, { opacity: 0 }, 0);

  tl.fromTo(nodes, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08 }, at);

  wires.forEach((w, i) => {
    const len = w.getTotalLength();
    tl.fromTo(
      w,
      { strokeDasharray: len, strokeDashoffset: len, opacity: 1 },
      {
        strokeDashoffset: 0,
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => {
          gsap.set(w, { clearProps: 'strokeDasharray,strokeDashoffset' });
          w.classList.add('live'); // marching-ants current, CSS-driven
        },
      },
      at + 0.3 + i * 0.12,
    );
  });

  // acid packets travelling the wires, forever
  tl.call(() => {
    pulseTls.forEach((p) => p.kill()); // no duplicates after a rebuild
    pulseTls = [];
    PULSES.forEach(({ dot, path }, i) => {
      const el = root.querySelector(dot);
      if (!el) return;
      const ptl = gsap.timeline({ repeat: -1, repeatDelay: 1.4, delay: i * 0.9 });
      pulseTls.push(ptl);
      ptl.set(el, { attr: { cx: path[0][0], cy: path[0][1] }, opacity: 1 });
      for (let s = 1; s < path.length; s++) {
        const dist = Math.hypot(path[s][0] - path[s - 1][0], path[s][1] - path[s - 1][1]);
        ptl.to(el, { attr: { cx: path[s][0], cy: path[s][1] }, duration: dist / 130, ease: 'none' });
      }
      ptl.to(el, { opacity: 0, duration: 0.15 });
    });
  }, undefined, at + 1.1);
}

/* ---------------- intro ---------------- */

function buildIntro(): gsap.core.Timeline | null {
  const hero = document.querySelector<HTMLElement>('#hero');
  if (!hero) return null;

  const pieces = gsap.utils.toArray<HTMLElement>('[data-piece]', hero);
  const nav = document.querySelector<HTMLElement>('#site-nav');
  const grid = hero.querySelector<HTMLElement>('.draft-grid');
  const typers = gsap.utils.toArray<HTMLElement>('[data-typein]', hero);
  const skip = document.querySelector<HTMLElement>('#intro-skip');

  const tl = gsap.timeline({
    defaults: { ease: 'power4.out' },
    onComplete: () => skip && gsap.to(skip, { autoAlpha: 0, duration: 0.2 }),
  });

  // phase 0 — draft grid draws down the page
  if (grid) {
    tl.fromTo(grid, { opacity: 0, scaleY: 0, transformOrigin: 'top center' },
      { opacity: 1, scaleY: 1, duration: 0.5, ease: 'power2.out' }, 0);
  }
  if (skip) tl.set(skip, { autoAlpha: 1 }, 0);
  if (nav) tl.set(nav, { autoAlpha: 0 }, 0);

  // phase 1 — pieces appear as dashed ghosts with live dimension tags
  pieces.forEach((p, i) => {
    const from = pieceFrom(p);
    tl.set(p, { ...from, autoAlpha: 0, rotation: i % 2 ? 0.6 : -0.6 }, 0);
    tl.to(p, { autoAlpha: 1, duration: 0.22, onStart: () => ghostOn(p) }, 0.3 + i * 0.08);
  });

  // phase 2 — mechanical snap with slight overshoot, ghosts + tags dissolve
  pieces.forEach((p, i) => {
    tl.to(p, {
      x: 0, y: 0, scale: 1, rotation: 0,
      duration: 0.6,
      ease: 'back.out(1.5)',
      onComplete: () => ghostOff(p),
    }, 0.95 + i * 0.07);
  });

  // phase 3 — headline types in
  typers.forEach((el, i) => typeIn(tl, el, 1.45 + i * 0.32));

  // phase 3.5 — the system schematic wires itself up
  schematicIntro(tl, 1.2);

  // phase 4 — polish: nav assembles, grid recedes to faint
  if (nav) tl.to(nav, { autoAlpha: 1, duration: 0.5 }, 2.4);
  if (grid) tl.to(grid, { opacity: 0.5, duration: 0.6, ease: 'none' }, 2.4);

  return tl;
}

/* ---------------- scroll assembly ---------------- */

function initScrollAssembly() {
  gsap.utils.toArray<HTMLElement>('[data-assemble]').forEach((section) => {
    const pieces = gsap.utils.toArray<HTMLElement>('[data-piece]', section);
    if (!pieces.length) return;

    gsap.set(pieces, { autoAlpha: 0 });

    ScrollTrigger.create({
      trigger: section,
      start: 'top 78%',
      once: true,
      onEnter: () => {
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
        pieces.forEach((p, i) => {
          const from = pieceFrom(p);
          tl.set(p, { ...from, rotation: i % 2 ? 0.4 : -0.4 }, 0);
          tl.to(p, { autoAlpha: 1, duration: 0.2, onStart: () => ghostOn(p) }, i * 0.06);
          tl.to(p, {
            x: 0, y: 0, scale: 1, rotation: 0,
            duration: 0.55,
            ease: 'back.out(1.4)',
            onComplete: () => ghostOff(p),
          }, 0.14 + i * 0.06);
        });
        const typers = gsap.utils.toArray<HTMLElement>('[data-typein]', section);
        typers.forEach((el, i) => typeIn(tl, el, 0.15 + i * 0.2));
      },
    });
  });
}

/* ---------------- scroll flourishes ---------------- */

function initScrollFlourishes() {
  // hero content drifts up slightly as it leaves — cheap depth
  const hero = document.querySelector<HTMLElement>('#hero .hero-parallax');
  if (hero) {
    gsap.to(hero, {
      yPercent: -7,
      opacity: 0.35,
      ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'bottom bottom', end: 'bottom 20%', scrub: true },
    });
  }

  // process: acid progress line fills as you scroll the section
  const line = document.querySelector<HTMLElement>('#process-line');
  if (line) {
    gsap.fromTo(line, { scaleX: 0 }, {
      scaleX: 1,
      transformOrigin: 'left center',
      ease: 'none',
      scrollTrigger: { trigger: '#process', start: 'top 70%', end: 'bottom 60%', scrub: true },
    });
  }
}

/* ---------------- boot ---------------- */

function runBoot(): gsap.core.Timeline {
  const boot = gsap.timeline();
  const loader = buildLoader();
  if (loader) boot.add(loader, 0);
  const intro = buildIntro();
  if (intro) boot.add(intro, loader ? 1.7 : 0); // intro starts as the loader lifts
  return boot;
}

function init() {
  if (reduced) {
    document.querySelector<HTMLElement>('#loader')?.remove();
    return; // final state already in the HTML — nothing else to do
  }

  gsap.registerPlugin(ScrollTrigger);

  let boot = runBoot();

  const skip = document.querySelector<HTMLElement>('#intro-skip');
  skip?.addEventListener('click', () => boot.progress(1));

  // below-the-fold sections assemble on scroll regardless of boot state,
  // so content is never blocked behind the intro
  initScrollAssembly();
  initScrollFlourishes();

  // footer easter egg — rebuild the whole page, loader included
  document.querySelectorAll<HTMLElement>('[data-rebuild]').forEach((btn) =>
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'instant' });
      boot.kill();
      boot = runBoot();
    }),
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
