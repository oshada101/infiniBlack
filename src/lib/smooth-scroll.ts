/* Smooth scrolling, by easing the real scroll position.
 *
 * The usual way to do this is to fix a wrapper at the top of the viewport and
 * translate it — never scrolling the document at all. That is not available
 * here and it never will be: this site has three `position: sticky` elements
 * (the work list's pinned rows, the project stage's frame) and a fixed nav,
 * and none of them can work in a page that does not actually scroll. The
 * project stage also drives its shrink from a CSS `view-timeline`, which
 * reads scroll offset directly.
 *
 * So the document keeps scrolling for real. What changes is that the wheel no
 * longer writes the scroll position — it writes a TARGET, and each frame the
 * real position is eased a fraction of the remaining distance toward it.
 * Everything downstream (sticky, the view-timeline, the scrollspy, every
 * IntersectionObserver on the page) sees an ordinary scroll, just one that
 * moves in smooth ramps instead of wheel-sized steps.
 */

/** Share of the remaining distance covered per frame at 60fps. Higher is
 *  tighter to the wheel, lower is floatier. .12 lands about 250ms behind a
 *  flick, which is enough to smooth a notched mouse wheel without the page
 *  feeling like it is on ice. */
const LERP = 0.12;

/** px. Below this the ease is over — chasing the last fraction of a pixel
 *  only keeps a rAF loop alive for nothing. */
const EPSILON = 0.15;

/** px of tolerance when deciding whether a scroll event was our own write.
 *  Sub-pixel positions and zoom mean an exact comparison is not safe. */
const OWN_WRITE = 2;

/**
 * Ease the document's scroll position instead of jumping it.
 *
 * Returns a teardown function. Does nothing, and returns a no-op, when the
 * takeover would be wrong: see the guards below.
 */
export function smoothScroll(): () => void {
  const noop = () => {};

  // Reduced motion is the whole point of the setting — a page that glides
  // when you asked it not to is exactly what it is there to prevent.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return noop;

  // Touch only. Phones and trackpads-as-touch already have momentum
  // scrolling built by the platform, tuned to that platform, and taking it
  // over reliably makes it worse rather than better. This is for the wheel.
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return noop;

  let target = window.scrollY;
  let current = window.scrollY;
  let frame = 0;
  let lastWrite = window.scrollY;
  let lastTime = 0;

  const maxScroll = () =>
    Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  /* Walk up from whatever the pointer is over looking for something that
     scrolls itself and still has room to move THIS way. The contact dialog is
     the live case — it is a scrollable panel over a locked page, and a wheel
     inside it has to reach it rather than being eaten out here. Doing it by
     capability rather than by selector means anything scrollable added later
     keeps working without this file knowing about it. */
  const scrollableUnder = (node: EventTarget | null, delta: number): boolean => {
    let el = node instanceof Element ? node : null;

    while (el && el !== document.body && el !== document.documentElement) {
      const style = getComputedStyle(el);
      const scrolls = /(auto|scroll|overlay)/.test(style.overflowY);
      const room = el.scrollHeight > el.clientHeight;

      if (scrolls && room) {
        const atTop = el.scrollTop <= 0;
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
        // only yield if it can actually take the scroll in this direction,
        // so a panel scrolled to its end hands the page back
        if (!((delta < 0 && atTop) || (delta > 0 && atBottom))) return true;
      }
      el = el.parentElement;
    }
    return false;
  };

  /* The page is not ours to scroll while the loader holds it or a modal has
     it locked. Read the two mechanisms directly — the loader's class on
     <html>, the modal's inline overflow on <body> — rather than asking for a
     computed style on every wheel event, which is a style read the browser
     does not need to do sixty times a second. */
  const locked = () =>
    document.documentElement.classList.contains('is-loading') ||
    document.body.style.overflow === 'hidden' ||
    !!document.querySelector('dialog[open]');

  const tick = (now: number) => {
    // Frame-rate independent: the same LERP has to mean the same speed on a
    // 60Hz panel and a 120Hz one, or the effect is twice as fast on better
    // hardware. Compounding it over the elapsed frame count does that.
    const dt = lastTime ? Math.min(now - lastTime, 50) : 16.67;
    lastTime = now;

    const eased = 1 - Math.pow(1 - LERP, dt / 16.67);
    current += (target - current) * eased;

    if (Math.abs(target - current) < EPSILON) {
      current = target;
      frame = 0;
      lastTime = 0;
    } else {
      frame = requestAnimationFrame(tick);
    }

    lastWrite = current;
    // `instant` on purpose: <html> carries scroll-behavior:smooth for anchor
    // links, and without this override the browser would try to smooth-scroll
    // to every one of our eased positions — two easings fighting over one
    // scroll offset, which reads as drag.
    window.scrollTo({ top: current, behavior: 'instant' });
  };

  const start = () => {
    if (!frame) {
      lastTime = 0;
      frame = requestAnimationFrame(tick);
    }
  };

  const onWheel = (e: WheelEvent) => {
    if (locked() || e.ctrlKey) return;          // ctrl+wheel is browser zoom
    if (scrollableUnder(e.target, e.deltaY)) return;

    e.preventDefault();

    // deltaMode 1 is lines, 2 is pages — Firefox uses lines. Normalise, or
    // one browser scrolls three pixels a notch and another scrolls three
    // screens.
    const step =
      e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;

    target = Math.min(maxScroll(), Math.max(0, target + step));
    start();
  };

  /* Anything that moves the page without going through the wheel — dragging
     the scrollbar, page-down, an anchor jump, scrollIntoView, the browser
     restoring position on reload — has to become the new truth, or the next
     wheel notch would yank the page back to wherever our target had been
     left. Native smooth-scrolled anchors fire this every frame of their own
     animation, which is what keeps the two from fighting. */
  const onScroll = () => {
    if (Math.abs(window.scrollY - lastWrite) <= OWN_WRITE) return;
    target = current = window.scrollY;
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    }
  };

  const onResize = () => {
    target = Math.min(maxScroll(), target);
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  return () => {
    if (frame) cancelAnimationFrame(frame);
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
  };
}
