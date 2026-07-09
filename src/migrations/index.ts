import * as migration_20260703_032255_initial from './20260703_032255_initial'
import * as migration_20260706_000000_restore_summer_posts from './20260706_000000_restore_summer_posts'
import * as migration_20260707_000000_cleanup_orphan_summer_media from './20260707_000000_cleanup_orphan_summer_media'
import * as migration_20260707_010000_cleanup_orphan_summer_media_retry from './20260707_010000_cleanup_orphan_summer_media_retry'
import * as migration_20260707_020000_nav_global from './20260707_020000_nav_global'
import * as migration_20260708_000000_drop_posts_legacy_fields from './20260708_000000_drop_posts_legacy_fields'

export const migrations = [
  {
    up: migration_20260703_032255_initial.up,
    down: migration_20260703_032255_initial.down,
    name: '20260703_032255_initial',
  },
  {
    up: migration_20260706_000000_restore_summer_posts.up,
    down: migration_20260706_000000_restore_summer_posts.down,
    name: '20260706_000000_restore_summer_posts',
  },
  {
    up: migration_20260707_000000_cleanup_orphan_summer_media.up,
    down: migration_20260707_000000_cleanup_orphan_summer_media.down,
    name: '20260707_000000_cleanup_orphan_summer_media',
  },
  {
    up: migration_20260707_010000_cleanup_orphan_summer_media_retry.up,
    down: migration_20260707_010000_cleanup_orphan_summer_media_retry.down,
    name: '20260707_010000_cleanup_orphan_summer_media_retry',
  },
  {
    up: migration_20260707_020000_nav_global.up,
    down: migration_20260707_020000_nav_global.down,
    name: '20260707_020000_nav_global',
  },
  {
    up: migration_20260708_000000_drop_posts_legacy_fields.up,
    down: migration_20260708_000000_drop_posts_legacy_fields.down,
    name: '20260708_000000_drop_posts_legacy_fields',
  },
]
