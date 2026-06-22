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
    <section className="container" id={header?.anchorId || undefined}>
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
          const { icon, image, heading, body, links, enableCardLink, cardLink, requiredPlans } = item
          const media = mediaType === 'icon' ? icon : mediaType === 'image' ? image : null

          const head = (
            <>
              {media && typeof media === 'object' && mediaType === 'image' && (
                <div className="relative mb-5 aspect-video overflow-hidden rounded-md">
                  <Media fill imgClassName="object-cover" resource={media} />
                </div>
              )}
              {media && typeof media === 'object' && mediaType === 'icon' && (
                <div className="relative mb-4 h-12 w-12">
                  <Media fill imgClassName="object-contain" resource={media} />
                </div>
              )}
              {heading && <h3 className="text-xl font-semibold">{heading}</h3>}
            </>
          )

          return (
            <div
              className="flex h-full flex-col rounded-lg border bg-card p-6 dark:bg-secondary"
              data-required-plans={
                Array.isArray(requiredPlans) && requiredPlans.length > 0
                  ? requiredPlans.join(',')
                  : undefined
              }
              key={index}
            >
              {enableCardLink && cardLink ? (
                <CMSLink {...cardLink} className="block transition-opacity hover:opacity-80">
                  {head}
                </CMSLink>
              ) : (
                head
              )}

              {body && <RichText className="mt-3 text-muted-foreground" data={body} enableGutter={false} />}

              {Array.isArray(links) && links.length > 0 && (
                <div className="mt-auto flex flex-wrap gap-3 pt-6">
                  {links.map(({ link }, i) => (
                    <CMSLink key={i} {...link} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
