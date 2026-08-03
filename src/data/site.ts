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
  href: string;
  desc: string;
  statusClass: 'is-live' | 'is-production';
  statusLabel: string;
  title: string;
  tags: string[];
  media: WorkItemMediaHoverVideo | WorkItemMediaImage;
}

export const workItems: WorkItem[] = [
  {
    href: '#',
    desc: 'Full marketing site for a fitness center — programs, trainers, memberships.',
    statusClass: 'is-live',
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
    href: '#',
    desc: 'Gym management system — members, billing, attendance, one dashboard.',
    statusClass: 'is-production',
    statusLabel: 'In Progress',
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
 * Budget brackets, in USD. Deliberately floored lower than the agency-deck
 * default of "$10k minimum" — the buyer this site is written for (see the
 * Services copy) is a small-business owner, and a ladder that starts above
 * their number reads as "not for you" and closes the tab.
 *
 * "Not sure yet" is not padding. A required budget question with no escape
 * hatch is where forms like this lose people who would have been good leads.
 */
export const budgetOptions = [
  'Under $5k',
  '$5k – $15k',
  '$15k – $50k',
  '$50k+',
  'Not sure yet',
];
