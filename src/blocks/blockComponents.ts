import type React from 'react'

import { Archive } from './ArchiveBlock/config'
import { ArchiveBlock } from './ArchiveBlock/Component'
import { CallToAction } from './CallToAction/config'
import { CallToActionBlock } from './CallToAction/Component'
import { CardGrid } from './CardGrid/config'
import { CardGridBlock } from './CardGrid/Component'
import { Content } from './Content/config'
import { ContentBlock } from './Content/Component'
import { FormBlock as FormConfig } from './Form/config'
import { FormBlock } from './Form/Component'
import { LogoStrip } from './LogoStrip/config'
import { LogoStripBlock } from './LogoStrip/Component'
import { MediaBlock as MediaConfig } from './MediaBlock/config'
import { MediaBlock } from './MediaBlock/Component'

// Layout-block components have heterogeneous props; RenderBlocks spreads the
// matching block data into each, so a loose component type is intentional.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BlockComponent = React.FC<any>

/**
 * Block slug → renderer component, consumed by RenderBlocks. Register a block's
 * component here and its field config in `index.ts`. Keyed off each config's
 * `slug` so the slug string lives in exactly one place (the config).
 *
 * This module is render-side only (it imports React components) — never import
 * it into the Payload config graph. See `index.ts` for why.
 */
export const blockComponents: Record<string, BlockComponent> = {
  [CallToAction.slug]: CallToActionBlock,
  [Content.slug]: ContentBlock,
  [MediaConfig.slug]: MediaBlock,
  [Archive.slug]: ArchiveBlock,
  [FormConfig.slug]: FormBlock,
  [CardGrid.slug]: CardGridBlock,
  [LogoStrip.slug]: LogoStripBlock,
}
