import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // The `lucide_icon` column was free text, so it can hold a name the renderer never
  // knew (that was the bug: the card silently showed no icon). The generated
  // `USING ...::enum` cast below THROWS on any such row, which would fail the migration
  // and block the deploy — so null those rows out first. Nothing is lost visually: a
  // name outside the curated set renders nothing today either.
  await db.execute(sql`
   UPDATE "pages_blocks_card_grid_items" SET "lucide_icon" = NULL
    WHERE "lucide_icon" IS NOT NULL
      AND "lucide_icon" NOT IN ('briefcase', 'circle-plus', 'file-text', 'folder-open', 'landmark', 'megaphone', 'mic', 'network', 'scale', 'users', 'video');
  UPDATE "_pages_v_blocks_card_grid_items" SET "lucide_icon" = NULL
    WHERE "lucide_icon" IS NOT NULL
      AND "lucide_icon" NOT IN ('briefcase', 'circle-plus', 'file-text', 'folder-open', 'landmark', 'megaphone', 'mic', 'network', 'scale', 'users', 'video');`)

  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_card_grid_items_lucide_icon" AS ENUM('briefcase', 'circle-plus', 'file-text', 'folder-open', 'landmark', 'megaphone', 'mic', 'network', 'scale', 'users', 'video');
  CREATE TYPE "public"."enum__pages_v_blocks_card_grid_items_lucide_icon" AS ENUM('briefcase', 'circle-plus', 'file-text', 'folder-open', 'landmark', 'megaphone', 'mic', 'network', 'scale', 'users', 'video');
  ALTER TABLE "pages_blocks_card_grid_items" ALTER COLUMN "lucide_icon" SET DATA TYPE "public"."enum_pages_blocks_card_grid_items_lucide_icon" USING "lucide_icon"::"public"."enum_pages_blocks_card_grid_items_lucide_icon";
  ALTER TABLE "_pages_v_blocks_card_grid_items" ALTER COLUMN "lucide_icon" SET DATA TYPE "public"."enum__pages_v_blocks_card_grid_items_lucide_icon" USING "lucide_icon"::"public"."enum__pages_v_blocks_card_grid_items_lucide_icon";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_card_grid_items" ALTER COLUMN "lucide_icon" SET DATA TYPE varchar;
  ALTER TABLE "_pages_v_blocks_card_grid_items" ALTER COLUMN "lucide_icon" SET DATA TYPE varchar;
  DROP TYPE "public"."enum_pages_blocks_card_grid_items_lucide_icon";
  DROP TYPE "public"."enum__pages_v_blocks_card_grid_items_lucide_icon";`)
}
