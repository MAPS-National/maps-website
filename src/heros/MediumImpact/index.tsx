import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

// Two-column split intro: text (optional badge, heading, copy, CTAs) on the left,
// a contained aspect-video image on the right. Image stacks below the text on mobile.
export const MediumImpactHero: React.FC<Page['hero']> = ({ badge, links, media, richText }) => {
  const hasLinks = Array.isArray(links) && links.length > 0

  return (
    <div className="container grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
        {badge && (
          <span className="mb-4 inline-flex w-fit items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {badge}
          </span>
        )}
        {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}
        {hasLinks && (
          <ul className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
            {links!.map(({ link }, i) => (
              <li key={i}>
                <CMSLink {...link} />
              </li>
            ))}
          </ul>
        )}
      </div>
      {media && typeof media === 'object' && (
        <figure>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
            <Media fill imgClassName="object-cover" priority resource={media} />
          </div>
          {media?.caption && (
            <figcaption className="mt-3">
              <RichText data={media.caption} enableGutter={false} />
            </figcaption>
          )}
        </figure>
      )}
    </div>
  )
}
