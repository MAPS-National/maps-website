//
// Self-check for the refresh direction lock + PII scrub. Pure, no infra needed.
//   node scripts/refresh-lock.check.mjs   (or: npm run refresh:staging:check)
//
import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { assertRefreshDirection } from './refresh-lock.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))

const ok = {
  dstEnv: 'staging',
  prodDb: 'postgresql://u:p@prod-host.proxy.rlwy.net:1111/railway',
  stageDb: 'postgresql://u:p@stage-host.proxy.rlwy.net:2222/railway',
  prodBucket: 'prod-media',
  stageBucket: 'stage-media',
}
const throws = (patch, re) => assert.throws(() => assertRefreshDirection({ ...ok, ...patch }), re)

// A valid prod->staging pair passes.
assert.doesNotThrow(() => assertRefreshDirection(ok))

// Every way a write could reach prod is refused.
throws({ dstEnv: 'production' }, /not 'staging'/)
throws({ stageDb: '' }, /both DB URLs/)
throws({ stageDb: ok.prodDb }, /identical/)
throws({ stageBucket: ok.prodBucket }, /buckets identical/)
throws({ stageBucket: '' }, /buckets identical/)
// staging URL that resolves to the prod host is caught (same host:port, other db).
throws({ stageDb: 'postgresql://u:p@prod-host.proxy.rlwy.net:1111/other' }, /prod host/)

// The PII scrub must stay wired in the restore SQL.
const src = readFileSync(path.join(here, 'refresh-staging.mjs'), 'utf8')
assert.match(src, /TRUNCATE public\.form_submissions CASCADE/, 'form-submission PII scrub missing')

console.log('refresh-lock self-check: all assertions passed')
