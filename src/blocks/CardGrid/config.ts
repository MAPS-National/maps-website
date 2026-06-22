import type { Block } from 'payload'

import { FixedToolbarFeature, InlineToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'
import { linkGroup } from '@/fields/linkGroup'

const introEditor = lexicalEditor({
  features: ({ rootFeatures }) => [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()],
})

export const CardGrid: Block = {
  slug: 'cardGrid',
  interfaceName: 'CardGridBlock',
  fields: [
    {
      name: 'header',
      type: 'group',
      label: 'Header',
      admin: { hideGutter: true },
      fields: [
        {
          name: 'enableHeader',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show section header',
        },
        {
          type: 'row',
          fields: [
            {
              name: 'eyebrow',
              type: 'text',
              label: 'Eyebrow / tagline',
              admin: {
                width: '50%',
                condition: (_, siblingData) => Boolean(siblingData?.enableHeader),
              },
            },
            {
              name: 'heading',
              type: 'text',
              admin: {
                width: '50%',
                condition: (_, siblingData) => Boolean(siblingData?.enableHeader),
              },
            },
          ],
        },
        {
          name: 'body',
          type: 'richText',
          editor: introEditor,
          label: 'Intro text',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.enableHeader),
          },
        },
        {
          name: 'anchorId',
          type: 'text',
          label: 'Anchor ID',
          admin: {
            description:
              'Optional in-page anchor target, e.g. "resources" makes the section reachable at #resources. Must be unique on the page.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'columns',
          type: 'select',
          defaultValue: '3',
          label: 'Columns',
          required: true,
          admin: { width: '50%' },
          options: [
            { label: 'Two', value: '2' },
            { label: 'Three', value: '3' },
            { label: 'Four', value: '4' },
          ],
        },
        {
          name: 'mediaType',
          type: 'select',
          defaultValue: 'image',
          label: 'Card media',
          required: true,
          admin: {
            width: '50%',
            description: 'Media is uniform across the grid: every card shows an image, an icon, or none.',
          },
          options: [
            { label: 'None', value: 'none' },
            { label: 'Icon', value: 'icon' },
            { label: 'Image', value: 'image' },
          ],
        },
      ],
    },
    {
      name: 'items',
      type: 'array',
      label: 'Cards',
      labels: { singular: 'Card', plural: 'Cards' },
      minRows: 1,
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          admin: {
            condition: (_, __, { blockData } = {}) => blockData?.mediaType === 'icon',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            condition: (_, __, { blockData } = {}) => blockData?.mediaType === 'image',
          },
        },
        {
          name: 'heading',
          type: 'text',
          required: true,
        },
        {
          name: 'body',
          type: 'richText',
          editor: introEditor,
          label: false,
        },
        linkGroup({
          overrides: {
            label: 'Button',
            maxRows: 1,
            admin: { initCollapsed: true },
          },
        }),
        {
          name: 'enableCardLink',
          type: 'checkbox',
          label: 'Make the whole card a link',
        },
        link({
          appearances: false,
          disableLabel: true,
          overrides: {
            name: 'cardLink',
            admin: {
              condition: (_, siblingData) => Boolean(siblingData?.enableCardLink),
            },
          },
        }),
        {
          name: 'requiredPlans',
          type: 'text',
          hasMany: true,
          label: 'Required membership plan IDs',
          admin: {
            description:
              'Membership plan IDs that may see this card (gated server-side). Leave empty to show to everyone.',
          },
        },
      ],
    },
  ],
}
