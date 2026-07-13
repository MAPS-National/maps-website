import type { SerializedLinkNode } from '@payloadcms/richtext-lexical'

import { collectionHref } from '@/utilities/collectionHref'

// Member-gated links inside body prose: the /members portal and Luma event RSVP
// links (members-only). These render a placeholder for anonymous visitors and
// the real link for members, toggled by Outseta's data-o-* body attributes.
// Kept React-free (no JSX imports) so it stays unit-testable in node. (#250)

export const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }): string => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  return collectionHref(relationTo as 'pages' | 'posts', String(value.slug))
}

export const isMemberHref = (href: string): boolean => {
  if (/^\/members(\/|$|\?|#)/i.test(href)) return true
  try {
    // ponytail: matches full URLs (https://luma.com/…); a bare "luma.com/…" with no
    // scheme won't match, but authored links carry one. Base handles relative hrefs.
    return /(^|\.)(luma\.com|lu\.ma)$/i.test(new URL(href, 'http://_').hostname)
  } catch {
    return false
  }
}

// Resolve a link node's destination href when it points at member-gated content,
// else null. Covers BOTH custom URLs (luma.com, /members/*) and internal doc
// links that resolve to a /members/* page — the real 5th-annual post links the
// Member Portal as an internal doc link, which #257 originally missed (it only
// gated custom links), so the link rendered bare and Outseta's global
// a[href^="/members"] hide rule stripped it for everyone. Returns null for
// non-member links and for internal links whose doc isn't populated (depth 0),
// which then fall through to the stock converter. (#250)
export const resolveMemberHref = (node: SerializedLinkNode): string | null => {
  let href: string | null
  if (node.fields.linkType === 'internal') {
    try {
      href = internalDocToHref({ linkNode: node })
    } catch {
      return null
    }
  } else {
    href = node.fields.url ?? null
  }
  return href && isMemberHref(href) ? href : null
}
