import * as migration_20260703_032255_initial from './20260703_032255_initial'

export const migrations = [
  {
    up: migration_20260703_032255_initial.up,
    down: migration_20260703_032255_initial.down,
    name: '20260703_032255_initial',
  },
]
