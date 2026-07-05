#!/usr/bin/env node
//
// push-content.mjs — push the LOCAL bootstrap scratch (DB + media) UP to a
// Railway environment. The launch counterpart of refresh-staging.mjs.
//
// Why this exists: seeding a remote env from a laptop is unreliable (the tsx
// process races remote S3 uploads), so the reliable path is: build and verify
// a clean content set locally (migrate + imports + import:prose + import:slider
// + seed:pages into a scratch DB/bucket), then BULK-COPY it up. A full dump
// preserves document ids, so page -> media references survive.
//
// Direction: local -> {staging|prod} only. The source must be a localhost DB;
// the tool never reads from or writes to any env other than the one named.
// Pushing to prod always requires typing the confirmation phrase (--yes does
// not skip it).
//
// The scratch must be built from this branch's migrations (payload migrate,
// NOT dev push:true) so its schema matches what the target's preDeploy
// migrate produces.
//
// Usage:  npm run push:content -- --to staging          (prompts)
//         npm run push:content -- --to staging --yes    (no prompt)
//         npm run push:content -- --to prod             (always prompts)
//
// Source defaults (override via env):
//   SRC_DATABASE_URL  postgres://postgres:postgres@127.0.0.1:5432/payload_bootstrap
//   SRC_S3_BUCKET     bootstrap-media   (on the local MinIO from docker-compose)
//
import { execSync, spawnSync } from 'node:child_process'
import { createInterface } from 'node:readline'

const PROJECT_ID = 'aea720c6-7841-4e7a-955c-945a5ab210e7'
const YES = process.argv.includes('--yes') || process.argv.includes('-y')

const toArg = process.argv[process.argv.indexOf('--to') + 1]
const TARGETS = { staging: 'staging', prod: 'production' }

const die = (msg) => {
  console.error(`!! ${msg}`)
  process.exit(1)
}

if (!TARGETS[toArg]) die('pass --to staging or --to prod')
const DST_ENV = TARGETS[toArg]

const SRC_DB =
  process.env.SRC_DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:5432/payload_bootstrap'
const SRC_BUCKET = process.env.SRC_S3_BUCKET || 'bootstrap-media'
// Local MinIO as seen from inside a container (docker-compose defaults).
const SRC_ENDPOINT = 'http://host.docker.internal:9000'
const SRC_S3_KEY = 'minioadmin'
const SRC_S3_SECRET = 'minioadmin'

function railwayVars(service, env) {
  let out
  try {
    out = execSync(
      `railway variables --project ${PROJECT_ID} --service ${service} --environment ${env} --kv`,
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    )
  } catch {
    die(
      "can't read from Railway. Run 'railway login' (once), confirm 'railway whoami', then retry.",
    )
  }
  const map = {}
  for (const line of out.split(/\r?\n/)) {
    const i = line.indexOf('=')
    if (i > 0) map[line.slice(0, i)] = line.slice(i + 1).replace(/^"|"$/g, '')
  }
  return map
}

function docker(args, { env = {}, quiet = false } = {}) {
  const res = spawnSync('docker', args, {
    stdio: quiet ? ['ignore', 'ignore', 'inherit'] : 'inherit',
    env: { ...process.env, ...env },
  })
  if (res.error) die(`could not run docker (${res.error.message}). Is Docker Desktop running?`)
  if (res.status !== 0) die(`docker step failed: docker ${args.join(' ')}`)
}

const host = (url) => (url.match(/@([^/?]+)/) || [, '?'])[1]
const withssl = (url) => (url.includes('?') ? `${url}&sslmode=require` : `${url}?sslmode=require`)
// The dump container reaches the host's Postgres via host.docker.internal.
const fromContainer = (url) =>
  url.replace(/@(127\.0\.0\.1|localhost)(?=[:/])/, '@host.docker.internal')

// --- prereqs -----------------------------------------------------------------
try {
  execSync('docker version', { stdio: 'ignore' })
} catch {
  die('docker is not available. Start Docker Desktop and retry.')
}

// --- resolve target from Railway ----------------------------------------------
console.log(`>> resolving ${DST_ENV} connection details from Railway...`)
const web = railwayVars('web', DST_ENV)
const pg = railwayVars('Postgres', DST_ENV)
const DST_DB = pg.DATABASE_PUBLIC_URL
const DST_BUCKET = web.S3_BUCKET

