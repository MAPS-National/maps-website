import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

/**
 * Team — the people directory behind the team-grid block. One row per person
 * (board, advisory, state committees, staff), shown as a filterable grid with a
 * per-member bio modal on the public site. Content is entered here, not ported
 * from Webflow (the export's CMS lists are empty placeholders).
 */
export const Team: CollectionConfig<'team'> = {
  slug: 'team',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'role', 'category', 'updatedAt'],
    useAsTitle: 'name',
    group: 'Content',
  },
  defaultSort: 'name',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'role',
          type: 'text',
          label: 'Role / title',
          admin: { width: '50%', description: 'e.g. "Board Chair", "State Director".' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'category',
          type: 'select',
          required: true,
          defaultValue: 'board',
          admin: {
            width: '50%',
            description: 'Groups the directory and drives the on-page filter.',
          },
          options: [
            { label: 'Board of Directors', value: 'board' },
            { label: 'Advisory Board', value: 'advisory' },
            { label: 'State Committees', value: 'state' },
            { label: 'Staff', value: 'staff' },
          ],
        },
        {
          name: 'state',
          type: 'text',
          label: 'State',
          admin: {
            width: '50%',
            description: 'US state for a state-committee member, e.g. "New York".',
            condition: (_, siblingData) => siblingData?.category === 'state',
          },
        },
      ],
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Headshot',
    },
    {
      name: 'bio',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
      admin: { description: 'Shown in the member detail modal.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'email',
          type: 'text',
          admin: { width: '50%' },
        },
        {
          name: 'linkedin',
          type: 'text',
          label: 'LinkedIn URL',
          admin: { width: '50%' },
        },
      ],
    },
  ],
}
