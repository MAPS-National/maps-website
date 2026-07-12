import 'dotenv/config'

import config from '@payload-config'
import { getPayload } from 'payload'

/**
 * Rebuild the search index for every PUBLISHED page and post.
 *
 * A bulk DB restore (refresh:local) writes rows straight into Postgres, so the
 * search plugin's afterChange hook — which normally keeps the index current on
 * every save — never fires, and the restored index is prod's frozen copy. This
 * re-runs that hook for each live doc via a no-op re-publish, so search reflects
 * THIS code's indexing rules (page content, team names, etc).
 *
 * In-process on purpose: it runs this repo's code against the local DB, which is
 * exactly what `npm run dev` serves. Only point DATABASE_URL at another env if
 * that env runs this same code — otherwise use the deployed app's Reindex button
 * (or refresh:staging, which reindexes over HTTP). Touches no S3.
 *
 * ponytail: re-publish upserts each live doc's entry; it does not delete orphan
 * search rows (a full restore mirrors prod, so there are none). Use the admin
 * Reindex button for the delete-and-rebuild that also drops orphans.
 */
const COLLECTIONS = ['posts', 'pages'] as const

const payload = await getPayload({ config })
let ok = 0
let failed = 0
try {
  for (const collection of COLLECTIONS) {
    const { docs } = await payload.find({
      collection,
      where: { _status: { equals: 'published' } },
      depth: 0,
      pagination: false,
    })
    for (const doc of docs) {
      try {
        // Re-publish is a no-op on content (publishedAt only sets when empty) but
        // fires the plugin's afterChange → re-sync with the current beforeSync.
        await payload.update({
          collection,
          id: doc.id,
          data: { _status: 'published' },
          depth: 0,
          context: { disableRevalidate: true },
        })
        ok++
      } catch (err) {
        failed++
        console.warn(
          `reindex-search: ${collection}#${doc.id} failed — ${err instanceof Error ? err.message : String(err)}`,
        )
      }
    }
    console.log(`reindex-search: ${collection} — ${docs.length} published`)
  }
} finally {
  await payload.destroy()
}
console.log(`reindex-search: reindexed ${ok}${failed ? `, ${failed} failed` : ''}`)
process.exit(failed && !ok ? 1 : 0)
