import type { Page } from '@/payload-types'
import type { GalleryHero } from '@/blocks/gallery-types'

import { heading, paragraph, prose, richText, sampleLandscape } from '@/blocks/gallery-helpers'

type HeroData = Page['hero']

const link = (label: string, appearance: 'default' | 'outline' = 'default') => ({
  link: { type: 'custom' as const, url: '#', label, newTab: false, appearance },
})

const highImpactHeroGallery: GalleryHero<HeroData> = {
  type: 'highImpact',
  title: 'High Impact',
  description:
    'Full-bleed hero with a background image, navy gradient scrim, centered white copy and action buttons. The primary page intro (sets the header to dark).',
  variants: [
    {
      name: 'With navy gradient overlay',
      description: 'Default overlay — lifts text contrast over imagery.',
      props: {
        type: 'highImpact',
        media: sampleLandscape,
        overlay: 'navy-gradient',
        richText: richText(
          heading('Build once, reuse everywhere', 'h1'),
          paragraph('A native block system ported from the original site and tuned to the brand tokens.'),
        ),
        links: [link('Get started'), link('Learn more', 'outline')],
      },
    },
    {
      name: 'No overlay',
      description: 'Overlay disabled — raw image behind the copy.',
      props: {
        type: 'highImpact',
        media: sampleLandscape,
        overlay: 'none',
        richText: richText(
          heading('Raw imagery, no scrim', 'h1'),
          paragraph('Use when the image is already dark enough for legible text.'),
        ),
        links: [link('Get started')],
      },
    },
  ],
}

const mediumImpactHeroGallery: GalleryHero<HeroData> = {
  type: 'mediumImpact',
  title: 'Medium Impact',
  description:
    'In-flow hero: heading and buttons above a contained, captioned image. Lighter than High Impact, heavier than a mini-header.',
  variants: [
    {
      name: 'With captioned image',
      props: {
        type: 'mediumImpact',
        media: { ...sampleLandscape, caption: prose('A contained hero image with a caption.') },
        richText: richText(
          heading('A measured introduction', 'h2'),
          paragraph('Sets context without taking over the viewport.'),
        ),
        links: [link('Explore')],
      },
    },
  ],
}

const lowImpactHeroGallery: GalleryHero<HeroData> = {
  type: 'lowImpact',
  title: 'Low Impact',
  description:
    'Mini-header for interior pages: a constrained rich-text intro, no media. The default for section and landing-page headers.',
  variants: [
    {
      name: 'Text only',
      props: {
        type: 'lowImpact',
        richText: richText(
          heading('Interior page header', 'h2'),
          paragraph('A compact lead-in for pages that do not need a full hero.'),
        ),
      },
    },
  ],
}

/**
 * Heros rendered by the gallery, in display order. See `gallery-types.ts` for
 * the convention. Render-side only — not imported into the Payload config graph.
 */
// Heterogeneous hero data shapes; rendered through RenderHero (a loose props type).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const galleryHeros: GalleryHero<any>[] = [
  highImpactHeroGallery,
  mediumImpactHeroGallery,
  lowImpactHeroGallery,
]
