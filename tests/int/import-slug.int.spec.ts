import { describe, expect, it } from 'vitest'

import { transforms } from '@/import/transforms'

// #163: a malformed CSV slug (double hyphen, trailing hyphen) was passed through
// raw and failed Payload's slug validation, dropping the row on import. The slug
// transform now sanitizes the slug column, and must stay idempotent on valid
// slugs so the other imported posts keep byte-identical (identity-preserved) URLs.
describe('slug transform', () => {
  const ctx = { row: {} } as never
  const slug = (raw: string) => transforms.slug({})(raw, ctx)

  it('leaves an already-valid slug unchanged', () => {
    expect(slug('maps-national-dc-iftar-2026')).toBe('maps-national-dc-iftar-2026')
  })

  it('collapses double hyphens and trims casing/edges', () => {
    expect(slug('MAPS--National-')).toBe('maps-national')
  })

  it('slugifies a fallback column when the slug column is empty', () => {
    expect(transforms.slug({ from: 'title' })('', { row: { title: 'Hello World' } } as never)).toBe(
      'hello-world',
    )
  })
})
