import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'High Impact',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact',
          value: 'lowImpact',
        },
      ],
      required: true,
    },
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
    },
    {
      name: 'eyebrow',
      type: 'text',
      admin: {
        condition: (_, { type } = {}) => type === 'lowImpact',
        description: 'Small tagline shown above the heading on interior-page headers.',
      },
      label: 'Eyebrow',
    },
    {
      name: 'breadcrumbs',
      type: 'array',
      admin: {
        condition: (_, { type } = {}) => type === 'lowImpact',
        description:
          'Optional trail above the heading. The last crumb is the current page — leave its URL empty.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            description: 'Leave empty for the current page (rendered as plain text).',
          },
        },
      ],
      label: 'Breadcrumbs',
    },
    linkGroup({
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'badge',
      type: 'text',
      label: 'Badge',
      admin: {
        condition: (_, { type } = {}) => type === 'mediumImpact',
        description: 'Optional small pill shown above the heading (split layout).',
      },
    },
    {
      name: 'media',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact'].includes(type),
      },
      relationTo: 'media',
      required: true,
    },
    {
      name: 'overlay',
      type: 'select',
      defaultValue: 'navy-gradient',
      label: 'Background overlay',
      admin: {
        condition: (_, { type } = {}) => type === 'highImpact',
        description: 'Navy scrim over the hero image for text legibility (brand-token gradient).',
      },
      options: [
        {
          label: 'Navy gradient',
          value: 'navy-gradient',
        },
        {
          label: 'None',
          value: 'none',
        },
      ],
    },
  ],
  label: false,
}
