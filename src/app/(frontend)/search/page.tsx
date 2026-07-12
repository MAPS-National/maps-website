import type { Metadata } from 'next/types'

import { ArchiveResult, CollectionArchive } from '@/components/CollectionArchive'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import { SITE_NAME } from '@/utilities/brand'

type Args = {
  searchParams: Promise<{
    q: string
    page?: string
  }>
}
export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: rawQuery, page: pageParam } = await searchParamsPromise
  const query = (rawQuery ?? '').trim()
  const page = Math.max(1, Number(pageParam) || 1)
  const payload = await getPayload({ config: configPromise })

  // Only hit the index once the visitor has actually searched — a bare /search
  // shows the input and a prompt, never the whole catalog.
  const results = query
    ? await payload.find({
        collection: 'search',
        depth: 1,
        limit: 12,
        page,
        // Posts rank above pages (see searchPlugin defaultPriorities).
        sort: '-priority',
        select: {
          title: true,
          slug: true,
          categories: true,
          meta: true,
          doc: true,
        },
        where: {
          or: [
            { title: { like: query } },
            { 'meta.description': { like: query } },
            { 'meta.title': { like: query } },
            { slug: { like: query } },
            { content: { like: query } },
          ],
        },
      })
    : null

  // Carry each hit's source collection so pages link to '/', posts to
  // '/latest-updates'. The search doc already has slug/title/meta/categories
  // synced onto it (see search/fieldOverrides.ts), so no `doc.value` populate.
  const docs =
    results?.docs.map(
      (doc): ArchiveResult => ({
        ...(doc as unknown as ArchiveResult),
        relationTo: doc.doc?.relationTo ?? 'posts',
      }),
    ) ?? []

  const buildHref = (n: number) =>
    query ? `/search?q=${encodeURIComponent(query)}&page=${n}` : `/search?page=${n}`

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none text-center">
          <h1 className="mb-8 lg:mb-16">Search</h1>

          <div className="max-w-[50rem] mx-auto">
            <Search initialValue={query} />
          </div>
        </div>
      </div>

      {!query ? (
        <div className="container text-center text-muted-foreground">
          Enter a search term to see results.
        </div>
      ) : results && results.totalDocs > 0 ? (
        <>
          <CollectionArchive posts={docs} />
          {results.totalPages > 1 && (
            <nav
              className="container mt-12 flex items-center justify-center gap-6"
              aria-label="Search results pages"
            >
              {results.hasPrevPage ? (
                <Link href={buildHref(page - 1)} className="hover:underline">
                  ← Previous
                </Link>
              ) : (
                <span className="text-muted-foreground">← Previous</span>
              )}
              <span className="text-muted-foreground">
                Page {results.page} of {results.totalPages}
              </span>
              {results.hasNextPage ? (
                <Link href={buildHref(page + 1)} className="hover:underline">
                  Next →
                </Link>
              ) : (
                <span className="text-muted-foreground">Next →</span>
              )}
            </nav>
          )}
        </>
      ) : (
        <div className="container">No results found for “{query}”.</div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Search | ${SITE_NAME}`,
  }
}
