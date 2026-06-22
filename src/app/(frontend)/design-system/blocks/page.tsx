import type { Metadata } from 'next'
import React from 'react'

import { galleryEntries } from '@/blocks/gallery-entries'

import { GalleryCard } from './GalleryCard'
import { ThemeToggle } from '../ThemeToggle'

export default function BlocksGalleryPage() {
  return (
    <main className="container flex flex-col gap-xl py-xl">
      <header className="flex flex-col gap-s">
        <div className="flex flex-col gap-xs">
          <h1 className="text-4xl">Blocks Gallery</h1>
          <p className="max-w-prose text-content-secondary">
            Every layout block and hero, rendered with sample data. Open one to switch between its
            variants in light or dark.
          </p>
        </div>
        <div>
          <ThemeToggle />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-l sm:grid-cols-2 lg:grid-cols-3">
        {galleryEntries.map((entry) => (
          <GalleryCard entry={entry} key={entry.slug} />
        ))}
      </div>
    </main>
  )
}

export const metadata: Metadata = {
  title: 'Blocks Gallery',
  robots: { index: false, follow: false },
}
