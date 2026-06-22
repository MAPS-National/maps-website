import type { MediaBlock as MediaBlockProps } from '@/payload-types'
import type { GalleryBlock } from '@/blocks/gallery-types'

import { prose, sampleEop, sampleLibrary } from '@/blocks/gallery-helpers'

export const mediaBlockGallery: GalleryBlock<MediaBlockProps> = {
  slug: 'mediaBlock',
  title: 'Media',
  category: 'media',
  description: 'A single image (or video) rendered full-width through the Media component, with an optional caption.',
  variants: [
    {
      name: 'Image with caption',
      description: 'Caption is pulled from the media item itself.',
      props: {
        blockType: 'mediaBlock',
        media: {
          ...sampleEop,
          caption: prose('A MAPS panel at the Executive Office of the President.'),
        },
      },
    },
    {
      name: 'Image, no caption',
      description: 'Bare image with the standard border and radius.',
      props: {
        blockType: 'mediaBlock',
        media: sampleLibrary,
      },
    },
  ],
}
