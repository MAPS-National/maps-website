import configPromise from '@payload-config'
import NextImage from 'next/image'
import { getPayload } from 'payload'
import React from 'react'

import type { Testimonial, TestimonialsBlock as TestimonialsBlockProps } from '@/payload-types'

import { Carousel } from '@/components/Carousel'
import RichText from '@/components/RichText'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

/** Resolve a headshot relationship to a usable src, if present. */
const headshotSrc = (t: Testimonial): string | null => {
  const photo = t.headshot
  if (photo && typeof photo === 'object' && photo.url) return getMediaUrl(photo.url, photo.updatedAt)
  return null
}

/**
 * The Webflow source had no real author names — the imported `author` is a
 * legacy id code ("10", "11", "1b", "4a"). Treat an author that's just digits
 * (optionally one trailing letter) as "no name" so we show an anonymous quote
 * (no attribution block) instead of junk. Hand-seeded testimonials with real
 * names ("Amina R.") are unaffected.
 */
const hasNamedAuthor = (t: Testimonial): boolean =>
  Boolean(t.author && !/^\d+[a-z]?$/i.test(t.author.trim()))

const Avatar: React.FC<{ testimonial: Testimonial; className?: string }> = ({
  testimonial,
  className,
}) => {
  const src = headshotSrc(testimonial)
  if (src) {
    return (
      <span className={cn('relative block aspect-square overflow-hidden rounded-full', className)}>
        <NextImage
          alt={testimonial.author}
          className="object-cover"
          fill
          sizes="64px"
          src={src}
        />
      </span>
    )
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex aspect-square items-center justify-center rounded-full bg-primary/10 font-serif font-semibold text-primary',
        className,
      )}
    >
      {initials(testimonial.author)}
    </span>
  )
}

const Identity: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => (
  <div>
    <p className="font-serif font-semibold text-content">{testimonial.author}</p>
    {testimonial.role && <p className="text-sm text-content-secondary">{testimonial.role}</p>}
  </div>
)

/**
 * Testimonials — quotes from the Testimonials collection. The server resolves
 * the docs (collection query or an editor-picked selection), filters by `type`,
 * then renders a card grid or a single featured pull-quote. Server-only — no
 * interactivity, so no client child.
 */
export const TestimonialsBlock: React.FC<TestimonialsBlockProps & { id?: string }> = async (
  props,
) => {
  const { eyebrow, heading, intro, limit, populateBy, selectedTestimonials, type, variant } = props

  let docs: Testimonial[] = []
  if (populateBy === 'selection') {
    docs = (selectedTestimonials || [])
      .map((t) => (typeof t === 'object' ? t : null))
      .filter((t): t is Testimonial => Boolean(t))
    if (type && type !== 'all') docs = docs.filter((t) => t.type === type)
  } else {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'testimonials',
      depth: 1,
      limit: limit && limit > 0 ? limit : 0,
      sort: 'author',
      ...(type && type !== 'all' ? { where: { type: { equals: type } } } : {}),
    })
    docs = result.docs
  }

  if (docs.length === 0) return null

  const hasHeader = eyebrow || heading || intro

  return (
    <section className="container py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        {hasHeader && (
          <div className="mb-12 max-w-2xl">
            {eyebrow && (
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
                {eyebrow}
              </p>
            )}
            {heading && (
              <h2 className="font-serif text-4xl font-semibold md:text-5xl">{heading}</h2>
            )}
            {intro && <RichText className="mt-4" data={intro} enableGutter={false} />}
          </div>
        )}

        {variant === 'single' ? (
          <figure className="mx-auto max-w-3xl text-center">
            <blockquote className="font-serif text-2xl font-medium leading-relaxed text-content md:text-3xl">
              <RichText
                className="prose-p:text-xl prose-p:font-medium prose-p:leading-relaxed md:prose-p:text-2xl"
                data={docs[0].quote}
                enableGutter={false}
              />
            </blockquote>
            {hasNamedAuthor(docs[0]) && (
              <figcaption className="mt-8 flex items-center justify-center gap-4">
                <Avatar className="size-14" testimonial={docs[0]} />
                <Identity testimonial={docs[0]} />
              </figcaption>
            )}
          </figure>
        ) : variant === 'slider' ? (
          // One quote at a time, styled like the `single` variant (centered serif
          // pull-quote, no card/border/background) but advanced as an autoplaying
          // slider with prev/next controls.
          <Carousel
            ariaLabel={heading || 'Testimonials'}
            autoPlay
            interval={10000}
            slideClassName="w-full"
          >
            {docs.map((t) => (
              <figure
                className="mx-auto flex h-full max-w-3xl flex-col justify-center px-4 text-center"
                key={t.id}
              >
                <blockquote className="font-serif text-xl font-medium leading-relaxed text-content md:text-2xl">
                  <RichText
                    className="prose-p:text-xl prose-p:font-medium prose-p:leading-relaxed md:prose-p:text-2xl"
                    data={t.quote}
                    enableGutter={false}
                  />
                </blockquote>
                {hasNamedAuthor(t) && (
                  <figcaption className="mt-8 flex items-center justify-center gap-4">
                    <Avatar className="size-14" testimonial={t} />
                    <Identity testimonial={t} />
                  </figcaption>
                )}
              </figure>
            ))}
          </Carousel>
        ) : (
          <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {docs.map((t) => (
              <li
                key={t.id}
                className="flex flex-col rounded-lg border border-border bg-card p-6 shadow-sm"
              >
                <blockquote className="flex-1 text-content">
                  <RichText
                    className="prose-p:my-2 prose-p:text-[0.95rem] prose-p:leading-relaxed"
                    data={t.quote}
                    enableGutter={false}
                    enableProse
                  />
                </blockquote>
                {hasNamedAuthor(t) && (
                  <figcaption className="mt-6 flex items-center gap-3">
                    <Avatar className="size-12" testimonial={t} />
                    <Identity testimonial={t} />
                  </figcaption>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
