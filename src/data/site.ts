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

export interface WorkItem {
  /** url segment for the project's own page, /work/<slug>/ */
  slug: string;
  desc: string;
  title: string;
  tags: string[];
  media: WorkItemMediaHoverVideo | WorkItemMediaImage;

  /* --- the project's own page ------------------------------------------ *
   *  PLACEHOLDER COPY. Written to hold the shape of the layout; replace it
   *  with what actually happened on each job before this goes out. Nothing
   *  below invents a figure, a date or a name for that reason.
   * --------------------------------------------------------------------- */

  /** the write-up, one string per paragraph */
  body: string[];
  /** the column beside it: label above value, no rules, everything one size */
  meta: { label: string; value: string }[];
  /** what was actually handed over, under its own heading */
  delivered: { heading: string; items: string[] };
  /** the work itself, stacked under the write-up. Videos come first — the
      page enforces that, so the order here is only a convenience. */
  gallery: WorkGalleryItem[];
}

export type WorkGalleryItem =
  | { kind: 'video'; src: string; poster?: string }
  | { kind: 'image'; src: string; alt: string };

export const workItems: WorkItem[] = [
  {
    slug: 'glorious-fitness-center',
    desc: 'Full marketing site for a fitness center — programs, trainers, memberships.',
    title: 'Glorious Fitness Center',
    tags: ['Marketing Site', 'Fitness', '2025'],
    media: {
      kind: 'hover-video',
      img: { src: 'projects/glorious.jpg', alt: 'Glorious wordmark on a dark field' },
      video: { src: 'projects/glorious.mp4' },
    },
    body: [
      'Glorious Fitness Center runs a full timetable, a room of trainers and a membership desk. What it did not have was anywhere to send someone who had heard about the place and wanted to know what it costs, who teaches, and when the doors open.',
      'So the site does the work the front desk was doing twice a day. Programs are laid out the way a person asks about them — what it is, who it suits, when it runs — and every trainer gets a face and a name rather than a job title. The enquiry sits one tap away on every screen, because on a phone, in a car park, that is where the decision actually gets made.',
    ],
    meta: [
      { label: 'Client', value: 'Glorious Fitness Center' },
      { label: 'Role', value: 'Marketing site — design, build and launch' },
    ],
    delivered: {
      heading: 'infiniblack for Glorious Fitness Center',
      items: [
        'Site design',
        'Program and timetable pages',
        'Trainer profiles',
        'Membership enquiry flow',
        'Photography and video direction',
        'Copywriting',
        'Launch and handover',
      ],
    },
    gallery: [
      { kind: 'video', src: 'projects/glorious.mp4', poster: 'projects/glorious.webp' },
      { kind: 'image', src: 'projects/glorious.webp', alt: 'Glorious Fitness Center — home page' },
    ],
  },
  {
    slug: 'kratos',
    desc: 'Gym management system — members, billing, attendance, one dashboard.',
    title: 'Kratos',
    tags: ['Dashboard', 'Gym Management', 'Ongoing'],
    media: {
      kind: 'image',
      img: {
        src: 'projects/kratos.jpg',
        alt: 'Kratos wordmark on a red field',
        style: 'width:100%;height:100%;object-fit:cover;',
      },
    },
    body: [
      'A gym knows things about itself that live in six different places: who is a member, who has paid, who actually turned up, who is on the floor this morning. Kratos is the one place to keep them, built so the person on the desk can answer any of those questions without opening anything else.',
      'The work is ongoing. We build it in short cycles against a real gym running real days, which is the only way to find out that renewals matter more than reports and that attendance has to be one tap, not a form.',
    ],
    meta: [
      { label: 'Client', value: 'Kratos' },
      { label: 'Role', value: 'Product design and engineering, ongoing' },
    ],
    delivered: {
      heading: 'infiniblack for Kratos',
      items: [
        'Member records',
        'Billing and renewals',
        'Attendance',
        'Staff accounts and permissions',
        'Reporting dashboard',
        'Weekly build cycles',
      ],
    },
    // alt text is honest but generic — replace it with what each screen
    // actually shows, which only someone who has used the thing can write
    gallery: [
      { kind: 'image', src: 'projects/kratos-1.png', alt: 'Kratos gym management system — screen one' },
      { kind: 'image', src: 'projects/kratos-2.png', alt: 'Kratos gym management system — screen two' },
      { kind: 'image', src: 'projects/kratos-3.png', alt: 'Kratos gym management system — screen three' },
      { kind: 'image', src: 'projects/kratos-4.png', alt: 'Kratos gym management system — screen four' },
    ],
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
