import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { Team, TeamGridBlock as TeamGridBlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { getMediaUrl } from '@/utilities/getMediaUrl'

import { TeamGridClient, type TeamMember } from './TeamGridClient'

const categoryLabels: Record<string, string> = {
  board: 'Board of Directors',
  advisory: 'Advisory Board',
  state: 'State Committees',
  staff: 'Staff',
}

/** Map a resolved Team doc to the serializable descriptor the client renders. */
const toMember = (doc: Team): TeamMember => {
  const photo = doc.photo
  const hasPhoto = photo && typeof photo === 'object' && photo.url
  const bio = doc.bio
  const hasBio = bio && typeof bio === 'object' && 'root' in bio

  return {
    id: String(doc.id),
    name: doc.name,
    category: doc.category,
    categoryLabel: categoryLabels[doc.category] ?? doc.category,
    ...(doc.role ? { role: doc.role } : {}),
    ...(doc.state ? { state: doc.state } : {}),
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
  const { category, columns, enableFilter, header, limit, populateBy, selectedMembers } = props

  let docs: Team[] = []

  if (populateBy === 'selection') {
    docs = (selectedMembers || [])
      .map((m) => (typeof m === 'object' ? m : null))
      .filter((m): m is Team => Boolean(m))
  } else {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'team',
      depth: 1,
      limit: limit && limit > 0 ? limit : 0,
      sort: 'name',
      ...(category && category.length > 0 ? { where: { category: { in: category } } } : {}),
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
            <h2 className="text-3xl font-semibold md:text-4xl">{header.heading}</h2>
          )}
          {header?.body && <RichText className="mt-4" data={header.body} enableGutter={false} />}
        </div>
      )}

      <TeamGridClient
        columns={columns ?? '3'}
        enableFilter={enableFilter ?? true}
        members={members}
      />
    </section>
  )
}
