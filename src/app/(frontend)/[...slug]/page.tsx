import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PageTOC } from '@/components/PageTOC'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    // Catch-all route: a slug may be a nested path ("about-us/board-leadership"),
    // so split it into segments.
    .map(({ slug }) => {
      return { slug: (slug ?? '').split('/') }
    })

  return params
}

type Args = {
  params: Promise<{
    // Catch-all gives an array of path segments; the root re-export passes none.
    slug?: string[]
  }>
}

/** Join catch-all segments back into the stored slug ("a/b"), defaulting to home. */
const resolveSlug = (segments?: string[]): string =>
  segments?.length ? segments.map(decodeURIComponent).join('/') : 'home'

const SECTION_LABELS: Record<string, string> = {
  'about-us': 'About Us',
  events: 'Events',
  members: 'Members',
  programs: 'Programs',
  resources: 'Resources',
}

// No-dashes-in-copy rule: render any em/en dash in a title as a comma.
const cleanLabel = (s: string): string => s.replace(/\s*[—–]\s*/g, ', ')

// Member sub-pages whose parent section is State Committees rather than Resources.
const MEMBER_STATE_COMMITTEES = new Set(['new-york-state'])

// The Member Portal section a sub-page belongs to. One source of truth so the
// breadcrumb trail and the hero eyebrow always name the same section.
const memberSection = (sub: string): { label: string; url: string } =>
  MEMBER_STATE_COMMITTEES.has(sub)
    ? { label: 'State Committees', url: '/members/portal#state-committee' }
    : { label: 'Resources', url: '/members/portal#programs-services' }

// Returns the sub-page segment ("professional-development") for a /members/* page
// other than the portal hub itself, else null.
const memberSubPage = (slug: string): string | null => {
  const segments = slug.split('/')
  return segments[0] === 'members' && segments.length > 1 && segments[1] !== 'portal'
    ? segments[1]
    : null
}

/**
 * Breadcrumbs derived from the page's slug + title so every interior page shares
 * one trail shape — Home → (section, plain text) → current page (plain text) —
 * and no crumb can point at a section-index slug that doesn't exist (there are no
 * /about-us, /programs, /resources, /members landing pages). This overrides the
 * per-page hero.breadcrumbs seed data, which had drifted into inconsistent styles
 * and four broken links. Only the lowImpact hero renders breadcrumbs.
 *
 * Member sub-pages are the exception: they hang off the Member Portal hub rather
 * than Home, as Member Portal → (section) → page.
 */
const deriveBreadcrumbs = (slug: string, title: string): { label: string; url?: string }[] => {
  const sub = memberSubPage(slug)
  if (sub) {
    return [
      { label: 'Member Portal', url: '/members/portal' },
      memberSection(sub),
      { label: cleanLabel(title) },
    ]
  }

  const segments = slug.split('/')
  const crumbs: { label: string; url?: string }[] = [{ label: 'Home', url: '/' }]
  if (segments.length > 1) {
    crumbs.push({ label: SECTION_LABELS[segments[0]] ?? cleanLabel(segments[0]) })
  }
  crumbs.push({ label: cleanLabel(title) })
  return crumbs
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug: segments } = await paramsPromise
  const decodedSlug = resolveSlug(segments)
  const slug = decodedSlug
  const url = '/' + decodedSlug
  let page: RequiredDataFromCollectionSlug<'pages'> | null

  page = await queryPageBySlug({
    slug: decodedSlug,
  })

  // Remove this code once your website is seeded
  if (!page && slug === 'home') {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page
  // Member sub-pages already carry "Member Portal" as the first breadcrumb crumb,
  // so the hero eyebrow names the section instead (Resources / State Committees).
  const memberSub = memberSubPage(slug)

  return (
    <article className="pt-[var(--page-top-pad)] pb-24">
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero
        {...hero}
        eyebrow={memberSub ? memberSection(memberSub).label : hero.eyebrow}
        breadcrumbs={slug === 'home' ? undefined : deriveBreadcrumbs(slug, page.title ?? '')}
      />
      <div className="relative" data-toc-content>
        {slug !== 'home' && slug !== 'members/portal' && <PageTOC />}
        <RenderBlocks blocks={layout} />
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug: segments } = await paramsPromise
  const page = await queryPageBySlug({
    slug: resolveSlug(segments),
  })

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
