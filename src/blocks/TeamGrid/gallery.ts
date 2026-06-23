import type { Team, TeamCategory, TeamGridBlock as TeamGridBlockProps } from '@/payload-types'
import type { GalleryBlock } from '@/blocks/gallery-types'

import { prose, sampleNetworking, sampleSpeaker, sampleSummit } from '@/blocks/gallery-helpers'

// Mirror the Webflow Team Categories the directory filters on.
const cat = (title: string, slug: string): TeamCategory =>
  ({ id: slug, title, slug }) as unknown as TeamCategory

const board = cat('Board of Directors', 'board-of-directors')
const advisory = cat('Advisory Council', 'advisory-council')
const nyState = cat('MAPS NY', 'new-york-state-committee')
const txState = cat('MAPS TX', 'maps-texas-state-committee')

// The card + modal read name/job titles/categories/photo/bio; build just those
// and present them as Team docs. Selection mode avoids a DB round-trip here.
const mockMember = (
  name: string,
  jobTitle: string,
  categories: TeamCategory[],
  bio: string,
  extra: Partial<Team> = {},
): Team =>
  ({
    id: name,
    name,
    jobTitle,
    categories,
    bio: prose(bio),
    ...extra,
  }) as unknown as Team

const members: Team[] = [
  mockMember(
    'Aisha Rahman',
    'Board Chair',
    [board],
    'Aisha has spent two decades in public service, leading civic-engagement initiatives across federal and state agencies.',
    { photo: sampleSpeaker, email: 'aisha@example.org', linkedin: 'https://linkedin.com' },
  ),
  mockMember(
    'Omar Haddad',
    'Outreach Director',
    [board],
    'Omar advises on policy and partnerships, with a focus on building coalitions among public-sector professionals.',
    { photo: sampleSummit },
  ),
  mockMember(
    'Layla Nasser',
    'Advisory Council',
    [advisory],
    'Layla brings legal and regulatory expertise from a career in administrative law.',
    { photo: sampleNetworking },
  ),
  mockMember(
    'Yusuf Karim',
    'Senior Advisor',
    [advisory],
    'Yusuf mentors emerging public servants through the network’s professional-development programs.',
  ),
  mockMember(
    'Fatima Ali',
    'President, MAPS New York',
    [nyState],
    'Fatima leads the New York state committee, organizing local chapters and member events.',
    { jobTitleSecondary: 'State Committee President', photo: sampleSpeaker },
  ),
  mockMember(
    'Bilal Shah',
    'President, MAPS Texas',
    [txState],
    'Bilal coordinates the Texas committee and its outreach to municipal employees.',
  ),
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
        columns: '3',
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
