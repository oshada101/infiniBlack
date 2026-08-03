# infiniBlack — design direction

A plan for making the site look like it was made by someone, not assembled from
current best practice. Written after reading every component and the full
stylesheet.

---

## The finding

The site's execution is above average and its identity is missing. Every choice
on the page is the *reasonable* one, defended in a comment. A design where all
hundred decisions are justifiable is one where none of them are anyone's — and
that reads as machine-made regardless of how good the individual decisions are.

Concretely, the page currently wears a uniform: near-black ground, one vermilion
accent, hairline rules at three opacities, zero border-radius, tight negative
tracking, fluid `clamp()` on every dimension. That combination describes Linear,
Vercel, Resend, Framer, and roughly every technical-studio site since 2021.

**But the identity is already built, and it's being thrown away.**

`Loader.astro` opens the site with a diamond aperture that grows from a 4-unit
dot into a full 100×170 prism, revealing white and then a gooey field of five
colours inside it. It is the only thing on this site that could not appear
anywhere else. It runs for about 1.4 seconds, and then the site forgets it —
the shape reappears exactly once, as an 88–128px decoration inside a Services
card (`global.css:83`), and its five colours are never seen again.

The name is infiniBlack. The mark is a black field with all the colour inside
it. That is a complete identity sitting unused in a loading screen.

---

## The idea

**Black is the ground. Colour exists only inside an aperture.**

Not a rule about the logo — a law about the whole page. Colour is never a fill,
never a border, never a highlight, never a 2px accent bar. Colour is always seen
*through* a clipped shape, the way it already works in the loader and the
Services diamond. Black isn't the absence of colour on this site; it's what's
holding it.

This is a small conceptual step from what exists and a large visual one, because
it forces the deletion of the accent-colour system that is doing most of the
work of making the site look generic.

---

## System

### Colour

| Token | Value | Role |
| --- | --- | --- |
| `--ink` | `#0a0a0d` | ground, everywhere |
| `--panel` | `#08080a` | nav |
| `--paper` | `#f2f2f2` | the wipe, inverted type |
| grey 100/200/300 | `#d4d4d8` `#c7c7c7` `#8a8a92` | type hierarchy |
| prism | `#ff6a37` `#ff9a2e` `#9a5cff` `#3f6bff` `#ff3f9a` | **aperture interiors only** |

**Delete `--color-accent: #ff5a2a` as a UI colour** (`global.css:12`). It
currently appears as the nav active state, the nav superscript, and the contact
tick fill. Each of those becomes either white/grey, or an aperture.

The orange doesn't disappear from the site — it stops being a highlighter and
becomes one of the five hues living inside the prism. This single deletion
removes the "near-black plus one hot accent" signature outright.

### Type

One family, both axes used properly. `Google+Sans+Flex:opsz,wght@6..144,1..1000`
is already loaded (`Layout.astro:31`) and the site uses `opsz` 40/96 and `wght`
400/600 — the safe middle of a 1000-point range.

| Role | Setting | Notes |
| --- | --- | --- |
| Display | `opsz 144`, `wght 250`, tracking `-.04em` | light and huge, not medium and large |
| Sub-display | `opsz 40`, `wght 400` | project and service names |
| Body | `opsz 24`, `wght 400`, leading 1.4 | |
| Utility / data | `opsz 6–8`, `wght 700`, tracking `.1em`, uppercase | small text set at low optical size is what the axis is *for*, and almost nobody does it |

Contrast comes from the axes, not from a second typeface. Adding a mono for the
label layer would be another default, and would cost a font request.

### Rhythm

Give each section a tempo instead of the identical band. Right now every section
is `border-t` hairline + `pt-[clamp(72–140px)]` + left-aligned type, and the
scroll never changes pace.

| Section | Tempo | Move |
| --- | --- | --- |
| Hero | held | full-bleed, near-silent, one statement |
| Services | dense | tighter padding, more cells, crowded on purpose |
| Work | wide and slow | most generous space on the page, one project at a time |
| Contact | loud | largest type, the wipe, close hard |

The calm sections only read as calm if something is not calm.

### Gesture

The site has two motions and should keep exactly two:

