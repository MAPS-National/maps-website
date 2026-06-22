'use client'

import NextImage from 'next/image'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/utilities/ui'

export type GalleryImage = {
  alt: string
  caption?: string
  height: number
  src: string
  width: number
}

const gridCols: Record<string, string> = {
  '2': 'sm:grid-cols-2',
  '3': 'sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-2 lg:grid-cols-4',
}

/**
 * Interactive surface for the Media Gallery block: a tiled grid or a swipeable
 * horizontal slider, plus an optional click-to-zoom lightbox. The lightbox is a
 * modal overlay with keyboard support (Esc to close, arrows to navigate), focus
 * sent to the close button on open and restored to the trigger on close.
 */
export const MediaGalleryClient: React.FC<{
  columns: string
  images: GalleryImage[]
  layout: string
  lightbox: boolean
}> = ({ columns, images, layout, lightbox }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)

  const isSlider = layout === 'slider'

  const open = useCallback(
    (i: number, el: HTMLElement) => {
      if (!lightbox) return
      triggerRef.current = el
      setOpenIndex(i)
    },
    [lightbox],
  )

  const close = useCallback(() => {
    setOpenIndex(null)
    triggerRef.current?.focus()
  }, [])

  const step = useCallback(
    (delta: number) => setOpenIndex((i) => (i === null ? i : (i + delta + images.length) % images.length)),
    [images.length],
  )

  useEffect(() => {
    if (openIndex === null) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [openIndex, close, step])

  const scrollByPage = (dir: number) => {
    const el = trackRef.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  const Thumb: React.FC<{ image: GalleryImage; index: number }> = ({ image, index }) => {
    const inner = (
      <NextImage
        alt={image.alt}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        src={image.src}
      />
    )
    const wrapperCls = 'group relative block aspect-[4/3] w-full overflow-hidden bg-surface-secondary'

    return lightbox ? (
      <button
        aria-label={`View image ${index + 1}${image.caption ? `: ${image.caption}` : ''}`}
        className={cn(wrapperCls, 'cursor-zoom-in')}
        onClick={(e) => open(index, e.currentTarget)}
        type="button"
      >
        {inner}
      </button>
    ) : (
      <div className={wrapperCls}>{inner}</div>
    )
  }

  return (
    <>
      {isSlider ? (
        <div className="relative">
          <ul
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            ref={trackRef}
          >
            {images.map((image, i) => (
              <li
                className="w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]"
                key={i}
              >
                <Thumb image={image} index={i} />
              </li>
            ))}
          </ul>
          {images.length > 1 && (
            <div className="mt-4 flex justify-end gap-2">
              <button
                aria-label="Previous images"
                className="rounded-md border border-border p-2 transition-colors hover:bg-surface-secondary"
                onClick={() => scrollByPage(-1)}
                type="button"
              >
                <Chevron dir="left" />
              </button>
              <button
                aria-label="Next images"
                className="rounded-md border border-border p-2 transition-colors hover:bg-surface-secondary"
                onClick={() => scrollByPage(1)}
                type="button"
              >
                <Chevron dir="right" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <ul className={cn('grid grid-cols-1 gap-4', gridCols[columns] ?? gridCols['3'])}>
          {images.map((image, i) => (
            <li key={i}>
              <Thumb image={image} index={i} />
            </li>
          ))}
        </ul>
      )}

      {openIndex !== null && (
        <div
          aria-label="Image viewer"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) close()
          }}
          role="dialog"
        >
          <button
            aria-label="Close"
            className="absolute right-4 top-4 rounded-md p-2 text-white/90 hover:text-white"
            onClick={close}
            ref={closeRef}
            type="button"
          >
            <CloseIcon />
          </button>

          {images.length > 1 && (
            <>
              <button
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-white/80 hover:text-white sm:left-4"
                onClick={() => step(-1)}
                type="button"
              >
                <Chevron dir="left" large />
              </button>
              <button
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-white/80 hover:text-white sm:right-4"
                onClick={() => step(1)}
                type="button"
              >
                <Chevron dir="right" large />
              </button>
            </>
          )}

          <figure className="flex max-h-full max-w-5xl flex-col items-center">
            <NextImage
              alt={images[openIndex].alt}
              className="h-auto max-h-[82vh] w-auto object-contain"
              height={images[openIndex].height}
              priority
              sizes="90vw"
              src={images[openIndex].src}
              width={images[openIndex].width}
            />
            {images[openIndex].caption && (
              <figcaption className="mt-3 text-center text-sm text-white/80">
                {images[openIndex].caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </>
  )
}

const Chevron: React.FC<{ dir: 'left' | 'right'; large?: boolean }> = ({ dir, large }) => (
  <svg
    aria-hidden="true"
    className={large ? 'size-8' : 'size-5'}
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d={dir === 'left' ? 'M15 6L9 12L15 18' : 'M9 6L15 12L9 18'}
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
)

const CloseIcon: React.FC = () => (
  <svg
    aria-hidden="true"
    className="size-7"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)
