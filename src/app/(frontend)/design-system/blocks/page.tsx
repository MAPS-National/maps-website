import type { Metadata } from 'next'
import React from 'react'

import { blockComponents } from '@/blocks/blockComponents'
import { galleryBlocks } from '@/blocks/gallery'

import { ThemeToggle } from '../ThemeToggle'

export default function BlocksGalleryPage() {
  return (
    <main className="container flex flex-col gap-xl py-xl">
      <header className="flex flex-col gap-xs">
        <h1 className="text-4xl">Blocks Gallery</h1>
        <p className="max-w-prose text-muted-foreground">
          Every layout block rendered with sample data, in both themes. The sample data and
          variant list for each block live beside the block in{' '}
          <code className="px-1">BlockDir/gallery.ts</code>.
        </p>
        <div>
          <ThemeToggle />
        </div>
      </header>

      {galleryBlocks.map((block) => {
        const Component = blockComponents[block.slug]

        return (
          <section key={block.slug} id={block.slug} className="flex flex-col gap-l">
            <div className="flex flex-col gap-xs border-b border-border pb-xs">
              <h2 className="text-2xl">{block.title}</h2>
              {block.description && (
                <p className="max-w-prose text-sm text-muted-foreground">{block.description}</p>
              )}
              <code className="text-xs text-muted-foreground">slug: {block.slug}</code>
            </div>

            {!Component && (
              <p className="text-content-error text-sm">
                No component registered for slug “{block.slug}”.
              </p>
            )}

            {Component &&
              block.variants.map((variant, i) => (
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
    </main>
  )
}

export const metadata: Metadata = {
  title: 'Blocks Gallery',
  robots: { index: false, follow: false },
}
