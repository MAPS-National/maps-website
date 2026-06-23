import type { Team, TeamGridBlock as TeamGridBlockProps } from '@/payload-types'
import type { GalleryBlock } from '@/blocks/gallery-types'

import {
  prose,
  sampleNetworking,
  sampleSpeaker,
  sampleSummit,
} from '@/blocks/gallery-helpers'

// The card + modal read name/role/category/state/photo/bio; build just those and
// present them as Team docs. Selection mode avoids a DB round-trip in the gallery.
const mockMember = (
  name: string,
  role: string,
  category: Team['category'],
  bio: string,
  extra: Partial<Team> = {},
): Team =>
  ({
    id: name,
    name,
    role,
    category,
    bio: prose(bio),
    ...extra,
  }) as unknown as Team

const members: Team[] = [
  mockMember(
    'Aisha Rahman',
    'Board Chair',
    'board',
    'Aisha has spent two decades in public service, leading civic-engagement initiatives across federal and state agencies.',
    { photo: sampleSpeaker, email: 'aisha@example.org', linkedin: 'https://linkedin.com' },
  ),
  mockMember(
    'Omar Haddad',
    'Vice Chair',
    'board',
    'Omar advises on policy and partnerships, with a focus on building coalitions among public-sector professionals.',
    { photo: sampleSummit },
  ),
  mockMember(
    'Layla Nasser',
    'Advisory Board',
    'advisory',
    'Layla brings legal and regulatory expertise from a career in administrative law.',
    { photo: sampleNetworking },
  ),
  mockMember(
    'Yusuf Karim',
    'Senior Advisor',
    'advisory',
    'Yusuf mentors emerging public servants through the network’s professional-development programs.',
  ),
  mockMember(
    'Fatima Ali',
    'State Director',
    'state',
    'Fatima leads the New York state committee, organizing local chapters and member events.',
    { state: 'New York', photo: sampleSpeaker },
  ),
  mockMember(
    'Bilal Shah',
    'State Director',
    'state',
    'Bilal coordinates the Texas committee and its outreach to municipal employees.',
    { state: 'Texas' },
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
      name: 'Filterable grid',
      description: 'Three columns with the group filter tabs (board / advisory / state).',
      props: {
        blockType: 'teamGrid',
        populateBy: 'selection',
        columns: '3',
        enableFilter: true,
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
      name: 'No filter, four columns',
      description: 'Compact four-column grid with the filter bar hidden.',
      props: {
        blockType: 'teamGrid',
        populateBy: 'selection',
        columns: '4',
        enableFilter: false,
        selectedMembers: members,
      },
    },
  ],
}
