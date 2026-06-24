/**
 * Re-host an explicit list of export images as Media docs (issue #66, Phase 6).
 *
 * Some assembled pages (e.g. members/new-york-state) reference content images
 * that live only in the gitignored full Webflow export and were never picked up
 * by the prose import. This copies each into the tracked dir and upserts a Media
 * doc (idempotent by filename) so the page slices can resolve them by filename.
 *
 *   npm run rehost:images
 *
 * Add files by appending to IMAGES below. Raster only — SVG logos/icons are
 * intentionally not Media (chrome, not content); skipped.
 */

import 'dotenv/config'

import { copyFile, mkdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

const ROOT = process.cwd()
const EXPORT_IMAGES = path.join(ROOT, 'migration/mapsnational.webflow/images')
const TRACKED_IMG = path.join(ROOT, 'public/import/prose')

const MIME: Record<string, string> = {
  webp: 'image/webp',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
}

// { file: basename in the export images dir, alt: required Media alt text }
const IMAGES: Array<{ file: string; alt: string }> = [
  // members/new-york-state — feature sections + lightbox gallery
  { file: '6.webp', alt: 'Explore NYC government jobs' },
  { file: '34.webp', alt: 'Apply for MAPS endorsement to vacant NYC government jobs' },
  { file: '43.webp', alt: 'Apply for MAPS endorsement to NYC board and commission roles' },
  { file: '21.webp', alt: 'Professional networking and community building with MAPS New York' },
  { file: '22.webp', alt: 'MAPS New York community' },
  { file: '11.webp', alt: 'MAPS New York event' },
  { file: '1.webp', alt: 'MAPS New York members' },
  { file: '4_3.webp', alt: 'MAPS New York gathering' },
  { file: '8.webp', alt: 'MAPS New York networking' },
  { file: '26.webp', alt: 'MAPS New York community event' },
  { file: '16.webp', alt: 'MAPS New York in the community' },
  // home — HighImpact hero background (#91)
  { file: '10-23-0814-1600.webp', alt: 'Muslim American public servants at a MAPS National gathering' },
  // partner logos present in the export under their friendly names (about-us/partners,
  // #85). The other ~29 partner logos are not in the export under usable names and
  // need their real source files before LogoStrip is complete.
  { file: 'aafen.webp', alt: 'AAFEN' },
  { file: 'minaret.webp', alt: 'Minaret Foundation' },
  { file: 'uscmo.webp', alt: 'US Council of Muslim Organizations (USCMO)' },
]

const run = async () => {
  const payload = await getPayload({ config: configPromise })
  await mkdir(TRACKED_IMG, { recursive: true })

  let created = 0
  let skipped = 0
  for (const { file, alt } of IMAGES) {
    const ext = file.split('.').pop()?.toLowerCase() || ''
    if (!MIME[ext]) {
      payload.logger.warn(`rehost: skipping non-raster ${file}`)
      continue
    }
    const source = path.join(EXPORT_IMAGES, file)
    if (!existsSync(source)) {
      payload.logger.warn(`rehost: source missing ${source}`)
      continue
    }
    const tracked = path.join(TRACKED_IMG, file)
    if (!existsSync(tracked)) await copyFile(source, tracked)

    const found = await payload.find({
      collection: 'media',
      where: { filename: { equals: file } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (found.docs[0]) {
      skipped++
      continue
    }

    const buffer = await readFile(tracked)
    await payload.create({
      collection: 'media',
      data: { alt },
      file: { name: file, data: buffer, mimetype: MIME[ext], size: buffer.length },
      overrideAccess: true,
    })
    created++
    payload.logger.info(`rehost: created Media ${file}`)
  }

  payload.logger.info(`Re-host complete: ${created} created, ${skipped} already present.`)
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
