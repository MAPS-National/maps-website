import type { CallToActionBlock as CTABlockProps } from '@/payload-types'
import type { GalleryBlock } from '@/blocks/gallery-types'

import { heading, paragraph, richText } from '@/blocks/gallery-helpers'

export const callToActionGallery: GalleryBlock<CTABlockProps> = {
  slug: 'cta',
  title: 'Call to Action',
  category: 'cta',
  description: 'A bordered banner pairing a short rich-text pitch with one or two action buttons.',
  variants: [
    {
      name: 'Two actions (default + outline)',
      description: 'Primary and secondary buttons side by side.',
      props: {
        blockType: 'cta',
        richText: richText(
          heading('Ready to get started?', 'h2'),
          paragraph('Stand up your first workspace in minutes — no migration required.'),
        ),
        links: [
          { link: { type: 'custom', url: '#', label: 'Get started', newTab: false, appearance: 'default' } },
          { link: { type: 'custom', url: '#', label: 'Talk to sales', newTab: false, appearance: 'outline' } },
        ],
      },
    },
    {
      name: 'Single action',
      description: 'One primary button.',
      props: {
        blockType: 'cta',
        richText: richText(
          heading('See it in your own data', 'h3'),
          paragraph('Import a sample set and explore the workspace end to end.'),
        ),
        links: [
          { link: { type: 'custom', url: '#', label: 'Start a trial', newTab: false, appearance: 'default' } },
        ],
      },
    },
  ],
}
