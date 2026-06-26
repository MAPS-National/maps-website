import React from 'react'

import type { CardGridBlock as CardGridBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'

const colsClasses: Record<string, string> = {
  '2': 'sm:grid-cols-2',
  '3': 'sm:grid-cols-2 lg:grid-cols-3',
  '4': 'sm:grid-cols-2 lg:grid-cols-4',
}

export const CardGridBlock: React.FC<CardGridBlockProps> = (props) => {
  const { header, columns, mediaType, items } = props

  const cols = colsClasses[columns ?? '3'] ?? colsClasses['3']
  const showHeader =
    header?.enableHeader && (header.eyebrow || header.heading || header.body)

  return (
    <section className="container scroll-mt-24" id={header?.anchorId || undefined}>
      {showHeader && (
        <div className="mb-12 max-w-2xl">
          {header?.eyebrow && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
              {header.eyebrow}
            </p>
          )}
          {header?.heading && (
            <h2 className="text-3xl font-semibold md:text-4xl">{header.heading}</h2>
          )}
          {header?.body && (
            <RichText className="mt-4" data={header.body} enableGutter={false} />
          )}
        </div>
      )}

      <div className={cn('grid grid-cols-1 gap-x-8 gap-y-12', cols)}>
        {items?.map((item, index) => {
          const {
            icon,
            image,
            heading,
            badge,
            body,
            links,
            enableCardLink,
            cardLink,
            requiredPlans,
            featured,
          } = item
          const media = mediaType === 'icon' ? icon : mediaType === 'image' ? image : null
          const hasImage = mediaType === 'image' && media && typeof media === 'object'
          const hasIcon = mediaType === 'icon' && media && typeof media === 'object'
          // Whole-card link: an absolute overlay makes the entire surface (image
          // included) clickable; the button is suppressed when the card links.
          const isCardLink = Boolean(enableCardLink && cardLink)

          const textBody = (
            <>
              {badge && (
                <span className="mb-2 inline-flex w-fit items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {badge}
                </span>
              )}
              {heading && <h3 className="text-xl font-semibold">{heading}</h3>}
              {body && (
                <RichText
                  className={cn('mt-3', featured ? 'text-primary-foreground/80' : 'text-muted-foreground')}
                  data={body}
                  enableGutter={false}
                />
              )}
              {!isCardLink && Array.isArray(links) && links.length > 0 && (
                <div className="relative z-20 mt-auto flex flex-wrap gap-3 pt-6">
                  {links.map(({ link }, i) => (
                    // sr-only heading suffix disambiguates otherwise-identical CTA
                    // labels (e.g. eight "Get started" tiles) for screen-reader
                    // link navigation — WCAG 2.4.4. Visible text is unchanged.
                    <CMSLink key={i} {...link}>
                      {heading && <span className="sr-only">{`: ${heading}`}</span>}
                    </CMSLink>
                  ))}
                </div>
              )}
            </>
          )

          return (
            <div
              className={cn(
                'group relative flex h-full flex-col overflow-hidden rounded-lg border bg-card transition-colors',
                !hasImage && 'p-6',
                isCardLink && !featured && 'hover:border-primary',
                // Featured: filled navy accent (matches the portal quick-action tile)
                // so the active card stands out from neutral/placeholder siblings.
                featured && 'border-primary bg-primary text-primary-foreground hover:bg-primary/90',
              )}
              data-required-plans={
                Array.isArray(requiredPlans) && requiredPlans.length > 0
                  ? requiredPlans.join(',')
                  : undefined
              }
              key={index}
            >
              {isCardLink && (
                <CMSLink {...cardLink} className="absolute inset-0 z-10">
                  <span className="sr-only">{heading || 'View'}</span>
                </CMSLink>
              )}

              {hasImage && (
                <div className="relative aspect-video w-full overflow-hidden">
                  <Media
                    fill
                    imgClassName="object-cover transition-transform duration-300 group-hover:scale-105"
                    resource={media}
                  />
                </div>
              )}
              {hasIcon && (
                <div className="relative mb-4 h-12 w-12">
                  <Media fill imgClassName="object-contain" resource={media} />
                </div>
              )}

              {hasImage ? (
                <div className="flex flex-1 flex-col px-6 pb-6 pt-5">{textBody}</div>
              ) : (
                textBody
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
