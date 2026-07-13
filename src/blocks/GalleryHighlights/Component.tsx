import type { GalleryHighlightsBlock as Props } from '@/payload-types'

import configPromise from '@payload-config'
import { ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

import { fmtDate, getGalleryHighlights } from './data'

export const GalleryHighlightsBlock: React.FC<Props & { id?: string }> = async (props) => {
  const { eyebrow, heading, body, limit: limitFromProps, anchorId } = props
  const limit = limitFromProps ?? 6

  const payload = await getPayload({ config: configPromise })
  const cards = await getGalleryHighlights(payload, limit)

  // Nothing to feature (fresh DB / CI): render nothing rather than an empty shell.
  if (cards.length === 0) return null

  const showHeader = eyebrow || heading || body

  return (
    <section className="container my-16 scroll-mt-24" id={anchorId || undefined}>
      {showHeader && (
        <div className="mb-12 max-w-2xl">
          {eyebrow && <p className="mb-3 type-eyebrow text-primary">{eyebrow}</p>}
          {heading && <h2 className="type-h2">{heading}</h2>}
          {body && <RichText className="mt-4" data={body} enableGutter={false} />}
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ post, cover, count }) => {
          const updated = fmtDate(post.galleryUpdatedAt)
          return (
            <Link
              key={post.slug}
              href={`/latest-updates/${post.slug}#post-gallery`}
              className="group relative flex h-full flex-col overflow-hidden rounded-lg border bg-card transition-colors hover:border-primary"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Media
                  fill
                  imageSize="card"
                  imgClassName="object-cover transition-transform duration-300 group-hover:scale-105"
                  resource={cover}
                  size="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white">
                  <ImageIcon aria-hidden className="size-3.5" />
                  {count} {count === 1 ? 'photo' : 'photos'}
                </span>
              </div>
              <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                <h3 className="type-h4 group-hover:text-primary">{post.title}</h3>
                {updated && <p className="mt-2 text-sm text-muted-foreground">Updated {updated}</p>}
                <span aria-hidden className="mt-auto pt-4 text-sm font-medium text-primary">
                  View gallery →
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
