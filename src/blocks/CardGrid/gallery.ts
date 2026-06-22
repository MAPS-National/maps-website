import type { CardGridBlock as CardGridBlockProps } from '@/payload-types'
import type { GalleryBlock } from '@/blocks/gallery-types'

import {
  prose,
  sampleLandscape,
  sampleNetworking,
  sampleSquare,
  sampleSummit,
} from '@/blocks/gallery-helpers'

type CardItem = NonNullable<CardGridBlockProps['items']>[number]

const item = (
  heading: string,
  body: string,
  opts: { withLink?: boolean; icon?: CardItem['icon']; image?: CardItem['image'] } = {},
): CardItem => ({
  heading,
  body: prose(body),
  icon: opts.icon,
  image: opts.image,
  links: opts.withLink
    ? [{ link: { type: 'custom', url: '#', label: 'Learn more', newTab: false } }]
    : [],
  enableCardLink: false,
})

export const cardGridGallery: GalleryBlock<CardGridBlockProps> = {
  slug: 'cardGrid',
  title: 'Card Grid',
  category: 'content',
  description:
    'Responsive grid of cards — optional section header, uniform media (image / icon / none), per-card copy, buttons, and an optional whole-card link.',
  variants: [
    {
      name: 'Three columns, with header',
      description: 'Section header (eyebrow + heading + body) above a 3-up grid; each card has a button.',
      props: {
        blockType: 'cardGrid',
        columns: '3',
        mediaType: 'none',
        header: {
          enableHeader: true,
          eyebrow: 'MAPS Programs',
          heading: 'Advance your career, serve your community and country',
          body: prose(
            'Comprehensive support for Muslim American public servants at every level of government.',
          ),
        },
        items: [
          item('Community Building', 'Connect with a national network of public servants across government.', { withLink: true }),
          item('Legal Advocacy', 'Know your rights, understand redress, and navigate processes.', { withLink: true }),
          item('Policy & Advocacy', 'Initiatives that advance representation in public service.', { withLink: true }),
        ],
      },
    },
    {
      name: 'Three columns, images',
      description: 'Image media above each card (uniform aspect-video).',
      props: {
        blockType: 'cardGrid',
        columns: '3',
        mediaType: 'image',
        header: { enableHeader: true, heading: 'Across the country' },
        items: [
          item('Annual summit', 'Members convene each year in Washington, D.C.', { image: sampleLandscape }),
          item('Academy training', 'The MAPS Academy training series for every career level.', { image: sampleSummit }),
          item('Member receptions', 'Local chapters and federal ERGs gather year-round.', { image: sampleNetworking }),
        ],
      },
    },
    {
      name: 'Four columns, icons',
      description: 'Compact 4-up grid with an icon per card.',
      props: {
        blockType: 'cardGrid',
        columns: '4',
        mediaType: 'icon',
        header: { enableHeader: true, heading: 'Why members join' },
        items: [
          item('Community', 'A national network of peers and mentors.', { icon: sampleSquare }),
          item('Advocacy', 'A collective voice on policy and representation.', { icon: sampleSummit }),
          item('Resources', 'Career support, training, and know-your-rights guidance.', { icon: sampleNetworking }),
          item('Recognition', 'Celebrating service across federal, state, and local government.', { icon: sampleLandscape }),
        ],
      },
    },
    {
      name: 'Two columns, no header',
      description: 'Header disabled; wider two-up cards without buttons.',
      props: {
        blockType: 'cardGrid',
        columns: '2',
        mediaType: 'none',
        header: { enableHeader: false },
        items: [
          item('For federal staffers', 'Employee resource groups and peer support across agencies.'),
          item('For state & local', 'State committees connecting public servants in your region.'),
        ],
      },
    },
  ],
}
