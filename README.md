# MAPS National website

The public site at [mapsnational.org](https://mapsnational.org) and its CMS. One
Next.js app serves both the website and the [Payload](https://payloadcms.com)
admin (`/admin`) and API, backed by Postgres and S3-compatible media storage.
Built on the [Payload Website Template](https://github.com/payloadcms/payload/tree/3.x/templates/website).

## Prerequisites

- **Node 22** (`.nvmrc`). The dev server runs on 24, but the Payload migrate
  CLI and the e2e setup crash on it.
- **npm**, not pnpm, despite what `engines` says.
- **PostgreSQL**, a local instance.
- **Docker Desktop** for MinIO (local media storage). `npm run dev` starts it
  for you.
- Port **3000** free. CORS and `NEXT_PUBLIC_SERVER_URL` assume it.

The repo assumes a Windows dev machine (the `predev` hook is PowerShell); Git
Bash works for POSIX commands.

## Quick start

```bash
cp .env.example .env   # set DATABASE_URL, PAYLOAD_SECRET, and uncomment the MinIO S3_* block
npm install
npm run dev            # http://localhost:3000
```

Open `/admin` and create the first user. (Or script it from Git Bash:
`ADMIN_EMAIL=you@example.org ADMIN_PASSWORD=... npm run ensure:admin`.)

The dev DB starts empty and the schema auto-syncs. To get real content, either
pull a prod snapshot with `npm run refresh:local` (needs Railway access) or
seed with `npm run seed:pages` and `npm run seed:header`. See
[`docs/scripts.md`](docs/scripts.md) for the full seed order and which scripts
are destructive.

## Everyday commands

| Command                                    | What                                                                                   |
| ------------------------------------------ | -------------------------------------------------------------------------------------- |
| `npm run dev`                              | Dev server on :3000                                                                    |
| `npm run lint` / `npm run typecheck`       | ESLint / tsc                                                                           |
| `npm run test:int`                         | Vitest integration tests                                                               |
| `npm run test:e2e`                         | Playwright (reuses a running dev server; seed first, run under Node 22)                |
| `npm run generate:types`                   | Regenerate `src/payload-types.ts` after any collection, field, block, or global change |
| `npm run payload -- migrate:create <name>` | Create a migration (required for any schema change)                                    |

Git hooks: `pre-commit` runs lint-staged and typecheck; `pre-push` runs lint,
typecheck, and `test:int`.

## Contributing

1. Branch off `staging` and open your PR **against `staging`, never `master`**.
   `master` is production; it only receives `staging` promotions. CI fails any
   other PR into `master`.
2. Schema changes must ship a committed migration. Dev auto-syncs and hides
   drift; the CI "migration guard" job catches it.
3. Green CI is the merge gate. PRs land as merge commits (squash and rebase are
   off).

Merging to `staging` deploys [stage.mapsnational.org](https://stage.mapsnational.org)
(Basic-auth gated); promoting `staging` to `master` deploys production. Both run
on Railway. Content flows prod to staging only, never back.

## Docs

| Doc                                                        | Read it for                                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [`docs/handoff.md`](docs/handoff.md)                       | Orientation: how the site works, deploys, and what will bite you                           |
| [`CLAUDE.md`](CLAUDE.md)                                   | The most detailed reference: architecture, blocks, theming, CI, deploy, every known gotcha |
| [`docs/scripts.md`](docs/scripts.md)                       | Every script: what it does, run order, idempotent vs destructive                           |
| [`docs/adr/`](docs/adr/)                                   | Why the big decisions were made (staging model, promotion rails, blocks)                   |
| [`docs/restore-drill.md`](docs/restore-drill.md)           | Restoring prod from backup                                                                 |
| [`docs/new-site-checklist.md`](docs/new-site-checklist.md) | Spinning a new org's site off this repo                                                    |
| [`docs/migration/`](docs/migration/)                       | Webflow migration record and the block catalog                                             |

Internal reference pages (noindexed): `/design-system` for tokens and themes,
`/design-system/blocks` for every block with sample data.

For how the underlying template features work (draft and live preview, access
control, revalidation, scheduled publish), see the
[upstream template README](https://github.com/payloadcms/payload/blob/3.x/templates/website/README.md).
