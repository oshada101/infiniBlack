// Content for the homepage "Services", "Work" and "Contact" sections.

// --- services -------------------------------------------------------------

export interface Service {
  title: string;
  desc: string;
  /** selects one of the inline marks drawn in Services.astro */
  icon: 'ai' | 'websites' | 'apps' | 'business' | 'marketing';
  /** short examples, shown as pills on the grid cards */
  tags?: string[];
  /** worked examples for the featured banner, which is too wide for pills */
  details?: { label: string; body: string }[];
  /** the one service that gets the full-width banner treatment */
  featured?: boolean;
}

// Copy is written for a non-technical buyer: no stack names, no acronyms.
// "AI" is the deliberate exception — it's the one technical word this
// audience already searches for.
export const services: Service[] = [
  {
    title: 'AI',
    desc: 'Software that reads, writes, and answers on its own, so your team stops doing it by hand.',
    icon: 'ai',
    featured: true,
    details: [
      { label: 'Chatbots', body: 'Answers your customers at 2am, in your words, without a person on shift.' },
      { label: 'Document handling', body: 'Reads invoices, forms and IDs, and files what it finds where it belongs.' },
      { label: 'Automatic replies', body: 'Drafts the response. Your team reads it, changes what they want, sends.' },
    ],
  },
  {
    title: 'Websites & online stores',
    desc: 'The first thing your customers find. Built to load fast, look right on a phone, and turn visitors into enquiries.',
    tags: ['Marketing sites', 'Online stores', 'Landing pages'],
    icon: 'websites',
  },
  {
    title: 'Apps',
    desc: 'Your product on a phone, or on the computers in your office. Same team builds both.',
    tags: ['iPhone', 'Android', 'Windows & Mac'],
    icon: 'apps',
  },
  {
    title: 'Business software',
    desc: 'Members, billing, staff, stock — run it all in one place instead of ten spreadsheets.',
    tags: ['Dashboards', 'Billing', 'Reports'],
    icon: 'business',
  },
  {
    title: 'Marketing',
    desc: 'Built is only half of it. Search, ads, and content that put you in front of people already looking for what you do.',
    tags: ['Google ranking', 'Paid ads', 'Social content'],
    icon: 'marketing',
  },
];

// --- featured work / projects ---------------------------------------------

export interface WorkItemMediaHoverVideo {
  kind: 'hover-video';
  img: { src: string; alt: string };
  video: { src: string };
}

export interface WorkItemMediaImage {
  kind: 'image';
  img: { src: string; alt: string; style: string };
}

/* The studio's pipeline, in order. The track under each work card fills to
   the project's current phase, so "how far along is this" is legible from
   the length of one rule instead of from the wording of a label. Adding a
   phase here re-segments every track; nothing else needs to change. */
export const workPhases = ['Scope', 'Design', 'Build', 'Ship'] as const;

export interface WorkItem {
  /** url segment for the project's own page, /work/<slug>/ */
  slug: string;
  desc: string;
  /** phases completed, 1..workPhases.length. Full length = shipped. */
  phase: number;
  /** names the phase the project is *in*, shown beside the track */
  statusLabel: string;
  title: string;
  tags: string[];
  media: WorkItemMediaHoverVideo | WorkItemMediaImage;
}

export const workItems: WorkItem[] = [
  {
    slug: 'glorious-fitness-center',
    desc: 'Full marketing site for a fitness center — programs, trainers, memberships.',
    phase: 4,
    statusLabel: 'Shipped',
    title: 'Glorious Fitness Center',
    tags: ['Marketing Site', 'Fitness', '2025'],
    media: {
      kind: 'hover-video',
      img: { src: 'projects/glorious.webp', alt: 'Glorious Fitness Center' },
      video: { src: 'projects/glorious.mp4' },
    },
  },
  {
    slug: 'kratos',
    desc: 'Gym management system — members, billing, attendance, one dashboard.',
    phase: 3,
    statusLabel: 'In Build',
    title: 'Kratos',
    tags: ['Dashboard', 'Gym Management', 'Ongoing'],
    media: {
      kind: 'image',
      img: {
        src: 'projects/kratos.png',
        alt: 'Kratos gym management system',
        style: 'width:100%;height:100%;object-fit:cover;',
      },
    },
  },
];

/** Where a work card points. One place, so the cards and the routes that
    back them can't drift apart. `base` is import.meta.env.BASE_URL. */
export const workHref = (base: string, item: WorkItem) => `${base}work/${item.slug}/`;

// --- contact --------------------------------------------------------------

export interface SocialLink {
  label: string;
  href: string;
  /** selects one of the inline glyphs drawn in Contact.astro */
  icon: 'instagram' | 'linkedin' | 'facebook';
}

export const contact = {
  email: 'hello@infiniblack.com',

  // TODO: replace with the real profile URLs before this ships. Order is
  // deliberate — LinkedIn is where a B2B buyer actually checks you out.
  socials: [
    { label: 'LinkedIn', href: '#', icon: 'linkedin' },
    { label: 'Instagram', href: '#', icon: 'instagram' },
    { label: 'Facebook', href: '#', icon: 'facebook' },
  ] as SocialLink[],

  /**
   * Where the request form POSTs (Formspree, Web3Forms, or any endpoint
   * that accepts JSON). The site is static on GitHub Pages, so there is no
   * server of our own to receive it.
   *
   * Left empty on purpose: while it is empty the form falls back to opening
   * the visitor's mail client with every answer pre-filled, so the modal is
   * never a dead end. Set it and the fallback stops being used.
   */
  formEndpoint: '',
};

/**
 * The line that cycles beside the closing statement.
 *
 * These are deliberately claims about how the studio works, not figures.
 * A number ("6 weeks average", "48h median reply") reads as measurement and
 * has to survive someone checking it; a statement about your own process is
 * a promise you control. Cut any line here you wouldn't repeat on a call —
 * this is the last thing a visitor reads, so it has to be true.
 */
export const reasons = [
  'One team designs it, builds it, and ships it.',
  'We automate our own work first, then yours.',
  'Weekly demos, so you see it long before it’s done.',
  'You get the code, the docs, and the training.',
  'Short cycles. Weeks, not quarters.',
];

/**
 * How urgent the work is. This is the question a budget bracket was really
 * standing in for: it tells us whether to answer with a slot or a proposal,
 * and unlike a price it costs the visitor nothing to answer honestly.
 */
export const deadlineOptions = [
  'Yes',
  'No, I’m in no rush',
  'No deadline, but asap please',
];

/**
 * Where the request came from. Swap these for whichever channels are
 * actually running — a list naming places you don't appear collects noise,
 * and the only reason to ask is to learn which spend is working.
 */
export const sourceOptions = [
  'Google',
  'LinkedIn',
  'Instagram',
  'Facebook',
  'A referral',
  'Other',
];
