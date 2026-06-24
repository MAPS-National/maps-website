/**
 * THROWAWAY demo seeder for #76 review — NOT part of the deliverable.
 *
 * Renders each converted prose artifact (src/seed/prose/*.json) as a published
 * Page (hero: none + a full-width Content block holding the richText, followed
 * by any structured blocks captured in the artifact, e.g. the timeline) so the
 * conversion can be eyeballed in the browser. Real Phase 6 assembly places this
 * content properly; these demo pages all use a `prose-demo-` slug prefix so
 * they're easy to spot and bulk-delete.
 *
 *   npm run demo:prose
 */

import 'dotenv/config'

import { readFileSync } from 'node:fs'
import path from 'node:path'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

const DIR = path.join(process.cwd(), 'src/seed/prose')

const run = async (): Promise<void> => {
  const payload = await getPayload({ config: configPromise })
  const context = { disableRevalidate: true }
  const index = JSON.parse(readFileSync(path.join(DIR, 'index.json'), 'utf8')) as Array<{
    slug: string
    file: string
  }>

  for (const entry of index) {
    const art = JSON.parse(readFileSync(path.join(DIR, entry.file), 'utf8'))
    const slug = 'prose-demo-' + entry.slug.replace(/\//g, '-')
    const data = {
      slug,
      title: `DEMO: ${art.title}`,
      _status: 'published',
      hero: { type: 'none' },
      layout: [
        { blockType: 'content', columns: [{ size: 'full', richText: art.richText }] },
        ...(art.blocks || []),
      ],
    } as never

    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs[0]) {
      await payload.update({ collection: 'pages', id: existing.docs[0].id, data, context })
    } else {
      await payload.create({ collection: 'pages', data, context })
    }
    payload.logger.info(`demo page /${slug}  (${art.images.length} imgs, ${(art.blocks || []).length} blocks)`)
  }
  payload.logger.info(`Seeded ${index.length} demo pages (slug prefix "prose-demo-").`)
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
