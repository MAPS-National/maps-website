/**
 * Gallery example convention.
 *
 * Each layout block colocates a `gallery.ts` in its block directory exporting a
 * `GalleryBlock` — the block's title, a one-line description, and an ordered list
 * of `GalleryVariant`s. A variant is a labeled set of props, shaped like the
 * block's generated props (see `src/payload-types.ts`), that the gallery spreads
 * into the real block component. Sample data lives next to the block it documents.
 *
 * The aggregator `src/blocks/gallery.ts` collects every block's `GalleryBlock`
 * into `galleryBlocks`, which the `/design-system/blocks` route renders.
 *
 * Type-only here: this module stays free of component/config imports so the
 * per-block data files can import it without pulling in the render or config graph.
 */

/** One labeled rendering of a block — props spread into the block component. */
export type GalleryVariant<P = Record<string, unknown>> = {
  /** Short label shown above the example, e.g. "Three columns, no media". */
  name: string
  /** Optional note on what this variant demonstrates. */
  description?: string
  /** Props passed to the block component, shaped like the block's payload-types props. */
  props: P
}

/** One block's gallery entry. Colocated as `BlockDir/gallery.ts`, one per block. */
export type GalleryBlock<P = Record<string, unknown>> = {
  /** Config slug — must match `config.slug` and the `blockComponents` key. */
  slug: string
  /** Heading shown for the block's section, e.g. "Card Grid". */
  title: string
  /** One-line description of the block's purpose. */
  description?: string
  /** Ordered variants to render. */
  variants: GalleryVariant<P>[]
}

/**
 * One hero's gallery entry. Heros are not layout blocks — they live in the
 * `hero` group field and render through `RenderHero` keyed on `type`, so they
 * get their own section in the gallery. Colocated in `src/heros/gallery.ts`.
 */
export type GalleryHero<P = Record<string, unknown>> = {
  /** Hero `type` value (e.g. "highImpact") passed to `RenderHero`. */
  type: string
  /** Heading shown for the hero, e.g. "High Impact". */
  title: string
  /** One-line description of when to use this hero. */
  description?: string
  /** Ordered variants to render. */
  variants: GalleryVariant<P>[]
}
