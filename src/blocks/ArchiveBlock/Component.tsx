import type { Post, ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'

import { CollectionArchive } from '@/components/CollectionArchive'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const { id, anchorId, categories, display, introContent, limit: limitFromProps, populateBy, selectedDocs, showRegisterLinks } =
    props

  const limit = limitFromProps || 3

  let posts: Post[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const fetchedPosts = await payload.find({
      collection: 'posts',
      depth: 1,
      limit,
      // Newest-first; without an explicit sort Payload falls back to creation
      // order, which surfaced stale 2022 posts in "Latest Updates".
      sort: '-publishedAt',
      // Fetch only what the cards render. membersOnlyUrl (the gated event
      // sign-up link) is pulled in solely when this listing shows Register
      // buttons, so it never ends up in public archive HTML otherwise.
      select: {
        slug: true,
        categories: true,
        meta: true,
        title: true,
        ...(showRegisterLinks ? { membersOnlyUrl: true } : {}),
      },
      // Published-only. The Local API runs with overrideAccess (so membersOnlyUrl
      // stays readable), which also bypasses authenticatedOrPublished — so drafts
      // would otherwise leak in as empty cards. Filter them out explicitly.
      where: {
        _status: { equals: 'published' },
        ...(flattenedCategories && flattenedCategories.length > 0
          ? { categories: { in: flattenedCategories } }
          : {}),
      },
    })

    posts = fetchedPosts.docs as Post[]
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs.map((post) => {
        if (typeof post.value === 'object') return post.value
      }) as Post[]

      posts = filteredSelectedPosts
    }
  }

  return (
    <div className="my-16 scroll-mt-24" id={anchorId || `block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          {/* Heading matches the section-header treatment used by CardGrid/CTA
              (text-3xl/4xl, semibold) instead of the smaller, heavier prose h2. */}
          <RichText
            className="ms-0 max-w-[48rem] prose-h2:text-3xl prose-h2:font-semibold md:prose-h2:text-4xl"
            data={introContent}
            enableGutter={false}
          />
        </div>
      )}
      <CollectionArchive display={display ?? 'grid'} posts={posts} showRegister={Boolean(showRegisterLinks)} />
    </div>
  )
}
