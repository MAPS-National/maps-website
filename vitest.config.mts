import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.ts'],
    // Booting Payload in beforeAll (getPayload + drizzle schema pull) can exceed
    // vitest's default 10s hook timeout on a cold CI runner. Give init headroom.
    hookTimeout: 60000,
    testTimeout: 30000,
  },
})
