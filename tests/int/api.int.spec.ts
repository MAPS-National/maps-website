import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import type { Post } from '@/payload-types'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })

  // Guards the ArchiveBlock listing sort: a pinned (sticky) post must sort above
  // a newer non-sticky one. If the sort ever regresses to '-publishedAt' alone,
  // the sticky post drops below the fresher one and this fails.
  it('pins sticky posts above newer non-sticky posts', async () => {
    const context = { disableRevalidate: true } // revalidatePath throws outside a request
    const body = (text: string): Post['content'] => ({
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              { type: 'text', text, version: 1, detail: 0, format: 0, mode: 'normal', style: '' },
            ],
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
      },
    })

    // `as never` on data: Payload's create overload for a drafts-enabled
    // collection otherwise demands `draft: true`; the restore migration casts
    // the same way. content is still shape-checked via the typed body() helper.
    const stickyOld = await payload.create({
      collection: 'posts',
      overrideAccess: true,
      context,
      data: {
        title: 'sticky sort test pinned',
        _status: 'published',
        publishedAt: '2020-01-01T00:00:00.000Z',
        sticky: true,
        content: body('pinned'),
      } as never,
    })
    const freshNew = await payload.create({
      collection: 'posts',
      overrideAccess: true,
      context,
      data: {
        title: 'sticky sort test fresh',
        _status: 'published',
        publishedAt: '2025-01-01T00:00:00.000Z',
        sticky: false,
        content: body('fresh'),
      } as never,
    })

    try {
      const { docs } = await payload.find({
        collection: 'posts',
        overrideAccess: true,
        depth: 0,
        limit: 10,
        sort: ['-sticky', '-publishedAt'],
        where: { id: { in: [stickyOld.id, freshNew.id] } },
      })
      // Pinned (older) beats fresh (newer) despite the recency tiebreak.
      expect(docs.map((d) => d.id)).toEqual([stickyOld.id, freshNew.id])
    } finally {
      await payload.delete({ collection: 'posts', id: stickyOld.id, overrideAccess: true, context })
      await payload.delete({ collection: 'posts', id: freshNew.id, overrideAccess: true, context })
    }
  })
})