1. **The aperture** — a diamond clip growing from a point (loader, `Loader.astro:17`)
2. **The wipe** — left-to-right `clip-path: inset()` (contact actions, `global.css:388`)

Everything that moves should be one of these two. No fades, no rises, no
staggered reveals bolted on elsewhere.

---

## Moves, in order

### 1. Let the diamond out — *highest leverage, do first*

Give the mark a life after the loader.

- Establish continuity: the loader's diamond should hand off to something, not
  vanish. The curtain opens onto a hero that still contains it.
- Let the prism colours appear at page scale at least once, always through a
  clip. Candidates: behind the Contact statement, as a full-height aperture at a
  section seam, or as the hero's own subject.
- Retire the Services card's decorative usage, or promote it — right now it's
  neither the mark nor decoration, it's the mark used as decoration.

**Risk:** overexposure. The diamond is strong because it's rare. Two or three
appearances at real scale, not eight.

### 2. Rewrite the hero copy

Current h1: *"An engineering powerhouse shipping software that actually works."*
"Powerhouse" is a brag; "actually works" is an insult aimed at competitors,
smiling. Then the body drops to lowercase and gets calm, and the page doesn't
sound human until the Contact section — which is the best writing on the site:

> Tell us what you're building. We reply within 48 hours, and there's no sales call.

Specific, confident, selling nothing. **The hero should sound like that.** Right
now the page opens in bragging voice and only relaxes at the bottom, after most
people have gone.

### 3. Break the rhythm

Pick one section — Services is the natural candidate — and make it genuinely
dense: tighter padding, smaller type, more per screen. Cheap to do, and it makes
Work and Contact read as deliberate rather than default.

### 4. Recompose the work card

The original question, answered properly this time.

- **Revert what I added.** The phase track was another evenly-spaced,
  hairline-ruled, uppercase-labelled, accent-tinted module on a page that has too
  many. It made the uniformity worse, not better.
  `git checkout src/components/Work.astro src/styles/global.css src/data/site.ts`
- **Kill the two-rectangle composition.** Media block, gap, text block, 55/35 is
  the most generic arrangement two elements can have, and every fix I proposed
  was decoration inside it. Let the project name cross onto the media, or
  full-bleed the media past the section inset and set the type in the margin.
- **Let the projects supply the colour.** The Work section should have no colour
  of its own. Glorious is broadcast-red; Kratos is a dashboard. Their thumbnails
  are the only colour in the section, and that's correct under the aperture law.
- **Replace the `[View Project]` tooltip** with the aperture gesture — hovering a
  project opens the video through a diamond that grows from the cursor. One
  gesture, reused, instead of a generic hover chip.
  *Risk: could read as gimmick at card scale. Prototype before committing.*
- **Let each project deform its own card.** Riskiest item on this list, and the
  one that most separates a portfolio from a CMS template.

---

## Explicitly not doing

- Adding a monospace face for labels — a default, and a wasted request.
- `01 / 02 / 03` numbering, progress bars, tabular-figure counters. I shipped one
  of these after warning against it in the same conversation.
- Cream ground + high-contrast serif + terracotta. The other current default.
- Border-radius. The hard edge is right for this and should stay.
- More hairlines. There are enough.

---

## Open questions

1. **How far does this go?** Items 2–4 are a strong revision. Item 1 is a
   rebrand of the site around a mark you already own. Both are legitimate; they
   are different amounts of work.
2. **What is the hero video?** If it's a showreel, it competes with the diamond
   for the hero's thesis and one of them has to yield.
3. **Are there more projects coming?** Two cards is a list; six is a section
   worth composing. It changes whether per-project treatment is worth building.
4. **Is the orange load-bearing elsewhere** — deck, invoices, social? Deleting it
   from the UI is easy; deleting it from a brand is not.

---

## Sequencing

**First pass** — cheap, low risk, most of the improvement: hero copy, delete the
accent, type axes, break the rhythm on one section.

**Second pass** — the diamond at page scale, and the work card recomposition.

**Third pass** — per-project treatment, if the project count justifies it.

Do the first pass and look at it before committing to the second. The accent
deletion and the type-axis change alone will shift the page more than anything
I've done so far.
