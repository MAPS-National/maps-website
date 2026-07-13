import type { GalleryHighlightsBlock as Props } from '@/payload-types'
import type { GalleryBlock } from '@/blocks/gallery-types'

import { prose } from '@/blocks/gallery-helpers'

export const galleryHighlightsGallery: GalleryBlock<Props> = {
  slug: 'galleryHighlights',
  title: 'Featured Galleries',
  category: 'data',
  description:
    'Auto-lists published posts that have a photo gallery, most-recently-updated first; each card shows a cover + photo count and deep-links into that post’s gallery. Queries live Posts — the cards below reflect real data in this environment.',
  variants: [
    {
      name: 'With header',
      description: 'Section header above the auto-generated gallery cards (live query).',
      props: {
        blockType: 'galleryHighlights',
        eyebrow: 'From our events',
        heading: 'Recent photo galleries',
        body: prose('See the latest moments from MAPS gatherings across the country.'),
        limit: 6,
      } as Props,
    },
  ],
}
