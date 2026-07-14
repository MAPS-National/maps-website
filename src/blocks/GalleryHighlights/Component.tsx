import type { GalleryHighlightsBlock as Props } from '@/payload-types'

import configPromise from '@payload-config'
import { CalendarDays, ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'

import { fmtDate, getGalleryHighlights } from './data'

// Polaroid tilt + vertical stagger, cycled by index. Deterministic on purpose: the
// reference design randomises these per render, but this is a server component, so
// Math.random() would pick different values on the server and the client and trip a
// hydration mismatch. Cycling by index gives the same casual scatter, stably.
const TILT = ['-rotate-2', 'rotate-1', 'rotate-2', '-rotate-1', 'rotate-1', '-rotate-2']
const STAGGER = ['mt-0', 'mt-6', 'mt-2', 'mt-5', 'mt-0', 'mt-6']

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

      <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-14">
        {cards.map(({ post, cover, count }, i) => {
          const updated = fmtDate(post.galleryUpdatedAt)
          return (
            <Link
              key={post.slug}
              href={`/latest-updates/${post.slug}#post-gallery`}
              // z-lift so a hovered photo scales over its neighbours rather than under.
              className={cn(
                'group relative z-0 block transition-transform duration-300',
                'hover:z-10 hover:rotate-0 hover:scale-105',
                TILT[i % TILT.length],
                STAGGER[i % STAGGER.length],
              )}
            >
              {/* Strip of tape holding the photo to the page. It straddles the print's
                  top edge, so it has to read against BOTH the white print and the dark
                  page behind it — hence a mid neutral at high opacity rather than a
                  tint of either surface (a dark tint disappears on the dark theme). */}
              <span
                aria-hidden
                className="pointer-events-none absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-3 bg-[var(--neutral-light)]/85 shadow-sm ring-1 ring-[var(--neutral-darker)]/10"
              />

              {/* The print: uniform frame with a deeper chin under the photo, which is
                  what actually reads as "polaroid". The print stays WHITE in both themes
                  (a photo print doesn't invert) — so it binds the theme-independent
                  neutral primitives rather than the themed card/foreground slots, and
                  carries its own dark text. On the dark theme it reads as prints laid on
                  a dark surface, which is the whole effect. */}
              <figure className="flex h-full flex-col rounded-md bg-[var(--neutral-white)] p-3 shadow-md ring-1 ring-[var(--neutral-darker)]/10 transition-shadow duration-300 group-hover:shadow-xl">
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                  <Media
                    fill
                    imageSize="card"
                    imgClassName="object-cover"
                    resource={cover}
                    size="(max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                <figcaption className="mt-3 px-1 pb-2">
                  {/* Hover uses the brand-primary BASE, not the themed `primary` slot:
                      the dark theme maps `primary` to a light tint for dark surfaces,
                      which would be washed out on this always-white print. Pinning the
                      base navy keeps the hover identical in both themes. */}
                  <h3 className="type-h4 line-clamp-2 text-center text-[var(--neutral-darker)] transition-colors group-hover:text-[var(--brand-primary-base)]">
                    {post.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs text-[var(--neutral-base)]">
                    <span className="flex items-center gap-1">
                      <ImageIcon aria-hidden className="size-3 shrink-0" />
                      {count} {count === 1 ? 'photo' : 'photos'}
                    </span>
                    {updated && (
                      <span className="flex items-center gap-1">
                        <CalendarDays aria-hidden className="size-3 shrink-0" />
                        {updated}
                      </span>
                    )}
                  </div>
                </figcaption>
              </figure>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
