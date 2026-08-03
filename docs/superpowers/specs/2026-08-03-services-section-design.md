# Services section — design

Date: 2026-08-03
Status: approved, ready for implementation plan
Branch context: `redesign/loading-ui`

## Purpose

The nav has linked to `#services` since the redesign ([Nav.astro:14](../../../src/components/Nav.astro#L14)) but no such
section exists. This spec defines it: a Services section between Hero and Work that states what infiniBlack
sells, in language a non-technical buyer understands, with AI leading.

## Audience

The buyer is a small-business owner, not a CTO. The evidence is the portfolio itself — a gym marketing site
and a gym management system. The hero already writes for this reader ("software that actually works",
"the years they'll actually run"), and Services must match that register. No stack names, no
acronyms, no jargon in card copy. The single exception is the word "AI", which non-technical buyers already
know and search for; the sentence beneath it carries the plain explanation.

## Decisions and rationale

### Dark, not light

The reference screenshot that prompted this work is a light section. Rejected, for three reasons:

1. The nav is `position: fixed` with white text and two background states — solid over the hero, then
   `rgba(8,8,10,.6)` + blur once scrolled ([global.css:38-46](../../../src/styles/global.css#L38-L46)). Over a
   near-white panel the glass becomes an opaque black stripe and the blur does nothing. A light section
   requires a third nav state driven by a second scroll threshold, on top of the existing scrollspy.
2. Hero video → white → dark Work is two hard luminance flips within seconds of scrolling.
3. `--color-grey-100/200/300`, the `rgba(255,255,255,.08)` hairlines and the corner-dot/hatch texture in
   [global.css:94-103](../../../src/styles/global.css#L94-L103) are all tuned for dark grounds. A light section
   forks the entire token set.

The composition of the reference is kept; only the palette is discarded. The black geometric marks that make
that screenshot work are pure shape and invert to white with no loss.

### Four services, not seven

The raw list was ERP, CRM, mobile apps, desktop applications, e-commerce, "anything", with AI emphasised.
Seven equal categories against a two-project portfolio reads as a body shop. Grouped into four, in the
buyer's vocabulary, with nothing dropped:

| Card | Absorbs |
|---|---|
| AI | — |
| Websites & online stores | e-commerce (to a non-technical buyer, an online store is a website that sells) |
| Apps | mobile + desktop (the card body separates them) |
| Business software | ERP, CRM |

### AI leads via layout, not just order

A flat grid makes AI exactly as important as e-commerce. AI gets a full-width banner card above the row of
three, with larger type and the signature visual.

## Content

Copy is final as written here.

**AI** — banner
> Software that reads, writes, and answers on its own, so your team stops doing it by hand.

Tags: `Chatbots` `Document handling` `Automatic replies`

**Websites & online stores**
> The first thing your customers find. Built to load fast, look right on a phone, and turn visitors into enquiries.

Tags: `Marketing sites` `Online stores` `Landing pages`

**Apps**
> Your product on a phone, or on the computers in your office. Same team builds both.

Tags: `iPhone` `Android` `Windows & Mac`

**Business software**
> Members, billing, staff, stock — run it all in one place instead of ten spreadsheets.

Tags: `Dashboards` `Billing` `Reports`

Tags carry concrete examples, not technology names and not restatements of the sentence above them.
"Business software" describes Kratos, which appears two sections below — the card has proof nearby.

## Visual system

No new design tokens. Everything below already exists in `global.css`.

**Color**

| Role | Value |
|---|---|
| Section ground | `--color-ink` `#0a0a0d` |
| Card surface | `#111114` |
| Hairline / card border | `rgba(255,255,255,.08)` |
| Card border, hover | `rgba(255,255,255,.2)` |
| Card title | `#f2f2f2` |
| Card body | `--color-grey-300` `#8a8a92` |
| Diamond blobs (AI card only) | `#ff6a37` `#ff9a2e` `#9a5cff` `#3f6bff` `#ff3f9a` |

The five gradient colours are the loader's own, and appear in exactly one place on the page: inside the
AI card's diamond.

**Type** — one family (Google Sans Flex), worked through its variable axes rather than pairing in a second face.

| Element | Setting |
|---|---|
| "Services." | `clamp(2.2rem,5.5vw,4rem)`, `tracking-[-.02em]`, `text-grey-200` — identical to Featured Work, so the two sections read as siblings |
| AI card title | `clamp(1.7rem,3vw,2.6rem)`, `font-variation-settings: 'opsz' 40` |
| Card titles | `clamp(1.15rem,1.8vw,1.4rem)`, `tracking-[-.015em]` |
| Card body | `.95rem`, `leading-[1.45]` |
| Tags | `.72rem`, `font-semibold`, `uppercase`, `tracking-[.06em]` — reuses the status-chip vocabulary from `work-item__status` |

The headline deliberately does **not** match the reference's ~12vw scale. At that size a section label
becomes the largest type on the page, louder than the hero h1 (`clamp(2.3rem,6.4vw,5rem)`) which carries
the site's actual thesis.

No eyebrow label. Work has none, and adding one to Services alone leaves the pair unresolved.

**Layout**

```
Services.
------------------------------------------------
+----------------------------------------------+
|  (diamond)   AI                              |
|              Software that reads, writes...  |
|              [Chatbots] [Documents] [Replies]|
+----------------------------------------------+
+---------------+ +---------------+ +---------------+
| (mark)        | | (mark)        | | (mark)        |
| Websites &    | | Apps          | | Business      |
| online stores | |               | | software      |
| body copy     | | body copy     | | body copy     |
| [tags]        | | [tags]        | | [tags]        |
+---------------+ +---------------+ +---------------+
```

The banner puts the visual left and copy right, matching Work's media-left / info-right rhythm.
Below 860px — the same breakpoint the nav and work-item rules already use — the grid collapses to one column
and the banner stacks the diamond above its copy.

Explicitly **not** used: the sticky-stacking-card effect from
[global.css:74-80](../../../src/styles/global.css#L74-L80). That belongs to Work; repeating it makes it the
site's only trick rather than its signature.

## Signature element

The loader's fluid diamond returns as the AI card's visual.

Today that SVG — a goo-filtered cluster of five drifting coloured blobs clipped to a diamond
([Loader.astro:13-48](../../../src/components/Loader.astro#L13-L48)) — is the most distinctive asset on the
site, and `curtain.remove()` deletes it from the DOM about 4.5 seconds after load
([Loader.astro:64](../../../src/components/Loader.astro#L64)). Reusing it on the AI card brings the brand's
own mark back into the page and gives the section one loud element with three quiet ones around it.

Differences from the loader's version:

- **Static diamond shape.** The dot-to-diamond `<animate>` on the clip path belongs to the entrance
  sequence and is dropped. The clip path is authored directly at its final geometry.
- **Blobs still drift**, reusing the existing `drift1`–`drift5` keyframes and `.blob` class. No new CSS.
- **Suffixed element IDs** — `svc-diamond`, `svc-goo`, `svc-gCoral` and so on. The loader's originals are
  live in the DOM for the first ~4.5 seconds; duplicate IDs are invalid and the `url(#…)` references would
  collide.

The three lower cards get monochrome white line marks drawn from the same diamond geometry, and no colour.

## Motion

- AI diamond: ambient blob drift, continuous, already-written keyframes.
- Cards: border hairline brightens to `rgba(255,255,255,.2)` on hover and on keyboard focus. Nothing else.
- `prefers-reduced-motion`: already handled. [global.css:214](../../../src/styles/global.css#L214) sets
  `.blob { animation: none }`, and the reused markup keeps the `.blob` class, so the diamond becomes a still
  image for those users with no extra rule.

## Structure and integration

**New** `src/components/Services.astro` — markup plus the inline diamond SVG. Takes no props; unlike Hero,
Work and Nav it references no files under `public/`, so it does not need `base`.

**Modified** `src/data/site.ts` — add a `Service` interface and a `services` array beside `workItems`,
following the existing data-out-of-markup pattern. Fields: `title`, `desc`, `tags`, `icon` (a key selecting
one of the inline marks), `featured` (boolean, true for AI only).

**Modified** `src/pages/index.astro` — import and mount `<Services />` between `<Hero />` and `<Work />`, and
add `{ el: document.querySelector('#services'), link: document.querySelector('.nav__links a[href="#services"]') }`
to the `spySections` array ([index.astro:38-41](../../../src/pages/index.astro#L38-L41)) so the nav link
highlights. Array order must stay document order — the scrollspy loop takes the last section above the line.

**Modified** `src/styles/global.css` — a small `/* --- services --- */` block for the card surface and hover
border. Card layout is Tailwind utilities in the component, matching how Work is written.

The section root is `<section id="services">` with `scroll-margin-top` set clear of the 36px fixed nav, so
the anchor link does not land under it.

## Quality floor

- Single column below 860px; no horizontal overflow at 320px.
- Cards are not links and take no tab stop. If they later become links, the hover border state must also
  apply on `:focus-visible`.
- Decorative SVGs carry `aria-hidden="true"`; the section is labelled by its `h2`.
- Body copy meets 4.5:1 against the card surface — `#8a8a92` on `#111114` is 5.5:1.

## Out of scope

Contact/CTA at the end of the section, a services detail page, per-service case-study links, and any
change to the loader or to Work.
