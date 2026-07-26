// Featured work / project data for the homepage "Work" section.

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
