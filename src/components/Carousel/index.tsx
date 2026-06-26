'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/utilities/ui'

/**
 * Shared scroll-snap carousel with optional autoplay. One primitive backing the
 * Testimonials slider, the home Latest Updates slider and the MediaGallery
 * community slider — no carousel dependency, just a horizontal snap track plus
 * prev/next controls.
 *
 * Each child becomes a slide (`shrink-0 snap-start` + the caller's
 * `slideClassName` for width). Autoplay advances one slide every `interval`ms,
 * loops at the end, and pauses on hover / keyboard focus; it is disabled when the
 * user prefers reduced motion.
 */
export const Carousel: React.FC<{
  children: React.ReactNode
  /** Width (and any extra) classes for each slide, e.g. 'w-[78%] sm:w-[46%] lg:w-[31%]'. */
  slideClassName?: string
  className?: string
  ariaLabel?: string
  autoPlay?: boolean
  /** Autoplay interval in ms (default 5000). */
  interval?: number
  showArrows?: boolean
}> = ({
  children,
  slideClassName,
  className,
  ariaLabel = 'Carousel',
  autoPlay = false,
  interval = 5000,
  showArrows = true,
}) => {
  const slides = React.Children.toArray(children)
  const count = slides.length
  const trackRef = useRef<HTMLUListElement>(null)
  const [index, setIndex] = useState(0)
  const paused = useRef(false)

  const goTo = useCallback((i: number, behavior: ScrollBehavior = 'smooth') => {
    const track = trackRef.current
    if (!track || count === 0) return
    const next = ((i % count) + count) % count
    const el = track.children[next] as HTMLElement | undefined
    if (el) track.scrollTo({ left: el.offsetLeft, behavior })
    setIndex(next)
  }, [count])

  // Autoplay: advance on a timer, paused on hover/focus or reduced-motion.
  useEffect(() => {
    if (!autoPlay || count <= 1) return
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return
    const id = window.setInterval(() => {
      if (!paused.current) goTo(index + 1)
    }, interval)
    return () => window.clearInterval(id)
  }, [autoPlay, count, index, interval, goTo])

  if (count === 0) return null

  const pause = () => {
    paused.current = true
  }
  const resume = () => {
    paused.current = false
  }

  return (
    <div
      className={cn('relative', className)}
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={resume}
      role="group"
    >
      <ul
        ref={trackRef}
        className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, i) => (
          <li key={i} className={cn('shrink-0 snap-start', slideClassName)}>
            {slide}
          </li>
        ))}
      </ul>

      {showArrows && count > 1 && (
        <div className="mt-4 flex justify-end gap-2">
          <button
            aria-label="Previous"
            className="flex size-10 items-center justify-center rounded-full border border-border text-content transition-colors hover:bg-surface-secondary"
            onClick={() => goTo(index - 1)}
            type="button"
          >
            <Arrow dir="left" />
          </button>
          <button
            aria-label="Next"
            className="flex size-10 items-center justify-center rounded-full border border-border text-content transition-colors hover:bg-surface-secondary"
            onClick={() => goTo(index + 1)}
            type="button"
          >
            <Arrow dir="right" />
          </button>
        </div>
      )}
    </div>
  )
}

const Arrow: React.FC<{ dir: 'left' | 'right' }> = ({ dir }) => (
  <svg
    aria-hidden="true"
    className={cn('size-5', dir === 'left' && 'rotate-180')}
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 12h14M13 6l6 6-6 6"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)
