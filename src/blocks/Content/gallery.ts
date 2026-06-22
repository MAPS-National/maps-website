import type { ContentBlock as ContentBlockProps } from '@/payload-types'
import type { GalleryBlock } from '@/blocks/gallery-types'

import { heading, paragraph, richText } from '@/blocks/gallery-helpers'

type Column = NonNullable<ContentBlockProps['columns']>[number]

const column = (size: Column['size'], head: string, body: string): Column => ({
  size,
  richText: richText(heading(head, 'h3'), paragraph(body)),
  enableLink: false,
})

export const contentGallery: GalleryBlock<ContentBlockProps> = {
  slug: 'content',
  title: 'Content',
  category: 'content',
  description: 'A flexible rich-text layout: one or more columns sized in twelfths (full, two-thirds, half, one-third).',
  variants: [
    {
      name: 'Two columns (half + half)',
      description: 'Even two-column split.',
      props: {
        blockType: 'content',
        columns: [
          column('half', 'Our approach', 'Thin vertical slices that each cut through every layer, demoable on their own.'),
          column('half', 'Why it works', 'Smaller increments surface integration risk early and keep review tractable.'),
        ],
      },
    },
    {
      name: 'Three columns (thirds)',
      description: 'Three equal one-third columns.',
      props: {
        blockType: 'content',
        columns: [
          column('oneThird', 'Plan', 'Map the work into independently shippable units.'),
          column('oneThird', 'Build', 'Implement and verify one slice at a time.'),
          column('oneThird', 'Review', 'Check each change against the design gates.'),
        ],
      },
    },
    {
      name: 'Full width with a link',
      description: 'A single full-width column ending in an inline link.',
      props: {
        blockType: 'content',
        columns: [
          {
            size: 'full',
            richText: richText(
              heading('A single, full-bleed column', 'h2'),
              paragraph('Use the full width for longer-form copy or a lead-in paragraph before the grid resumes.'),
            ),
            enableLink: true,
            link: { type: 'custom', url: '#', label: 'Read the runbook', newTab: false, appearance: 'default' },
          },
        ],
      },
    },
  ],
}
