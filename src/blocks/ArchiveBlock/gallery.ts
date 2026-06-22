import type { Post, ArchiveBlock as ArchiveBlockProps } from '@/payload-types'
import type { GalleryBlock } from '@/blocks/gallery-types'

import { prose, sampleLandscape } from '@/blocks/gallery-helpers'

// The post Card reads only slug/title/meta/categories; build just those fields
// and present them as a Post. Avoids a DB round-trip in the gallery.
const mockPost = (
  title: string,
  slug: string,
  description: string,
  category: string,
): { relationTo: 'posts'; value: Post } => ({
  relationTo: 'posts',
  value: {
    title,
    slug,
    meta: { image: sampleLandscape, description },
    categories: [{ title: category }],
  } as unknown as Post,
})

export const archiveGallery: GalleryBlock<ArchiveBlockProps> = {
  slug: 'archive',
  title: 'Archive',
  category: 'data',
  description:
    'A grid of post cards. On a real page it queries the Posts collection; here it renders a fixed selection of sample posts.',
  variants: [
    {
      name: 'Selected posts (3)',
      description: 'Selection mode with an intro and three sample posts.',
      props: {
        blockType: 'archive',
        populateBy: 'selection',
        introContent: prose('Recent writing from the team.'),
        selectedDocs: [
          mockPost(
            'Designing thin vertical slices',
            'thin-vertical-slices',
            'Why we cut tracer bullets through every layer instead of building horizontally.',
            'Process',
          ),
          mockPost(
            'Tokens over hardcoded values',
            'tokens-over-hardcoded',
            'Mapping a Webflow export onto a small, themeable token system.',
            'Design system',
          ),
          mockPost(
            'Porting sections, not pages',
            'porting-sections',
            'A repeatable contract for turning old markup into native blocks.',
            'Migration',
          ),
        ],
      },
    },
  ],
}
