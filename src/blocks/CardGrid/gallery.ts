import type { CardGridBlock as CardGridBlockProps } from '@/payload-types'
import type { GalleryBlock } from '@/blocks/gallery-types'

import { prose, sampleLandscape, sampleSquare } from '@/blocks/gallery-helpers'

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
          eyebrow: 'Capabilities',
          heading: 'Everything in one workspace',
          body: prose(
            'A consolidated grid that scales from two to four columns and adapts to light and dark themes.',
          ),
        },
        items: [
          item('Unified records', 'A single source of truth across every team and surface.', { withLink: true }),
          item('Granular access', 'Role- and plan-aware visibility, enforced server-side.', { withLink: true }),
          item('Audit trail', 'Every change captured, attributable, and reversible.', { withLink: true }),
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
        header: { enableHeader: true, heading: 'With imagery' },
        items: [
          item('Discovery', 'Map the landscape before committing resources.', { image: sampleLandscape }),
          item('Delivery', 'Ship in thin, verifiable slices.', { image: sampleLandscape }),
          item('Support', 'Stay close after launch.', { image: sampleLandscape }),
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
        header: { enableHeader: true, heading: 'Why teams switch' },
        items: [
          item('Fast', 'Sub-second navigation across large datasets.', { icon: sampleSquare }),
          item('Secure', 'Encrypted at rest and in transit by default.', { icon: sampleSquare }),
          item('Open', 'Standards-based APIs, no lock-in.', { icon: sampleSquare }),
          item('Supported', 'Responsive humans, not just docs.', { icon: sampleSquare }),
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
          item('For operators', 'Day-to-day workflows tuned for speed and fewer clicks.'),
          item('For administrators', 'Governance, provisioning, and policy in one place.'),
        ],
      },
    },
  ],
}
