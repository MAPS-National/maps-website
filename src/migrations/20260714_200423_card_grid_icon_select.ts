import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // `lucide_icon` was a free-text field, so editors could type any name while the
  // renderer only drew a curated set — an unknown name rendered a silently empty chip.
  // Prod carries two classes of such value, and the `USING ...::enum` cast below THROWS
  // on either, which would fail the migration and block the deploy:
  //
  //   1. `star-plus` (home, "Membership Benefits") — not a Lucide icon in ANY version we
  //      ship: 0.563 has star / star-half / star-off / stars. The card was meant to carry
  //      an icon, so map it to the nearest real one instead of dropping it.
  //   2. Anything else outside the set — null it. Nothing is lost visually: those names
  //      render nothing today either.
  //
  // Values verified against the live prod API before writing this: every other name in
  // use (badge-dollar-sign, briefcase, circle-plus, file-text, folder-open, landmark,
  // megaphone, mic, network, scale, users, video) is in the enum and casts cleanly.
  await db.execute(sql`
   UPDATE "pages_blocks_card_grid_items" SET "lucide_icon" = 'star' WHERE "lucide_icon" = 'star-plus';
  UPDATE "_pages_v_blocks_card_grid_items" SET "lucide_icon" = 'star' WHERE "lucide_icon" = 'star-plus';

  UPDATE "pages_blocks_card_grid_items" SET "lucide_icon" = NULL
    WHERE "lucide_icon" IS NOT NULL
      AND "lucide_icon" NOT IN ('badge-dollar-sign', 'badge-plus', 'briefcase', 'circle-plus', 'file-text', 'folder-open', 'landmark', 'megaphone', 'mic', 'network', 'scale', 'star', 'users', 'video');
  UPDATE "_pages_v_blocks_card_grid_items" SET "lucide_icon" = NULL
    WHERE "lucide_icon" IS NOT NULL
      AND "lucide_icon" NOT IN ('badge-dollar-sign', 'badge-plus', 'briefcase', 'circle-plus', 'file-text', 'folder-open', 'landmark', 'megaphone', 'mic', 'network', 'scale', 'star', 'users', 'video');`)

  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_card_grid_items_lucide_icon" AS ENUM('badge-dollar-sign', 'badge-plus', 'briefcase', 'circle-plus', 'file-text', 'folder-open', 'landmark', 'megaphone', 'mic', 'network', 'scale', 'star', 'users', 'video');
  CREATE TYPE "public"."enum__pages_v_blocks_card_grid_items_lucide_icon" AS ENUM('badge-dollar-sign', 'badge-plus', 'briefcase', 'circle-plus', 'file-text', 'folder-open', 'landmark', 'megaphone', 'mic', 'network', 'scale', 'star', 'users', 'video');
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
