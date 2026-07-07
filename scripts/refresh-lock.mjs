//
// refresh-lock.mjs — the direction lock for prod -> staging refreshes.
//
// Pure (no side effects, no I/O), so it can be exercised by a self-check
// without touching Railway or Docker. refresh-staging.mjs imports this and
// runs it before ANY write; if it throws, that run aborts.
//
const host = (url) => (String(url).match(/@([^/?]+)/) || [, '?'])[1]

/**
 * Throw if the resolved source/target pair could let a write reach prod.
 * @param {{ dstEnv: string, prodDb: string, stageDb: string, prodBucket: string, stageBucket: string }} r
 */
export function assertRefreshDirection(r) {
  if (r.dstEnv !== 'staging') throw new Error("LOCK: target env is not 'staging'.")
  if (!r.prodDb || !r.stageDb) throw new Error('LOCK: could not resolve both DB URLs.')
  if (r.prodDb === r.stageDb) throw new Error('LOCK: prod and staging DB URLs are identical.')
  if (!r.stageBucket || r.prodBucket === r.stageBucket)
    throw new Error('LOCK: buckets identical or empty.')
  if (host(r.stageDb).includes(host(r.prodDb)))
    throw new Error('LOCK: staging DB URL points at the prod host.')
}
