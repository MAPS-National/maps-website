import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import { SITE_NAME } from '@/utilities/brand'
import { collectionHref } from '@/utilities/collectionHref'
import { getServerSideURL } from '@/utilities/getURL'

type Args = {
  searchParams: Promise<{
    q: string
    page?: string
  }>
}

const SNIPPET_LEN = 200

// A ~200-char window of `source` centred on the first match of `query`, elided
// with … on each cut side. Falls back to the head of the text when the match is
// in the title/slug (not the body).
const excerpt = (source: string | undefined, query: string): string => {
  const text = (source ?? '').trim()
  if (!text) return ''
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) {
    return text.length > SNIPPET_LEN ? `${text.slice(0, SNIPPET_LEN).trimEnd()}…` : text
  }
  const start = Math.max(0, idx - 70)
  const end = Math.min(text.length, idx + query.length + 130)
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`
}

// Split `text` into runs, bolding each case-insensitive occurrence of `query`.
const highlight = (text: string, query: string): React.ReactNode[] => {
  if (!query) return [text]
  const out: React.ReactNode[] = []
  const lower = text.toLowerCase()
  const q = query.toLowerCase()
  let i = 0
  let k = 0
  for (;;) {
    const idx = lower.indexOf(q, i)
    if (idx === -1) {
      out.push(text.slice(i))
      break
    }
    if (idx > i) out.push(text.slice(i, idx))
    out.push(
      <mark key={k++} className="bg-transparent font-semibold text-foreground">
        {text.slice(idx, idx + q.length)}
      </mark>,
    )
    i = idx + q.length
  }
  return out
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
        depth: 0,
        limit: 12,
        page,
        // Posts rank above pages (see searchPlugin defaultPriorities).
        sort: '-priority',
        select: {
          title: true,
          slug: true,
          meta: true,
          content: true,
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

  // The search doc carries slug/title/meta/content synced onto it (see
  // search/fieldOverrides.ts); `doc.relationTo` is the source collection, which
  // decides the link target (pages → root, posts → /latest-updates).
  const docs =
    results?.docs.map((doc) => {
      const d = doc as {
        id: number
        title?: string | null
        slug?: string | null
        content?: string | null
        meta?: { description?: string | null } | null
        doc?: { relationTo?: 'pages' | 'posts' } | null
      }
      return {
        id: d.id,
        title: d.title ?? '',
        slug: d.slug ?? '',
        content: d.content ?? undefined,
        description: d.meta?.description ?? undefined,
        relationTo: (d.doc?.relationTo ?? 'posts') as 'pages' | 'posts',
      }
    }) ?? []

  // Breadcrumb-style display URL (no scheme), e.g. mapsnational.org/latest-updates/x.
  const host = getServerSideURL()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
  const displayUrl = (href: string) => (href === '/' ? host : `${host}${href}`)

  const buildHref = (n: number) =>
    query ? `/search?q=${encodeURIComponent(query)}&page=${n}` : `/search?page=${n}`

  return (
    <div className="container pt-24 pb-24">
      <PageClient />
      <div className="max-w-2xl">
        <h1 className="type-h2 mb-6">Search</h1>
        <Search initialValue={query} />

        <div className="mt-8">
          {!query ? (
            <p className="text-muted-foreground">Enter a search term to see results.</p>
          ) : results && results.totalDocs > 0 ? (
            <>
              <p className="mb-6 text-sm text-muted-foreground">
                {results.totalDocs} result{results.totalDocs === 1 ? '' : 's'} for “{query}”
              </p>

              <div className="flex flex-col gap-7">
                {docs.map((result) => {
                  const href = collectionHref(result.relationTo, result.slug)
                  const snippet = excerpt(result.content ?? result.description, query)
                  return (
                    <article key={result.id}>
                      <Link href={href} className="group block no-underline">
                        <div className="truncate text-sm text-muted-foreground">
                          {displayUrl(href)}
                        </div>
                        <h2 className="type-h4 mt-0.5 text-primary group-hover:underline">
                          {result.title}
                        </h2>
                      </Link>
                      {snippet && (
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {highlight(snippet, query)}
                        </p>
                      )}
                    </article>
                  )
                })}
              </div>

              {results.totalPages > 1 && (
                <nav className="mt-10 flex items-center gap-6" aria-label="Search results pages">
                  {results.hasPrevPage ? (
                    <Link href={buildHref(page - 1)} className="hover:underline">
                      ← Previous
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">← Previous</span>
                  )}
                  <span className="text-sm text-muted-foreground">
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
            <p className="text-muted-foreground">No results found for “{query}”.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Search | ${SITE_NAME}`,
  }
}
