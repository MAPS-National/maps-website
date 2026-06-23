import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { Team, TeamCategory, TeamGridBlock as TeamGridBlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { getMediaUrl } from '@/utilities/getMediaUrl'

import { TeamGridClient, type TeamMember } from './TeamGridClient'

/** Resolve a category relationship value to a {value,label} tab descriptor. */
const toTab = (c: number | TeamCategory): { value: string; label: string } | null => {
  if (typeof c !== 'object') return null
  return { value: c.slug || String(c.id), label: c.title }
}

/** Map a resolved Team doc to the serializable descriptor the client renders. */
const toMember = (doc: Team): TeamMember => {
  const photo = doc.photo
  const hasPhoto = photo && typeof photo === 'object' && photo.url
  const bio = doc.bio
  const hasBio = bio && typeof bio === 'object' && 'root' in bio
  const categories = (doc.categories || [])
    .map(toTab)
    .filter((c): c is { value: string; label: string } => Boolean(c))

  return {
    id: String(doc.id),
    name: doc.name,
    categories,
    ...(doc.jobTitle ? { jobTitle: doc.jobTitle } : {}),
    ...(doc.jobTitleSecondary ? { jobTitleSecondary: doc.jobTitleSecondary } : {}),
    ...(doc.email ? { email: doc.email } : {}),
    ...(doc.linkedin ? { linkedin: doc.linkedin } : {}),
    ...(hasPhoto
      ? { photoSrc: getMediaUrl(photo.url!, photo.updatedAt), photoAlt: photo.alt || doc.name }
      : {}),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(hasBio ? { bio: <RichText data={bio as any} enableGutter={false} enableProse /> } : {}),
  }
}

/**
 * Team directory — a filterable grid of people sourced from the Team collection,
 * each opening a bio modal. The block resolves Team docs to plain descriptors
 * here (server side) and hands them to a client component that owns the filter
 * tabs and the modal dialog.
 */
export const TeamGridBlock: React.FC<TeamGridBlockProps & { id?: string }> = async (props) => {
  const { categories, columns, header, layout, limit, populateBy, selectedMembers } = props

  let docs: Team[] = []

  if (populateBy === 'selection') {
    docs = (selectedMembers || [])
      .map((m) => (typeof m === 'object' ? m : null))
      .filter((m): m is Team => Boolean(m))
  } else {
    const categoryIds = (categories || []).map((c) => (typeof c === 'object' ? c.id : c))
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'team',
      depth: 1,
      limit: limit && limit > 0 ? limit : 0,
      sort: 'order',
      ...(categoryIds.length > 0 ? { where: { categories: { in: categoryIds } } } : {}),
    })
    docs = result.docs
  }

  const members = docs.map(toMember)
  if (members.length === 0) return null

  const showHeader = header?.enableHeader
  const anchorId = header?.anchorId || undefined

  return (
    <section className="container" id={anchorId}>
      {showHeader && (header?.eyebrow || header?.heading || header?.body) && (
        <div className="mb-10 max-w-2xl">
          {header?.eyebrow && (
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
              {header.eyebrow}
            </p>
          )}
          {header?.heading && (
            <h2 className="text-4xl font-semibold md:text-5xl">{header.heading}</h2>
          )}
          {header?.body && <RichText className="mt-4" data={header.body} enableGutter={false} />}
        </div>
      )}

      <TeamGridClient
        columns={columns ?? '3'}
        layout={layout ?? 'grouped'}
        members={members}
      />
    </section>
  )
}
