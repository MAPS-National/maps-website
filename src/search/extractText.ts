import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

/**
 * Plaintext extraction for the search index (plugin-search `content` field).
 *
 * Pages keep their copy inside layout blocks (and the hero), so indexing them
 * means walking arbitrary block data and collecting the human-readable text:
 * plain string fields (headings, eyebrows, captions, FAQ answers…) plus
 * Lexical rich-text fields, while dropping everything mechanical (ids, slugs,
 * URLs, enum/variant selects) and populated relationship docs (media, forms,
 * posts) whose text belongs to their own index entry, not this page's.
 */

// String fields that are never prose: identifiers, routing, media plumbing,
// and enum/variant selects. Anything here is skipped when its value is a string.
const NON_TEXT_KEYS = new Set([
  'id',
  'blockType',
  'blockName',
  'anchorId',
  'slug',
  'slugLock',
  'url',
  'href',
  'membersOnlyUrl',
  'videoUrl',
  'filename',
  'mimeType',
  'thumbnailURL',
  'legacyItemId',
  'relationTo',
  'appearance',
  'variant',
  'style',
  'type',
  'size',
  'layout',
  'density',
  'populateBy',
  'icon',
  'theme',
  '_status',
])

// Subtrees that carry no page copy worth indexing: link groups (button labels
// like "Learn more"), breadcrumb trails, and SEO meta (title/description are
// already first-class search fields).
const SKIP_SUBTREES = new Set(['link', 'links', 'breadcrumbs', 'meta'])

const isLexicalState = (value: Record<string, unknown>): boolean =>
  typeof value.root === 'object' && value.root !== null

// Populated relationship/upload docs carry their own timestamps; their text is
// indexed under their own entry (or is media plumbing), so don't inline it.
const isPopulatedDoc = (value: Record<string, unknown>): boolean =>
  'createdAt' in value || 'updatedAt' in value

const looksMechanical = (value: string): boolean =>
  /^(https?:\/\/|\/|#|mailto:|tel:)/.test(value) || /^[0-9a-f]{24}$/i.test(value)

const collect = (value: unknown, key: string | null, out: string[]): void => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed || (key && NON_TEXT_KEYS.has(key)) || looksMechanical(trimmed)) return
    out.push(trimmed)
    return
  }

  if (Array.isArray(value)) {
    for (const item of value) collect(item, key, out)
    return
  }

  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>
    if (isLexicalState(record)) {
      const text = convertLexicalToPlaintext({
        data: record as unknown as SerializedEditorState,
      }).trim()
      if (text) out.push(text)
      return
    }
    if (isPopulatedDoc(record)) return
    for (const [childKey, childValue] of Object.entries(record)) {
      if (SKIP_SUBTREES.has(childKey)) continue
      collect(childValue, childKey, out)
    }
  }
}

// Keep search rows bounded; ILIKE matching doesn't need the full tail of a
// very long page and unbounded text bloats the table.
const MAX_CONTENT_LENGTH = 20_000

/** Walks any block/field data and returns its indexable plaintext. */
export const extractText = (value: unknown): string => {
  const out: string[] = []
  collect(value, null, out)
  return out
    .join('\n')
    .replace(/[ \t]+/g, ' ')
    .slice(0, MAX_CONTENT_LENGTH)
}
