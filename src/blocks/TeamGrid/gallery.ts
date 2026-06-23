import type { Media, Team, TeamCategory, TeamGridBlock as TeamGridBlockProps } from '@/payload-types'
import type { GalleryBlock } from '@/blocks/gallery-types'

import { prose } from '@/blocks/gallery-helpers'

// Mirror the Webflow Team Categories the directory filters on.
const cat = (title: string, slug: string): TeamCategory =>
  ({ id: slug, title, slug }) as unknown as TeamCategory

const board = cat('Board of Directors', 'board-of-directors')
const advisory = cat('Advisory Council', 'advisory-council')
const nyState = cat('MAPS NY', 'new-york-state-committee')
const txState = cat('MAPS TX', 'maps-texas-state-committee')

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

// Real portrait headshots, copied into tracked public/import/team by the Webflow
// importer — individual portraits so the showroom reads like a real directory.
const portrait = (file: string, name: string): Media => {
  const ext = file.split('.').pop()?.toLowerCase() ?? 'jpg'
  return {
    id: file,
    alt: `Portrait of ${name}`,
    url: `/import/team/${file}`,
    width: 600,
    height: 600,
    mimeType: MIME[ext] ?? 'image/jpeg',
    filename: file,
    updatedAt: '2026-06-23T00:00:00.000Z',
    createdAt: '2026-06-23T00:00:00.000Z',
  } as unknown as Media
}

// The card + modal read name/job title/categories/photo/bio; build just those and
// present them as Team docs. Selection mode avoids a DB round-trip here. Contact
// fields are varied (some both, some one, some none) to exercise the conditional
// LinkedIn/email icons. Names/photos are real members; titles/groups are demo.
const member = (
  name: string,
  jobTitle: string,
  categories: TeamCategory[],
  file: string,
  extra: Partial<Team> = {},
): Team =>
  ({
    id: name,
    name,
    jobTitle,
    categories,
    photo: portrait(file, name),
    bio: prose(`${name} serves with MAPS National, supporting Muslim Americans across public service.`),
    ...extra,
  }) as unknown as Team

const members: Team[] = [
  member('Hon. Asim Rehman', 'Board Chair', [board], 'hon-asim-rehman.webp', {
    email: 'asim@example.org',
    linkedin: 'https://www.linkedin.com',
  }),
  member('Fatema Z. Sumar', 'Vice Chair', [board], 'fatema-z-sumar.png', {
    linkedin: 'https://www.linkedin.com',
  }),
  member('Yusufi Vali', 'Treasurer', [board], 'yusufi-vali.png'),
  member('Dr. Hashima Hasan', 'Secretary', [board], 'dr-hashima-hasan.png', {
    email: 'hashima@example.org',
  }),
  member('Hasan Shanawani', 'Director', [board], 'hasan-shanawani.jpg', {
    linkedin: 'https://www.linkedin.com',
  }),
  member('Syra Madad', 'Senior Advisor', [advisory], 'syra-madad.png', {
    email: 'syra@example.org',
    linkedin: 'https://www.linkedin.com',
  }),
  member('Fatiha Ainane', 'Advisor', [advisory], 'fatiha-ainane.webp'),
  member('Ahmad Maaty', 'Advisor', [advisory], 'ahmad-maaty.png', {
    linkedin: 'https://www.linkedin.com',
  }),
  member('Madiha Zuberi', 'Advisor', [advisory], 'madiha-zuberi.webp'),
  member('Omar Aswad', 'Advisor', [advisory], 'omar-aswad.webp', {
    email: 'omar@example.org',
  }),
  member('Hesham El-Meligy', 'President, MAPS New York', [nyState], 'hesham-el-meligy.png', {
    linkedin: 'https://www.linkedin.com',
  }),
  member('Duriba Khan', 'Vice President', [nyState], 'duriba-khan.png'),
  member('Ayyan S. Zubair', 'Committee Member', [nyState], 'ayyan-s-zubair.png', {
    email: 'ayyan@example.org',
  }),
  member('Nancy Moemen', 'Committee Member', [nyState], 'nancy-moemen.png'),
  member('Basem Hassan', 'President, MAPS Texas', [txState], 'basem-hassan.png', {
    linkedin: 'https://www.linkedin.com',
  }),
  member('Saira Amar', 'Vice President', [txState], 'saira-amar.png', {
    email: 'saira@example.org',
  }),
  member('Tamim Chowdhury', 'Committee Member', [txState], 'tamim-chowdhury.png'),
  member('Zunera Ahmed', 'Committee Member', [txState], 'zunera-ahmed.png'),
]

export const teamGridGallery: GalleryBlock<TeamGridBlockProps> = {
  slug: 'teamGrid',
  title: 'Team Grid',
  category: 'data',
  description:
    'A filterable directory of people from the Team collection — card grid with a per-member bio modal. On a real page it queries the collection; here it renders a fixed set of sample members.',
  variants: [
    {
      name: 'Grouped sections',
      description:
        'A labelled section per group (board / advisory / state committees), all visible — the live-site layout.',
      props: {
        blockType: 'teamGrid',
        populateBy: 'selection',
        columns: '4',
        layout: 'grouped',
        header: {
          enableHeader: true,
          eyebrow: 'Our people',
          heading: 'Leadership & committees',
          body: prose('The board, advisors, and state directors behind the network.'),
        },
        selectedMembers: members,
      },
    },
    {
      name: 'Filter tabs',
      description: 'One four-column grid with the group filter tab bar.',
      props: {
        blockType: 'teamGrid',
        populateBy: 'selection',
        columns: '4',
        layout: 'tabs',
        selectedMembers: members,
      },
    },
  ],
}
