import type { CardGridBlock as CardGridBlockProps } from '@/payload-types'
import type { GalleryBlock } from '@/blocks/gallery-types'

/**
 * Gallery sample data for the Card Grid block. Variants are text-only
 * (`mediaType: 'none'`) on purpose: the gallery renders through `next/image`,
 * whose `localPatterns` only permits uploaded media under `/api/media/file/**`,
 * so image/icon examples wait on the shared sample-media strategy (slice #30).
 */

type LexicalState = NonNullable<NonNullable<CardGridBlockProps['items']>[number]['body']>
type CardItem = NonNullable<CardGridBlockProps['items']>[number]

/** Minimal single-paragraph rich-text value for sample copy. */
const para = (text: string): LexicalState => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
})

const item = (heading: string, body: string, withLink = false): CardItem => ({
  heading,
  body: para(body),
  links: withLink
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
          body: para(
            'A consolidated grid that scales from two to four columns and adapts to light and dark themes.',
          ),
        },
        items: [
          item('Unified records', 'A single source of truth across every team and surface.', true),
          item('Granular access', 'Role- and plan-aware visibility, enforced server-side.', true),
          item('Audit trail', 'Every change captured, attributable, and reversible.', true),
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
    {
      name: 'Four columns, feature list',
      description: 'Compact 4-up grid for short feature blurbs.',
      props: {
        blockType: 'cardGrid',
        columns: '4',
        mediaType: 'none',
        header: {
          enableHeader: true,
          heading: 'Why teams switch',
        },
        items: [
          item('Fast', 'Sub-second navigation across large datasets.'),
          item('Secure', 'Encrypted at rest and in transit by default.'),
          item('Open', 'Standards-based APIs, no lock-in.'),
          item('Supported', 'Responsive humans, not just docs.'),
        ],
      },
    },
  ],
}
