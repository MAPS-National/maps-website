import React from 'react'

import type { LogoStripBlock as LogoStripBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'

type LogoItem = NonNullable<LogoStripBlockProps['items']>[number]

const LogoImage: React.FC<{ item: LogoItem }> = ({ item }) => {
  const { enableLink, link, logo } = item

  if (!logo || typeof logo !== 'object') return null

  // Real partner logos are a grab-bag of raw exports: some carry their own
  // white/colored background rectangle, some are dark-on-transparent. Matting
  // every logo on a fixed white card (regardless of site theme) normalizes
  // the mismatched sources and keeps dark logos legible on the dark theme's
  // near-black page background — the same theme-invariant-white pattern
  // PostHero uses for its preview card.
  const image = (
    <div className="flex h-20 w-40 items-center justify-center rounded-md border border-border bg-[var(--neutral-white)] shadow-sm md:h-24 md:w-44">
      <Media
        className="relative h-12 w-28 md:h-14 md:w-32"
        fill
        imgClassName="object-contain"
        resource={logo}
      />
    </div>
  )

  if (enableLink && link) {
    return (
      <CMSLink {...link} className="inline-flex items-center">
        {image}
      </CMSLink>
    )
  }

  return image
}

/**
 * Strip of partner / supporter logos. Two layouts: a static centered grid that
 * wraps, or a continuous auto-scrolling marquee. The marquee renders the logos
 * twice and animates the track -50% for a seamless loop (pure CSS — no client
 * JS; pauses on hover and disabled under prefers-reduced-motion, see
 * globals.css).
 */
export const LogoStripBlock: React.FC<LogoStripBlockProps> = (props) => {
  const { heading, items, layout } = props

  const logos = items || []
  const isMarquee = layout === 'marquee'

  return (
    <section className="container">
      {heading && <p className="mb-8 text-center type-eyebrow text-content-secondary">{heading}</p>}

      {isMarquee ? (
        <div className="relative overflow-hidden">
          <ul className="logo-marquee-track flex w-max items-center gap-x-16">
            {logos.map((item, i) => (
              <li className="shrink-0" key={i}>
                <LogoImage item={item} />
              </li>
            ))}
            {/* Duplicate set completes the seamless -50% loop. */}
            {logos.map((item, i) => (
              <li aria-hidden="true" className="shrink-0" key={`dup-${i}`}>
                <LogoImage item={item} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {logos.map((item, i) => (
            <li key={i}>
              <LogoImage item={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
