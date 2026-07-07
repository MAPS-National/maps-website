import * as migration_20260703_032255_initial from './20260703_032255_initial'
import * as migration_20260706_000000_restore_summer_posts from './20260706_000000_restore_summer_posts'

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
]
