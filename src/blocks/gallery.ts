import type { GalleryBlock } from './gallery-types'

import { cardGridGallery } from './CardGrid/gallery'

/**
 * Registry of block gallery entries rendered by `/design-system/blocks`.
 *
 * Each block colocates its sample data + variants in `BlockDir/gallery.ts`
 * (see `gallery-types.ts` for the convention). Add a block to the gallery by
 * authoring its `gallery.ts` and listing it here. Order here is display order.
 *
 * Render-side only: do not import this into the Payload config graph.
 */
// Heterogeneous per-block prop shapes; the route spreads each into a loose
// component type, so a single concrete element type would be over-constrained.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const galleryBlocks: GalleryBlock<any>[] = [cardGridGallery]
