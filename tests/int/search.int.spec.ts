// @vitest-environment node
// Node env (not jsdom): drives the Payload API only, and media uploads run sharp
// which rejects Node buffers across jsdom's realm (see api.int.spec.ts).
import fs from 'fs'
import os from 'os'
import path from 'path'

import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { collectionHref } from '@/utilities/collectionHref'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

// revalidatePath throws outside a request; the collections' revalidate hooks skip on this.
const context = { disableRevalidate: true }

// Per-run token so re-running locally (payload-poc persists) never collides on
// the unique `slug`, and search markers stay specific to this run.
const uniq = Date.now().toString(36)

// Minimal Lexical richText holding a single line of text.
const lex = (text: string) => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        version: 1,
        children: [
          { type: 'text', text, version: 1, detail: 0, format: 0, mode: 'normal', style: '' },
        ],
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

describe('search indexing (issues #244/#245)', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  // #244: result links resolve per source collection, home maps to root.
  it('collectionHref: posts under /latest-updates, pages at root, home at /', () => {
    expect(collectionHref('posts', 'my-post')).toBe('/latest-updates/my-post')
    expect(collectionHref('pages', 'about-us')).toBe('/about-us')
    expect(collectionHref('pages', 'home')).toBe('/')
  })

  // #244 (pages indexed + relationTo) + #245 (page block text walked into `content`).
  it('indexes a page: block prose searchable, tagged relationTo=pages', async () => {
    const markers = {
      heading: `faqHeadingMarker${uniq}`,
      body: `faqBodyMarker${uniq}`,
      question: `faqQuestionMarker${uniq}`,
      answer: `faqAnswerMarker${uniq}`,
    }
    const page = await payload.create({
      collection: 'pages',
      context: { ...context },
      data: {
        title: `Search Verify Page ${uniq}`,
        slug: `verify-page-${uniq}`,
        _status: 'published',
        layout: [
          {
            blockType: 'faq',
            layout: 'stacked',
            header: {
              enableHeader: true,
              heading: markers.heading,
              body: lex(markers.body),
            },
            items: [{ question: markers.question, answer: lex(markers.answer) }],
          },
        ],
      } as never,
    })

    const res = await payload.find({
      collection: 'search',
      where: { content: { like: markers.answer } },
      depth: 0,
    })
    const hit = res.docs.find((d) => (d.doc as { value?: number })?.value === page.id) as
      | { doc: { relationTo: string }; content?: string }
      | undefined

    expect(hit).toBeDefined()
    expect(hit!.doc.relationTo).toBe('pages')
    // Every text-bearing FAQ field (group heading, group richText, array item
    // question + answer) must reach `content` — proves the recursive walker.
    for (const marker of Object.values(markers)) {
      expect(hit!.content).toContain(marker)
    }
  })

  // #245: post body richText walked into `content`, still tagged relationTo=posts.
  it('indexes a post: body prose searchable, tagged relationTo=posts', async () => {
    const marker = `quokkaPostBodyMarker${uniq}`
    const category = await payload.create({
      collection: 'categories',
      context: { ...context },
      data: { title: `Search Verify Category ${uniq}`, slug: `verify-cat-${uniq}` } as never,
    })
    // Posts require a square, >=1080px hero on publish; reuse the tracked 1200x1200
    // asset, copied to a unique filename so it never collides with api.int's hero
    // (same source → same `1.webp` → unique-filename ValidationError) or a re-run.
    const heroPath = path.join(os.tmpdir(), `verify-hero-${uniq}.webp`)
    fs.copyFileSync(path.resolve(process.cwd(), 'public/import/prose/1.webp'), heroPath)
    const hero = await payload.create({
      collection: 'media',
      overrideAccess: true,
      context: { ...context },
      data: { alt: 'search verify hero' },
      filePath: heroPath,
    })
    const post = await payload.create({
      collection: 'posts',
      context: { ...context },
      data: {
        title: `Search Verify Post ${uniq}`,
        slug: `verify-post-${uniq}`,
        _status: 'published',
        heroImage: hero.id,
        categories: [category.id],
        content: lex(marker),
      } as never,
    })

    const res = await payload.find({
      collection: 'search',
      where: { content: { like: marker } },
      depth: 0,
    })
    const hit = res.docs.find((d) => (d.doc as { value?: number })?.value === post.id) as
      | { doc: { relationTo: string }; content?: string }
      | undefined

    expect(hit).toBeDefined()
    expect(hit!.doc.relationTo).toBe('posts')
    expect(hit!.content).toContain(marker)
  })

  // #244: the results query paginates (real page metadata, not pagination:false).
  it('search results paginate', async () => {
    const res = await payload.find({ collection: 'search', limit: 1, page: 1, depth: 0 })
    expect(res.page).toBe(1)
    expect(res.limit).toBe(1)
    expect(typeof res.totalPages).toBe('number')
  })
})
