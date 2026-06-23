/**
 * Canonical page-seed runner (issue #80).
 *
 * After the destructive admin "seed database" button only home + contact exist.
 * This script idempotently upserts the full assembled-page set — run it after
 * every admin re-seed:
 *
 *   npm run seed:pages
 *
 * Adding a new page: push one PageSlice into PAGE_SLICES below. A slice is an
 * async factory that receives the Payload instance (so it can resolve IDs) and
 * returns an array of page definitions. The runner upserts each by slug.
 */

import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import type { Payload } from 'payload'

type PageData = RequiredDataFromCollectionSlug<'pages'>

type PageSlice = (payload: Payload) => Promise<PageData[]>

// ---------------------------------------------------------------------------
// Helpers shared by all slices

const text = (value: string) => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text: value,
  version: 1,
})

const node = (type: string, extra: Record<string, unknown>, children: unknown[]) => ({
  type,
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children,
  ...extra,
})

const richText = (...children: unknown[]) => ({ root: node('root', {}, children) })
const heading = (value: string, tag = 'h1') => node('heading', { tag }, [text(value)])
const paragraph = (value: string) => node('paragraph', {}, [text(value)])

// ---------------------------------------------------------------------------
// Slice: about-us roster pages (migrated from scripts/seed-about-pages.ts)

const aboutUsSlice: PageSlice = async (payload) => {
  const cats = await payload.find({ collection: 'team-categories', limit: 0, depth: 0 })
  const idBySlug = new Map(cats.docs.map((c) => [c.slug, c.id]))
  const ids = (...slugs: string[]) =>
    slugs.map((s) => idBySlug.get(s)).filter((v): v is number => typeof v === 'number')

  const boardCats = ids(
    'board-of-directors',
    'board-deputy-directors',
    'board-committees-task-forces',
  )
  const advisoryCats = ids('advisory-council')
  const stateCats = cats.docs
    .filter((c) => c.slug.includes('state-committee') || c.slug === 'specialists-committee-chairs')
    .map((c) => c.id)

  const team = (
    layout: 'grouped' | 'tabs',
    density: 'airy' | 'medium' | 'compact',
    categories: number[],
  ) =>
    ({
      blockType: 'team',
      layout,
      density,
      populateBy: 'collection',
      categories,
      limit: 0,
      header: { enableHeader: false },
    }) as unknown as PageData['layout'][number]

  return [
    {
      slug: 'about-us/board-leadership',
      title: 'Board & Leadership',
      _status: 'published',
      hero: {
        type: 'lowImpact',
        eyebrow: 'About Us',
        richText: richText(
          heading('Board & Leadership'),
          paragraph(
            'The directors, chairs, and specialists who steer MAPS National and carry its mission forward.',
          ),
        ),
      },
      layout: [team('grouped', 'medium', boardCats)],
    },
    {
      slug: 'about-us/advisory-council',
      title: 'Advisory Council',
      _status: 'published',
      hero: {
        type: 'lowImpact',
        eyebrow: 'About Us',
        richText: richText(
          heading('Advisory Council'),
          paragraph(
            'Senior advisors who lend their expertise and counsel to MAPS National’s leadership.',
          ),
        ),
      },
      layout: [team('grouped', 'airy', advisoryCats)],
    },
    {
      slug: 'about-us/state-committees',
      title: 'State Committees',
      _status: 'published',
      hero: {
        type: 'lowImpact',
        eyebrow: 'About Us',
        richText: richText(
          heading('State Committees'),
          paragraph(
            'These local leaders are key to strengthening the MAPS National community while bringing professional development directly to public servants where they live and work.',
          ),
        ),
      },
      layout: [team('tabs', 'compact', stateCats)],
    },
  ] as unknown as PageData[]
}

// ---------------------------------------------------------------------------
// Registry — add new slices here

const PAGE_SLICES: PageSlice[] = [
  aboutUsSlice,
  // future page slices register here
]

// ---------------------------------------------------------------------------
// Runner

const run = async () => {
  const payload = await getPayload({ config: configPromise })

  // Running outside Next so revalidatePath would throw — skip it.
  const context = { disableRevalidate: true }

  for (const slice of PAGE_SLICES) {
    const pages = await slice(payload)

    for (const data of pages) {
      const existing = await payload.find({
        collection: 'pages',
        where: { slug: { equals: data.slug } },
        limit: 1,
        depth: 0,
      })

      if (existing.docs[0]) {
        await payload.update({ collection: 'pages', id: existing.docs[0].id, data, context })
        payload.logger.info(`Updated page /${data.slug}`)
      } else {
        await payload.create({ collection: 'pages', data, context })
        payload.logger.info(`Created page /${data.slug}`)
      }
    }
  }

  payload.logger.info('Page seed complete.')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
