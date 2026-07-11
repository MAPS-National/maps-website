import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Search index changes for #244/#245: the search plugin now syncs Pages as well
// as Posts (a `pages_id` leg on the polymorphic `search_rels` relationship) and
// stores extracted body plaintext in a new `search.content` column so queries
// match page/post copy, not just title + meta. DDL is hand-written to match what
// dev `push` generates (same approach as 20260707_020000_nav_global — the
// committed drizzle snapshot predates the nav overhaul, so `migrate:create`
// would emit that unrelated drift too). Naming mirrors the existing
// search_rels_posts_* fk/index conventions from the initial snapshot.
//
// No data backfill here on purpose: existing docs get their search entries
// refreshed via the search collection's admin "Reindex" button (plugin-search
// ships it), which re-syncs every published page/post through beforeSync
// without re-saving the source docs. Run it per environment after deploy —
// staging first, then prod (ADR 0002).
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "search" ADD COLUMN "content" varchar;
  ALTER TABLE "search_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "search_rels_pages_id_idx" ON "search_rels" USING btree ("pages_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_pages_fk";
  DROP INDEX "search_rels_pages_id_idx";
  ALTER TABLE "search_rels" DROP COLUMN "pages_id";
  ALTER TABLE "search" DROP COLUMN "content";
  `)
}
