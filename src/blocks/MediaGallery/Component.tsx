import React from 'react'

import type { MediaGalleryBlock as MediaGalleryBlockProps } from '@/payload-types'

import { getMediaUrl } from '@/utilities/getMediaUrl'

import { MediaGalleryClient, type GalleryImage } from './MediaGalleryClient'

/**
 * Image gallery — grid or horizontal slider, with an optional click-to-zoom
 * lightbox. The block resolves each Media upload to a plain, serializable
 * descriptor here (server side) and hands the list to a client component that
 * owns the interactive grid/slider and the lightbox dialog.
 */
export const MediaGalleryBlock: React.FC<MediaGalleryBlockProps> = (props) => {
  const { columns, density, enableLightbox, heading, images, layout } = props

  const resolved: GalleryImage[] = []
  for (const { caption, image } of images || []) {
    if (!image || typeof image !== 'object' || !image.url) continue
    resolved.push({
      src: getMediaUrl(image.url, image.updatedAt),
      alt: caption || image.alt || '',
      width: image.width || 1200,
      height: image.height || 800,
      ...(caption ? { caption } : {}),
    })
  }

  if (resolved.length === 0) return null

  return (
    <section className="container">
      {heading && (
        <h2 className="mb-8 text-3xl font-semibold md:text-4xl">{heading}</h2>
      )}
      <MediaGalleryClient
        columns={columns ?? '3'}
        density={density ?? 'comfortable'}
        images={resolved}
        layout={layout ?? 'grid'}
        lightbox={enableLightbox ?? true}
      />
    </section>
  )
}
