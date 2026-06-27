import { formatDateTime } from 'src/utilities/formatDateTime'
import React from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'
import { formatAuthors } from '@/utilities/formatAuthors'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title } = post

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''
  const hasImage = heroImage && typeof heroImage !== 'string'

  return (
    // Full-bleed navy band that the overlay header sits on; pulls up under the
    // header (which the post page sets to its dark/white-logo theme).
    <div className="-mt-[calc(var(--header-height)+var(--page-top-pad))] bg-brand-primary">
      <div className="container pb-14 pt-[calc(var(--header-height)+var(--page-top-pad))]">
        {/* Same 48rem centered column the article body uses, so the headline
            aligns with the prose below it (and the flyer's right edge with it). */}
        <div
          className={cn(
            'mx-auto max-w-[48rem] items-center gap-10 lg:gap-16',
            hasImage && 'lg:grid lg:grid-cols-[minmax(0,1fr)_18rem]',
          )}
        >
          {/* Text column — leads the masthead, one clear H1 */}
          <div className="max-w-[42rem]">
            {categories && categories.length > 0 && (
              <div className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--brand-secondary-lighter)]">
                {categories.map((category, index) => {
                  if (typeof category === 'object' && category !== null) {
                    const titleToUse = category.title || 'Untitled category'
                    const isLast = index === categories.length - 1
                    return (
                      <React.Fragment key={index}>
                        {titleToUse}
                        {!isLast && <React.Fragment>,&nbsp;</React.Fragment>}
                      </React.Fragment>
                    )
                  }
                  return null
                })}
              </div>
            )}

            <h1 className="text-balance text-3xl leading-tight text-white md:text-4xl lg:text-5xl">
              {title}
            </h1>

            <div className="mt-8 flex flex-wrap gap-x-10 gap-y-3 border-t border-white/15 pt-5 text-sm">
              {hasAuthors && (
                <div className="flex flex-col gap-1">
                  <p className="text-xs uppercase tracking-wide text-white/70">Author</p>
                  <p className="text-white">{formatAuthors(populatedAuthors)}</p>
                </div>
              )}
              {publishedAt && (
                <div className="flex flex-col gap-1">
                  <p className="text-xs uppercase tracking-wide text-white/70">Published</p>
                  <time className="text-white" dateTime={publishedAt}>
                    {formatDateTime(publishedAt)}
                  </time>
                </div>
              )}
            </div>
          </div>

          {/* Flyer card — shown whole (intrinsic Media, never cropped) on a white card */}
          {hasImage && (
            <div className="mt-8 w-full max-w-[20rem] overflow-hidden rounded-lg bg-[var(--neutral-white)] shadow-2xl ring-1 ring-white/10 lg:mt-0 lg:max-w-none">
              <Media
                resource={heroImage}
                imgClassName="block w-full h-auto"
                size="(max-width: 1024px) 80vw, 22rem"
                priority
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
