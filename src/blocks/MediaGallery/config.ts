import type { Block } from 'payload'

export const MediaGallery: Block = {
  slug: 'mediaGallery',
  interfaceName: 'MediaGalleryBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Heading',
      admin: { description: 'Optional label above the gallery.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'layout',
          type: 'select',
          defaultValue: 'grid',
          label: 'Layout',
          required: true,
          admin: {
            width: '50%',
            description: 'Grid: a tiled set. Slider: a horizontal, swipeable track.',
          },
          options: [
            { label: 'Grid', value: 'grid' },
            { label: 'Slider', value: 'slider' },
          ],
        },
        {
          name: 'columns',
          type: 'select',
          defaultValue: '3',
          label: 'Grid columns',
          required: true,
          admin: {
            width: '50%',
            description: 'Number of columns in grid layout (ignored for the slider).',
          },
          options: [
            { label: 'Two', value: '2' },
            { label: 'Three', value: '3' },
            { label: 'Four', value: '4' },
          ],
        },
      ],
    },
    {
      name: 'enableLightbox',
      type: 'checkbox',
      defaultValue: true,
      label: 'Open images in a lightbox',
      admin: {
        description: 'Let visitors click an image to view it full-size in an overlay, with next/previous.',
      },
    },
    {
      name: 'images',
      type: 'array',
      label: 'Images',
      labels: { singular: 'Image', plural: 'Images' },
      minRows: 1,
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Caption',
          admin: { description: 'Shown in the lightbox and used as the alt text fallback.' },
        },
      ],
    },
  ],
  labels: {
    plural: 'Media Galleries',
    singular: 'Media Gallery',
  },
}
