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

import 'dotenv/config'

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
// Slice: Phase 4 block showcase (epic #64 — #71 / #72 / #73 page placement)
//
// The Testimonials and AcademyVideos collections are empty until the Phase 5
// import, so this slice first seeds a little sample data (idempotent by slug —
// #71 ships on hand-entered/seed data) and then places all three Phase 4 blocks
// on one published page. Full per-page placement is Phase 6 (epic #66); this
// just satisfies the "placed on at least one Page" acceptance for the blocks.

const quote = (value: string) => richText(paragraph(value))

const upsertBySlug = async (
  payload: Payload,
  collection: 'testimonials' | 'academy-videos' | 'video-categories',
  slug: string,
  data: Record<string, unknown>,
): Promise<number> => {
  const context = { disableRevalidate: true }
  const existing = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  const payload_ = { ...data, slug } as never
  if (existing.docs[0]) {
    await payload.update({ collection, id: existing.docs[0].id, data: payload_, context })
    return existing.docs[0].id as number
  }
  const created = await payload.create({ collection, data: payload_, context })
  return created.id as number
}

const phase4ShowcaseSlice: PageSlice = async (payload) => {
  // Testimonials — a mix of both types so the block's type filter has something
  // to scope.
  await upsertBySlug(payload, 'testimonials', 'amina-r', {
    author: 'Amina R.',
    role: 'Program graduate',
    type: 'programs',
    quote: quote(
      'The MAPS Academy gave me a roadmap into public service I didn’t know existed — and the network to act on it.',
    ),
  })
  await upsertBySlug(payload, 'testimonials', 'yusuf-k', {
    author: 'Yusuf K.',
    role: 'Federal fellow',
    type: 'career',
    quote: quote(
      'Help reconstructing my resume was the difference between an interview and a rejection. I start at the agency next month.',
    ),
  })
  await upsertBySlug(payload, 'testimonials', 'layla-h', {
    author: 'Layla H.',
    role: 'Policy analyst',
    type: 'career',
    quote: quote('I came in unsure how to translate my background into a government role. I left with a plan and three referrals.'),
  })

  // Academy videos under two categories.
  const fundamentals = await upsertBySlug(payload, 'video-categories', 'fundamentals', {
    title: 'Fundamentals & Career Entry',
    order: 0,
  })
  const pathways = await upsertBySlug(payload, 'video-categories', 'pathways', {
    title: 'Executive & Senior Pathways',
    order: 1,
  })
  await upsertBySlug(payload, 'academy-videos', 'cfr-fellowship-info-session', {
    title: 'Pipelines into Foreign Policy — CFR Fellowship & Term Member Programs',
    videoUrl: 'https://www.youtube.com/watch?v=9brMSH0HuBc',
    description: 'An info session on the Council on Foreign Relations fellowship and term-member tracks.',
    categories: [pathways],
    order: 0,
  })
  await upsertBySlug(payload, 'academy-videos', 'breaking-into-public-service', {
    title: 'Breaking into Public Service: Where to Start',
    videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    description: 'The entry points, timelines, and first moves for a public-service career.',
    categories: [fundamentals],
    order: 1,
  })

  return [
    {
      slug: 'phase-4-blocks',
      title: 'Phase 4 — Block Showcase',
      _status: 'published',
      hero: {
        type: 'lowImpact',
        eyebrow: 'Internal',
        richText: richText(
          heading('Phase 4 — Block Showcase'),
          paragraph(
            'Live placement of the Phase 4 collection-backed blocks: testimonials, academy videos, and map + location cards.',
          ),
        ),
      },
      layout: [
        {
          blockType: 'testimonials',
          variant: 'grid',
          type: 'all',
          populateBy: 'collection',
          limit: 0,
          eyebrow: 'In their words',
          heading: 'What our community says',
        },
        {
          blockType: 'academyVideos',
          populateBy: 'collection',
          limit: 0,
          eyebrow: 'MAPS Academy',
          heading: 'Watch & learn',
        },
        {
          blockType: 'mapLocationCards',
          enableMap: true,
          heading: 'Our chapters',
          mapQuery: 'Washington, DC',
          locations: [
            {
              name: 'MAPS National',
              address: '1100 13th St NW\nWashington, DC 20005',
              phone: '(202) 555-0142',
              email: 'hello@example.org',
              linkLabel: 'Get directions',
              linkUrl: 'https://maps.google.com',
            },
            {
              name: 'MAPS New York',
              address: '120 Broadway\nNew York, NY 10271',
              email: 'ny@example.org',
            },
          ],
        },
      ],
    },
  ] as unknown as PageData[]
}

// ---------------------------------------------------------------------------
// Registry — add new slices here

const PAGE_SLICES: PageSlice[] = [
  aboutUsSlice,
  phase4ShowcaseSlice,
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
