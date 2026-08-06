/* Shared vocabulary for the site's entrance and scroll-in motion.
 *
 * One easing, one rise distance, one stagger interval. The point of keeping
 * them here rather than inline at each call site is that the hero and the
 * services section should read as the same hand — two different effects at
 * two different speeds read as a template, however good each one is alone.
 */

/** easeOutQuint. The long tail is the whole character: things arrive quickly
 *  and settle slowly, which is what lets a 14px move read as weight instead
 *  of a twitch. Same curve everywhere; only durations change. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** px. Small on purpose — far enough to register, never far enough that a
 *  line of copy visibly leaves the column it belongs to. */
export const RISE = 14;

/** seconds between siblings in a stagger — cards, tiles, anything in a row. */
export const STEP = 0.07;

/** seconds between the lines of a headline. Fractionally slower than STEP:
 *  lines are read in order and a card row is taken in at a glance, so the
 *  same interval that feels deliberate down a headline feels sluggish
 *  across a grid. */
export const LINE_STEP = 0.08;

/** How far a masked line travels, as a share of its own height. More than
 *  100% because .reveal-line pads itself out to clear descenders — see the
 *  LINE REVEAL block in global.css for why the extra room is there. */
export const LINE_TRAVEL = '130%';

export const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** A split headline, plus the way back to plain text. */
export interface Split {
  /** the movers, one per rendered line, in reading order */
  lines: HTMLElement[];
  /** put the element back the way it was found */
  restore: () => void;
}

/**
 * Wrap each *rendered* line of `el` in a clipping box, so the text can rise
 * out from behind the line above it.
 *
 * The split follows the laid-out result rather than the source: words are
 * measured after the browser has wrapped them and grouped by vertical
 * offset, so it lands on whatever break points the fluid type size actually
 * produced at this viewport. That also means the split is only true for the
 * width it was measured at, which is why callers get `restore` back — run it
 * once the animation is done and the headline goes back to being ordinary
 * text that reflows normally.
 *
 * The words stay in the DOM as text. Nothing is duplicated, and nothing moves
 * to an aria-hidden layer, so a screen reader reads the headline unchanged.
 *
 * Text-only elements: any child markup inside `el` is discarded.
 */
export function splitLines(el: HTMLElement): Split {
  const original = el.textContent ?? '';
  const words = original.split(/\s+/).filter(Boolean);

  const restore = () => {
    el.textContent = original;
    el.classList.remove('reveal-lines');
  };

  if (!words.length) return { lines: [], restore };

  // measure pass: one span per word, and let the browser tell us where the
  // lines broke rather than trying to predict it from the font metrics
  el.textContent = '';
  const probes = words.map((word, i) => {
    const span = document.createElement('span');
    // keep the spaces — they are what the line breaks happen at
    span.textContent = i === words.length - 1 ? word : `${word} `;
    el.appendChild(span);
    return span;
  });

  // same offsetTop, same line. The 1px slack absorbs sub-pixel rounding
  // between spans that sit on the same baseline.
  const grouped: HTMLElement[][] = [];
  let lastTop: number | null = null;
  for (const probe of probes) {
    const top = probe.offsetTop;
    if (lastTop === null || Math.abs(top - lastTop) > 1) grouped.push([]);
    lastTop = top;
    grouped[grouped.length - 1].push(probe);
  }

  // rebuild: .reveal-line is the mask, .reveal-line__inner is what moves
  el.textContent = '';
  el.classList.add('reveal-lines');

  const lines = grouped.map((group) => {
    const line = document.createElement('span');
    line.className = 'reveal-line';

    const inner = document.createElement('span');
    inner.className = 'reveal-line__inner';
    inner.textContent = group.map((p) => p.textContent).join('').trim();

    line.appendChild(inner);
    el.appendChild(line);
    return inner;
  });

  return { lines, restore };
}
