'use client'

import React, { useEffect, useState } from 'react'

import { cn } from '@/utilities/ui'

export type GalleryNavItem = { href: string; label: string }

/**
 * Sticky table-of-contents for the blocks gallery. A horizontal scroll strip on
 * mobile (sticks to the top of the viewport) and a sticky vertical sidebar on
 * large screens. Highlights the section currently in view via IntersectionObserver.
 *
 * Items are passed in from the server page, derived from the render registry — so
 * the nav stays correct as blocks and heros are added.
 */
export const GalleryNav: React.FC<{ items: GalleryNavItem[] }> = ({ items }) => {
  const [active, setActive] = useState<string>(items[0]?.href ?? '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length === 0) return
        // Topmost section currently intersecting the active band wins.
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        setActive(`#${visible[0].target.id}`)
      },
      // Active band is the top ~30% of the viewport.
      { rootMargin: '0px 0px -70% 0px', threshold: 0 },
    )

    items.forEach((it) => {
      const el = document.querySelector(it.href)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  return (
    <nav
      aria-label="Gallery sections"
      className={cn(
        'sticky top-0 z-30 -mx-4 flex gap-2 overflow-x-auto border-b border-border bg-background/95 px-4 py-2 backdrop-blur',
        'lg:top-8 lg:mx-0 lg:w-52 lg:shrink-0 lg:flex-col lg:gap-1 lg:self-start lg:overflow-visible lg:border-b-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none',
      )}
    >
      {items.map((item) => {
        const isActive = active === item.href
        return (
          <a
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-md px-3 py-2.5 text-sm transition-colors lg:shrink',
              isActive
                ? 'bg-surface-secondary font-medium text-foreground'
                : 'text-muted-foreground hover:bg-surface-secondary hover:text-foreground',
            )}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </a>
        )
      })}
    </nav>
  )
}
