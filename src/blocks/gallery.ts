import type { GalleryBlock } from './gallery-types'

import { archiveGallery } from './ArchiveBlock/gallery'
import { callToActionGallery } from './CallToAction/gallery'
import { cardGridGallery } from './CardGrid/gallery'
import { contentGallery } from './Content/gallery'
import { faqGallery } from './FAQ/gallery'
import { featureSplitGallery } from './FeatureSplit/gallery'
import { formGallery } from './Form/gallery'
import { logoStripGallery } from './LogoStrip/gallery'
import { mediaBlockGallery } from './MediaBlock/gallery'
import { mediaGalleryGallery } from './MediaGallery/gallery'
import { pricingTiersGallery } from './PricingTiers/gallery'

/**
 * Registry of block gallery entries rendered by `/design-system/blocks`.
 *
 * Each block colocates its sample data + variants in `BlockDir/gallery.ts`
 * (see `gallery-types.ts` for the convention). Add a block to the gallery by
 * authoring its `gallery.ts` and listing it here. Order here is display order.
 *
 * Any block registered in `blockComponents` but missing from this list still
 * appears in the gallery as a "no example yet" stub — the route derives its
 * section list from the render registry, not from this array alone.
 *
 * Render-side only: do not import this into the Payload config graph.
 */
// Heterogeneous per-block prop shapes; the route spreads each into a loose
// component type, so a single concrete element type would be over-constrained.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const galleryBlocks: GalleryBlock<any>[] = [
  cardGridGallery,
  contentGallery,
  callToActionGallery,
  mediaBlockGallery,
  archiveGallery,
  formGallery,
  faqGallery,
  featureSplitGallery,
  logoStripGallery,
  mediaGalleryGallery,
  pricingTiersGallery,
]
