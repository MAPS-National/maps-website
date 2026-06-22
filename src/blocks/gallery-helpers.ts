import type { Media } from '@/payload-types'

/**
 * Shared sample-data helpers for block galleries (see `gallery-types.ts`).
 * Centralizes rich-text construction and placeholder media so every block's
 * `gallery.ts` reads uniformly. Render-side only — never imported into the
 * Payload config graph.
 */

type TextNode = {
  type: 'text'
  detail: number
  format: number
  mode: 'normal'
  style: string
  text: string
  version: number
}

type ElementNode = {
  type: string
  children: TextNode[]
  direction: 'ltr'
  format: ''
  indent: number
  version: number
  tag?: string
  textFormat?: number
}

/** Minimal serialized Lexical state, structurally compatible with block `richText` fields. */
export type RichTextValue = {
  root: {
    type: 'root'
    children: ElementNode[]
    direction: 'ltr'
    format: ''
    indent: number
    version: number
  }
}

const text = (t: string): TextNode => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text: t,
  version: 1,
})

/** A paragraph node. */
export const paragraph = (t: string): ElementNode => ({
  type: 'paragraph',
  children: [text(t)],
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  version: 1,
})

/** A heading node (h2 / h3 / h4). */
export const heading = (t: string, tag: 'h2' | 'h3' | 'h4' = 'h2'): ElementNode => ({
  type: 'heading',
  tag,
  children: [text(t)],
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})

/** Wrap nodes into a serialized editor state. */
export const richText = (...nodes: ElementNode[]): RichTextValue => ({
  root: { type: 'root', children: nodes, direction: 'ltr', format: '', indent: 0, version: 1 },
})

/** Convenience: a single-paragraph rich-text value. */
export const prose = (t: string): RichTextValue => richText(paragraph(t))

/** Placeholder Media resource backed by a tracked file in /public/gallery. */
const media = (file: string, width: number, height: number, alt: string): Media => ({
  id: 0,
  alt,
  url: `/gallery/${file}`,
  width,
  height,
  mimeType: 'image/webp',
  filename: file,
  updatedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
})

export const sampleLandscape = media(
  'placeholder-landscape.webp',
  1200,
  675,
  'Sample landscape placeholder image',
)
export const sampleSquare = media('placeholder-square.webp', 600, 600, 'Sample square placeholder image')