// --- locks (must pass before ANY write) ----------------------------------------
if (!/@(127\.0\.0\.1|localhost)[:/]/.test(SRC_DB)) die('LOCK: source DB is not localhost.')
if (!DST_DB || !DST_BUCKET) die('LOCK: could not resolve target DB URL and bucket.')
if (host(DST_DB).includes('127.0.0.1') || host(DST_DB).includes('localhost'))
  die('LOCK: target DB resolves to localhost.')
if (DST_BUCKET === SRC_BUCKET) die('LOCK: source and target buckets are identical.')

console.log(`   source (local): db ${host(SRC_DB)}  bucket ${SRC_BUCKET}`)
console.log(`   target (${toArg}): db ${host(DST_DB)}  bucket ${DST_BUCKET}`)

// --- confirm (destructive to the target) ---------------------------------------
const phrase = `push to ${toArg}`
if (toArg === 'prod' || !YES) {
  console.log(`\nThis REPLACES all ${toArg} content (DB + media) with the local scratch.`)
  if (toArg === 'prod') console.log('Target is PRODUCTION. --yes does not skip this prompt.')
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const ans = await new Promise((r) => rl.question(`Type '${phrase}' to continue: `, r))
  rl.close()
  if (ans.trim() !== phrase) die('aborted.')
}

// --- 1. media: local MinIO -> target bucket ------------------------------------
// Different creds/endpoints per side, so hop through a throwaway named volume.
console.log(`>> syncing media bucket (${SRC_BUCKET} -> ${DST_BUCKET})...`)
const vol = `push-content-media-${process.pid}`
docker(['volume', 'create', vol], { quiet: true })
try {
  docker(
    [
      'run',
      '--rm',
      '-e',
      'AWS_ACCESS_KEY_ID',
      '-e',
      'AWS_SECRET_ACCESS_KEY',
      '-v',
      `${vol}:/data`,
      'amazon/aws-cli',
      '--endpoint-url',
      SRC_ENDPOINT,
      '--region',
      'us-east-1',
      's3',
      'sync',
      `s3://${SRC_BUCKET}`,
      '/data',
      '--delete',
      '--only-show-errors',
    ],
    { env: { AWS_ACCESS_KEY_ID: SRC_S3_KEY, AWS_SECRET_ACCESS_KEY: SRC_S3_SECRET } },
  )
  docker(
    [
      'run',
      '--rm',
      '-e',
      'AWS_ACCESS_KEY_ID',
      '-e',
      'AWS_SECRET_ACCESS_KEY',
      '-v',
      `${vol}:/data`,
      'amazon/aws-cli',
      '--endpoint-url',
      web.S3_ENDPOINT,
      '--region',
      web.S3_REGION,
      's3',
      'sync',
      '/data',
      `s3://${DST_BUCKET}`,
      '--delete',
      '--only-show-errors',
    ],
    {
      env: {
        AWS_ACCESS_KEY_ID: web.S3_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: web.S3_SECRET_ACCESS_KEY,
      },
    },
  )
} finally {
  docker(['volume', 'rm', vol], { quiet: true })
}

// --- 2. database: local scratch -> target ---------------------------------------
console.log(`>> resetting ${toArg} schema and restoring local dump...`)
const sql =
  'set -e; ' +
  'psql "$DST" -v ON_ERROR_STOP=1 -q -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"; ' +
  'pg_dump --no-owner --no-privileges "$SRC" | psql "$DST" -v ON_ERROR_STOP=1 -q; ' +
  'psql "$DST" -Atc "select \'pages=\'||count(*) from pages" ; ' +
  'psql "$DST" -Atc "select \'posts=\'||count(*) from posts" ; ' +
  'psql "$DST" -Atc "select \'media=\'||count(*) from media"'
docker(['run', '--rm', '-e', 'SRC', '-e', 'DST', 'postgres:18', 'sh', '-lc', sql], {
  env: { SRC: fromContainer(SRC_DB), DST: withssl(DST_DB) },
})

console.log(`\nOK. ${toArg} now serves the local scratch content.`)
console.log('   The scratch has no users, so /admin shows the create-first-user screen.')
console.log('   Create the admin account there before editing content.')
