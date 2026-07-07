import * as migration_20260703_032255_initial from './20260703_032255_initial'
import * as migration_20260706_000000_restore_summer_posts from './20260706_000000_restore_summer_posts'
import * as migration_20260707_000000_cleanup_orphan_summer_media from './20260707_000000_cleanup_orphan_summer_media'

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
]
