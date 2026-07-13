import type { SerializedLinkNode } from '@payloadcms/richtext-lexical'
import { describe, expect, it } from 'vitest'

import { resolveMemberHref } from '@/components/RichText/memberLinks'

// resolveMemberHref decides which body-prose links get the member gate. The bug
// #257 missed: an internal doc link to a /members page (how the real 5th-annual
// post links the Member Portal) was never gated, so it rendered bare and
// Outseta's global a[href^="/members"] hide rule stripped it for everyone. These
// assert both the custom and the internal path. (#250)
const custom = (url: string, newTab = false): SerializedLinkNode =>
  ({ type: 'link', fields: { linkType: 'custom', url, newTab }, children: [] }) as never

const internal = (relationTo: 'pages' | 'posts', slug: string): SerializedLinkNode =>
  ({
    type: 'link',
    fields: { linkType: 'internal', doc: { relationTo, value: { slug } } },
    children: [],
  }) as never

describe('resolveMemberHref', () => {
  it('gates a custom /members link', () => {
    expect(resolveMemberHref(custom('/members/portal'))).toBe('/members/portal')
  })

  it('gates a custom Luma link', () => {
    expect(resolveMemberHref(custom('https://luma.com/maps-kr0k'))).toBe(
      'https://luma.com/maps-kr0k',
    )
  })

  it('gates an INTERNAL doc link to a /members page (the #257 miss)', () => {
    expect(resolveMemberHref(internal('pages', 'members/portal'))).toBe('/members/portal')
  })

  it('does not gate a normal custom link', () => {
    expect(resolveMemberHref(custom('https://mapsnational.org/join'))).toBeNull()
  })

  it('does not gate an internal link to a non-member page', () => {
    expect(resolveMemberHref(internal('pages', 'about-us'))).toBeNull()
  })

  it('does not gate an internal link to a post', () => {
    expect(resolveMemberHref(internal('posts', 'some-update'))).toBeNull()
  })

  it('returns null for an internal link whose doc is not populated (depth 0)', () => {
    const node = {
      type: 'link',
      fields: { linkType: 'internal', doc: { relationTo: 'pages', value: 22 } },
      children: [],
    } as never
    expect(resolveMemberHref(node)).toBeNull()
  })
})
