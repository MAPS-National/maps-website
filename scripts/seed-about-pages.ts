import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'

/**
 * Idempotent seed for the three about-us roster pages (issue #59). Each page is a
 * LowImpact header + one `team` block driven by the Team collection. Safe to
 * re-run: pages are matched by slug and updated in place, never duplicated.
 *
 *   npm run seed:about
 *
 * Unlike the admin "seed database" button this is non-destructive — it only
 * upserts these three pages and touches nothing else.
 */

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

const richText = (...children: unknown[]) => ({
  root: node('root', {}, children),
})

const heading = (value: string, tag = 'h1') => node('heading', { tag }, [text(value)])
const paragraph = (value: string) => node('paragraph', {}, [text(value)])

type TeamBlock = {
  blockType: 'team'
  layout: 'grouped' | 'tabs'
  density: 'airy' | 'medium' | 'compact'
  populateBy: 'collection'
  categories: number[]
  limit: number
  header: { enableHeader: false }
}

const teamBlock = (
  layout: TeamBlock['layout'],
  density: TeamBlock['density'],
  categories: number[],
): TeamBlock => ({
  blockType: 'team',
  layout,
  density,
  populateBy: 'collection',
  categories,
  limit: 0,
  header: { enableHeader: false },
})

const run = async () => {
  const payload = await getPayload({ config: configPromise })

  // Resolve category slugs → ids so the seed never hardcodes DB ids.
  const cats = await payload.find({ collection: 'team-categories', limit: 0, depth: 0 })
  const idBySlug = new Map(cats.docs.map((c) => [c.slug, c.id]))
  const ids = (...slugs: string[]) =>
    slugs.map((s) => idBySlug.get(s)).filter((v): v is number => typeof v === 'number')

  const boardCats = ids('board-of-directors', 'board-deputy-directors', 'board-committees-task-forces')
  const advisoryCats = ids('advisory-council')
  // Every state committee + the presidents group — pattern-matched so newly
  // imported states are picked up automatically.
  const stateCats = cats.docs
    .filter((c) => c.slug.includes('state-committee') || c.slug === 'specialists-committee-chairs')
    .map((c) => c.id)

  const pages = [
    {
      slug: 'about-us/board-leadership',
      title: 'Board & Leadership',
      hero: {
        type: 'lowImpact' as const,
        eyebrow: 'About Us',
        richText: richText(
          heading('Board & Leadership'),
          paragraph(
            'The directors, chairs, and specialists who steer MAPS National and carry its mission forward.',
          ),
        ),
      },
      layout: [teamBlock('grouped', 'medium', boardCats)],
    },
    {
      slug: 'about-us/advisory-council',
      title: 'Advisory Council',
      hero: {
        type: 'lowImpact' as const,
        eyebrow: 'About Us',
        richText: richText(
          heading('Advisory Council'),
          paragraph(
            'Senior advisors who lend their expertise and counsel to MAPS National’s leadership.',
          ),
        ),
      },
      layout: [teamBlock('grouped', 'airy', advisoryCats)],
    },
    {
      slug: 'about-us/state-committees',
      title: 'State Committees',
      hero: {
        type: 'lowImpact' as const,
        eyebrow: 'About Us',
        richText: richText(
          heading('State Committees'),
          paragraph(
            'These local leaders are key to strengthening the MAPS National community while bringing professional development directly to public servants where they live and work.',
          ),
        ),
      },
      layout: [teamBlock('tabs', 'compact', stateCats)],
    },
  ]

  for (const page of pages) {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: page.slug } },
      limit: 1,
      depth: 0,
    })

    // The lexical/block literals above are hand-built, so assert the collection
    // shape rather than reconstructing Payload's generated types by hand.
    const data = {
      slug: page.slug,
      title: page.title,
      _status: 'published' as const,
      hero: page.hero,
      layout: page.layout,
    } as unknown as RequiredDataFromCollectionSlug<'pages'>

    // Running outside the Next runtime, so the revalidatePath afterChange hook
    // would throw — skip it; the dev server picks up the new pages on its own.
    const context = { disableRevalidate: true }

    if (existing.docs[0]) {
      await payload.update({ collection: 'pages', id: existing.docs[0].id, data, context })
      payload.logger.info(`Updated page /${page.slug}`)
    } else {
      await payload.create({ collection: 'pages', data, context })
      payload.logger.info(`Created page /${page.slug}`)
    }
  }

  payload.logger.info('About-us roster pages seeded.')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
