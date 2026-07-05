#!/usr/bin/env bash
#
# refresh-staging.sh — copy a point-in-time snapshot of PROD down to STAGING.
#
# Content flows ONE WAY: prod -> staging (ADR 0002). This script replaces
# staging's database and media bucket with a copy of prod's. It never writes to
# prod (dump + bucket-read only), and a direction lock refuses to run if the
# target ever resolves to prod.
#
# What moves, and why together:
#   1. Postgres  — pg_dump prod, restore into staging. A FULL dump preserves
#      document ids, so page blocks that reference media by id still resolve
#      after the copy. (Re-seeding instead would mint new ids and break links.)
#   2. Media bucket — mirror prod's objects into staging's bucket, so the media
#      rows restored in step 1 point at files that actually exist.
#
# Everything (URLs, creds, bucket names) is pulled live from Railway by
# environment NAME, so there is no hand-typed connection string to fat-finger.
# No local Postgres or aws-cli needed: both run in throwaway Docker containers
# (postgres:18 matches the server major; amazon/aws-cli for S3).
#
# Usage:  npm run refresh:staging            (prompts to confirm)
#         npm run refresh:staging -- --yes   (no prompt, for scripting)
#
set -euo pipefail

SRC_ENV=production
DST_ENV=staging

# --- prereqs -----------------------------------------------------------------
for bin in railway docker; do
  command -v "$bin" >/dev/null || { echo "!! missing required tool: $bin"; exit 1; }
done
# Probe with explicit flags (works without a TTY, unlike `railway status`).
railway variables --service web --environment "$SRC_ENV" --kv >/dev/null 2>&1 || {
  echo "!! can't read from Railway. From this repo run: railway login, then railway link (pick maps-website)."
  exit 1
}

# rv KEY SERVICE ENV  ->  prints the value of one Railway variable.
# Uses --kv (KEY=value lines) + shell text tools, so there's no python/jq dep.
rv() {
  railway variables --service "$2" --environment "$3" --kv 2>/dev/null \
    | grep -E "^$1=" | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//'
}

# append sslmode=require — encrypt but skip cert verification (Railway's public
# proxy cert isn't chained to a CA libpq trusts; verify-full would need the CA).
withssl() { case "$1" in *\?*) echo "$1&sslmode=require";; *) echo "$1?sslmode=require";; esac; }

echo ">> resolving connection details from Railway..."
PROD_DB=$(rv DATABASE_PUBLIC_URL Postgres "$SRC_ENV")
STAGE_DB=$(rv DATABASE_PUBLIC_URL Postgres "$DST_ENV")
PROD_AK=$(rv S3_ACCESS_KEY_ID web "$SRC_ENV");   PROD_SK=$(rv S3_SECRET_ACCESS_KEY web "$SRC_ENV")
STAGE_AK=$(rv S3_ACCESS_KEY_ID web "$DST_ENV");  STAGE_SK=$(rv S3_SECRET_ACCESS_KEY web "$DST_ENV")
PROD_BUCKET=$(rv S3_BUCKET web "$SRC_ENV");      STAGE_BUCKET=$(rv S3_BUCKET web "$DST_ENV")
ENDPOINT=$(rv S3_ENDPOINT web "$SRC_ENV");       REGION=$(rv S3_REGION web "$SRC_ENV")

# --- direction lock (must pass before ANY write) -----------------------------
[ "$DST_ENV" = "staging" ]        || { echo "LOCK: target env is not 'staging'."; exit 1; }
[ -n "$PROD_DB" ] && [ -n "$STAGE_DB" ] || { echo "LOCK: could not resolve both DB URLs."; exit 1; }
[ "$PROD_DB" != "$STAGE_DB" ]     || { echo "LOCK: prod and staging DB URLs are identical."; exit 1; }
[ -n "$STAGE_BUCKET" ] && [ "$PROD_BUCKET" != "$STAGE_BUCKET" ] || { echo "LOCK: buckets identical/empty."; exit 1; }
PROD_HOST=$(echo "$PROD_DB" | sed -E 's#.*@([^/?]+).*#\1#')
case "$STAGE_DB" in *"$PROD_HOST"*) echo "LOCK: staging DB URL points at the prod host."; exit 1;; esac

echo "   source (prod):    db $PROD_HOST  bucket $PROD_BUCKET"
echo "   target (staging): db $(echo "$STAGE_DB" | sed -E 's#.*@([^/?]+).*#\1#')  bucket $STAGE_BUCKET"

# --- confirm (destructive to staging) ----------------------------------------
if [ "${1:-}" != "--yes" ] && [ "${1:-}" != "-y" ]; then
  echo
  echo "This REPLACES all staging content (DB + media) with a prod snapshot."
  read -r -p "Type 'refresh staging' to continue: " ans
  [ "$ans" = "refresh staging" ] || { echo "aborted."; exit 1; }
fi

# --- 1. media: prod bucket -> staging bucket ---------------------------------
# Different creds per bucket, so hop through a throwaway Docker volume (named,
# not a host bind mount, so it works the same on Windows). --delete mirrors
# exactly. ponytail: two hops move the bytes twice; if the bucket ever gets big,
# swap this for `rclone copy prod:bucket staging:bucket` (one server-side pass).
echo ">> syncing media bucket ($PROD_BUCKET -> $STAGE_BUCKET)..."
VOL="refresh-staging-media-$$"
docker volume create "$VOL" >/dev/null
docker run --rm -e AWS_ACCESS_KEY_ID="$PROD_AK" -e AWS_SECRET_ACCESS_KEY="$PROD_SK" -v "$VOL":/data \
  amazon/aws-cli --endpoint-url "$ENDPOINT" --region "$REGION" s3 sync "s3://$PROD_BUCKET" /data --delete --only-show-errors
docker run --rm -e AWS_ACCESS_KEY_ID="$STAGE_AK" -e AWS_SECRET_ACCESS_KEY="$STAGE_SK" -v "$VOL":/data \
  amazon/aws-cli --endpoint-url "$ENDPOINT" --region "$REGION" s3 sync /data "s3://$STAGE_BUCKET" --delete --only-show-errors
docker volume rm "$VOL" >/dev/null

# --- 2. database: prod -> staging --------------------------------------------
# Reset staging's schema to a clean slate, then load prod. Runs entirely inside
# one postgres:18 container (no mounts), so URLs stay in env, never in argv.
echo ">> resetting staging schema and restoring prod dump..."
docker run --rm -e SRC="$(withssl "$PROD_DB")" -e DST="$(withssl "$STAGE_DB")" postgres:18 sh -lc '
  set -e
  psql "$DST" -v ON_ERROR_STOP=1 -q -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
  pg_dump --no-owner --no-privileges "$SRC" | psql "$DST" -v ON_ERROR_STOP=1 -q
'

echo
echo "OK. Staging now mirrors prod as of now."
echo "   Log into staging admin with your PROD credentials (users came over in the dump;"
echo "   password hashes are salt-based, independent of PAYLOAD_SECRET). Sessions stay"
echo "   isolated because staging signs JWTs with its own secret."
