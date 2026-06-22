import type { Metadata } from 'next'
import React from 'react'

import { blockComponents } from '@/blocks/blockComponents'
import { galleryBlocks } from '@/blocks/gallery'
import { galleryHeros } from '@/heros/gallery'
import { RenderHero } from '@/heros/RenderHero'
import { cn } from '@/utilities/ui'

import { ThemeToggle } from '../ThemeToggle'

// Section list is derived from the render registry so a newly-registered block
// surfaces here automatically — with its curated examples if a gallery.ts exists,
// or a "no example yet" stub otherwise.
const curated = new Map(galleryBlocks.map((b) => [b.slug, b]))
const sectionSlugs = [
  ...galleryBlocks.map((b) => b.slug),
  ...Object.keys(blockComponents).filter((slug) => !curated.has(slug)),
]

// Nav is derived from the same lists the page renders, so adding a block or hero
// updates it with no nav edit.
const navItems = [
  ...sectionSlugs.map((slug) => ({ href: `#${slug}`, label: curated.get(slug)?.title ?? slug })),
  { href: '#heros', label: 'Heros' },
  ...galleryHeros.map((h) => ({ href: `#hero-${h.type}`, label: h.title })),
]

export default function BlocksGalleryPage() {
  return (
    <main className="container flex flex-col gap-xl py-xl">
      <header className="flex flex-col gap-s">
        <div className="flex flex-col gap-xs">
          <h1 className="text-4xl">Blocks Gallery</h1>
          <p className="max-w-prose text-muted-foreground">
            Every layout block and hero rendered with sample data, in both themes. The sample data
            and variant list for each live beside it in{' '}
            <code className="px-1">gallery.ts</code>.
          </p>
        </div>
        <div>
          <ThemeToggle />
        </div>
        <nav aria-label="Gallery sections" className="flex flex-wrap gap-2 pt-xs">
          {navItems.map((item) => (
            <a
              className="rounded-md border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-surface-secondary hover:text-foreground"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      {sectionSlugs.map((slug) => {
        const entry = curated.get(slug)
        const hasComponent = slug in blockComponents
        const Component = blockComponents[slug]
        const title = entry?.title ?? slug

        return (
          <section key={slug} id={slug} className="flex scroll-mt-8 flex-col gap-l">
            <div className="flex flex-col gap-xs border-b border-border pb-xs">
              <h2 className="text-2xl">{title}</h2>
              {entry?.description && (
                <p className="max-w-prose text-sm text-muted-foreground">{entry.description}</p>
              )}
              <code className="text-xs text-muted-foreground">slug: {slug}</code>
            </div>

            {!hasComponent && (
              <p className="text-content-error text-sm">
                No component registered for slug “{slug}”.
              </p>
            )}

            {hasComponent && !entry && (
              <p className="text-sm text-muted-foreground">
                No example yet — add <code className="px-1">{slug}/gallery.ts</code> to document this
                block.
              </p>
            )}

            {hasComponent &&
              entry?.variants.map((variant, i) => (
                <div className="flex flex-col gap-xs" key={i}>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold">{variant.name}</span>
                    {variant.description && (
                      <span className="text-xs text-muted-foreground">{variant.description}</span>
                    )}
                  </div>
                  <div className="overflow-hidden rounded-lg border border-border bg-background py-10">
                    <Component {...variant.props} disableInnerContainer />
                  </div>
                </div>
              ))}
          </section>
        )
      })}

      <section id="heros" className="flex scroll-mt-8 flex-col gap-l">
        <div className="flex flex-col gap-xs border-b border-border pb-xs">
          <h2 className="text-2xl">Heros</h2>
          <p className="max-w-prose text-sm text-muted-foreground">
            Page intros rendered above the layout blocks. Heros are a separate <code>hero</code>{' '}
            field (a <code>type</code> select), not layout blocks.
          </p>
        </div>

        {galleryHeros.map((hero) => (
          <div className="flex scroll-mt-8 flex-col gap-xs" id={`hero-${hero.type}`} key={hero.type}>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold">{hero.title}</h3>
              {hero.description && (
                <p className="max-w-prose text-xs text-muted-foreground">{hero.description}</p>
              )}
            </div>

            {hero.variants.map((variant, i) => (
              <div className="flex flex-col gap-xs" key={i}>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">{variant.name}</span>
                  {variant.description && (
                    <span className="text-xs text-muted-foreground">{variant.description}</span>
                  )}
                </div>
                <div
                  className={cn(
                    'overflow-hidden rounded-lg border border-border',
                    // High Impact uses a negative top margin to underlap the fixed
                    // site header; add matching padding so it isn't clipped here.
                    hero.type === 'highImpact' && 'pt-[10.4rem]',
                  )}
                >
                  <RenderHero {...variant.props} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>
    </main>
  )
}

export const metadata: Metadata = {
  title: 'Blocks Gallery',
  robots: { index: false, follow: false },
}
