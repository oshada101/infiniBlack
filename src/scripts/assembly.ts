/**
 * Assembly engine — "the site builds itself".
 *
 * Contract (used by every section):
 *   [data-assemble]          section root; its [data-piece] children snap in on scroll
 *   [data-piece]             element that assembles (draft ghost -> snap into place)
 *   [data-piece="left|right|up|scale"]  entry direction (default "up")
 *   [data-typein]            text types in character by character
 *   [data-flicker]           CSS hover/tap re-assemble flicker (no JS needed)
 *   #intro-skip              skip button, visible only while intro plays
 *   [data-rebuild]           replays the intro (footer easter egg)
 *
 * No JS / reduced motion => everything already in final state (JS sets the
 * draft states, so the static HTML is always the finished page).
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

  // phase 0 — blank page, draft grid draws in
  if (grid) tl.fromTo(grid, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'none' }, 0);
  if (skip) tl.set(skip, { autoAlpha: 1 }, 0);
  if (nav) tl.set(nav, { autoAlpha: 0 }, 0);

  // phase 1 — pieces appear as wireframe ghosts, scattered
  pieces.forEach((p, i) => {
    const from = pieceFrom(p);
    tl.set(p, { ...from, autoAlpha: 0, rotation: i % 2 ? 0.6 : -0.6 }, 0);
    tl.to(p, { autoAlpha: 1, duration: 0.25, onStart: () => p.classList.add('piece-ghost') }, 0.35 + i * 0.09);
  });

  // phase 2 — snap into place, ghosts dissolve
  tl.to(pieces, {
    x: 0, y: 0, scale: 1, rotation: 0,
    duration: 0.65,
    stagger: 0.07,
    onComplete: () => pieces.forEach((p) => p.classList.remove('piece-ghost')),
  }, 1.0);

  // phase 3 — headline types in
  typers.forEach((el, i) => typeIn(tl, el, 1.5 + i * 0.35));

  // phase 4 — polish: nav assembles, grid recedes to faint
  if (nav) tl.to(nav, { autoAlpha: 1, y: 0, duration: 0.5 }, 2.4);
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
          tl.to(p, { autoAlpha: 1, duration: 0.2, onStart: () => p.classList.add('piece-ghost') }, i * 0.06);
          tl.to(p, {
            x: 0, y: 0, scale: 1, rotation: 0,
            duration: 0.55,
            onComplete: () => p.classList.remove('piece-ghost'),
          }, 0.12 + i * 0.06);
        });
        const typers = gsap.utils.toArray<HTMLElement>('[data-typein]', section);
        typers.forEach((el, i) => typeIn(tl, el, 0.15 + i * 0.2));
      },
    });
  });
}

/* ---------------- boot ---------------- */

function boot() {
  if (reduced) return; // final state already in the HTML — nothing to do

  gsap.registerPlugin(ScrollTrigger);

  let intro = buildIntro();

  const skip = document.querySelector<HTMLElement>('#intro-skip');
  skip?.addEventListener('click', () => intro?.progress(1));

  // below-the-fold sections assemble on scroll regardless of intro state,
  // so content is never blocked behind the intro
  initScrollAssembly();

  // footer easter egg — rebuild the page
  document.querySelectorAll<HTMLElement>('[data-rebuild]').forEach((btn) =>
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'instant' });
      intro?.kill();
      intro = buildIntro();
    }),
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
