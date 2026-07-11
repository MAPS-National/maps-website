import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import type { ArchiveItem } from '@/components/CollectionArchive'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Search } from '@/search/Component'
import { SearchPagination } from '@/search/Pagination'
import PageClient from './page.client'
import { SITE_NAME } from '@/utilities/brand'

type Args = {
  searchParams: Promise<{
    q?: string
    page?: string
  }>
}
export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: query, page } = await searchParamsPromise
  const currentPage = Math.max(1, Number(page) || 1)
  const payload = await getPayload({ config: configPromise })

  const results = await payload.find({
    collection: 'search',
    depth: 1,
    limit: 12,
    page: currentPage,
    // Pages (priority 20) rank above posts (10) — see the search plugin config.
    sort: '-priority',
    select: {
      title: true,
      slug: true,
      doc: true,
      categories: true,
      meta: true,
    },
    ...(query
      ? {
          where: {
            or: [
              {
                title: {
                  like: query,
                },
              },
              {
                'meta.description': {
                  like: query,
                },
              },
              {
                'meta.title': {
                  like: query,
                },
              },
              {
                content: {
                  like: query,
                },
              },
              {
                slug: {
                  like: query,
                },
              },
            ],
          },
        }
      : {}),
  })

  // Results span collections; carry each doc's source collection through so
  // cards link pages to their root URL and posts to /latest-updates.
  const items = results.docs.map(
    (doc) => ({ ...doc, relationTo: doc.doc?.relationTo }) as unknown as ArchiveItem,
  )

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none text-center">
          <h1 className="mb-8 lg:mb-16">Search</h1>

          <div className="max-w-[50rem] mx-auto">
            <Search />
          </div>
        </div>
      </div>

      {results.totalDocs > 0 ? (
        <>
          <CollectionArchive posts={items} />
          <SearchPagination
            page={results.page ?? currentPage}
            query={query}
            totalPages={results.totalPages}
          />
        </>
      ) : (
        <div className="container">No results found.</div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Search | ${SITE_NAME}`,
  }
}
