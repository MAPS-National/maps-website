import type { Block } from 'payload'

import { FixedToolbarFeature, InlineToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

const introEditor = lexicalEditor({
  features: ({ rootFeatures }) => [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()],
})

/**
 * Team grid — renders the Team collection as a filterable card grid with a
 * per-member bio modal. On a real page it queries the `team` collection
 * (optionally limited); a curated selection mode lets an editor pin specific
 * people (and lets the showroom render sample members without a DB round-trip),
 * mirroring the Archive block.
 */
export const TeamGrid: Block = {
  slug: 'teamGrid',
  interfaceName: 'TeamGridBlock',
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
              'Optional in-page anchor target, e.g. "team" makes the section reachable at #team. Must be unique on the page.',
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
          name: 'layout',
          type: 'select',
          defaultValue: 'grouped',
          label: 'Layout',
          required: true,
          admin: {
            width: '50%',
            description:
              'Grouped: a labelled section per group (board, advisory, …), all visible. Tabs: one grid with a category filter bar.',
          },
          options: [
            { label: 'Grouped sections', value: 'grouped' },
            { label: 'Filter tabs', value: 'tabs' },
          ],
        },
      ],
    },
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'collection',
      options: [
        { label: 'Collection', value: 'collection' },
        { label: 'Individual selection', value: 'selection' },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'team-categories',
      hasMany: true,
      label: 'Limit to groups',
      admin: {
        condition: (_, siblingData) => siblingData?.populateBy === 'collection',
        description: 'Leave empty to show every group.',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 0,
      label: 'Limit',
      admin: {
        condition: (_, siblingData) => siblingData?.populateBy === 'collection',
        description: '0 = show everyone.',
        step: 1,
      },
    },
    {
      name: 'selectedMembers',
      type: 'relationship',
      relationTo: 'team',
      hasMany: true,
      label: 'Members',
      admin: {
        condition: (_, siblingData) => siblingData?.populateBy === 'selection',
      },
    },
  ],
  labels: {
    plural: 'Team Grids',
    singular: 'Team Grid',
  },
}
