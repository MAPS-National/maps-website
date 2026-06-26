import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { createRemoteJWKSet, jwtVerify } from 'jose'

/**
 * Server-side gate for the members area (Outseta auth).
 *
 * The Webflow site protected /members/* client-side (the Outseta `nocode` module
 * redirected after load) — content was still delivered to logged-out visitors.
 * This enforces it server-side: read the Outseta JWT (written to a cookie by the
 * SDK; see OutsetaScript with tokenStorage:'cookie'), verify it against Outseta's
 * JWKS, and redirect anyone without a valid token to the hosted login. Logged-out
 * visitors never receive the HTML.
 *
 * `/members/portal` stays public: it is the post-login landing (the SDK writes the
 * cookie client-side *after* the redirect back, so the landing must be reachable
 * without a cookie or the gate would loop) and carries no member-only content.
 */

const OUTSETA_DOMAIN = 'mapsnational.outseta.com'
const LOGIN_URL = `https://${OUTSETA_DOMAIN}/auth?widgetMode=login#o-anonymous`

// Lazily fetched + cached at module scope (Edge runtime). Verifies token signatures.
const JWKS = createRemoteJWKSet(new URL(`https://${OUTSETA_DOMAIN}/.well-known/jwks`))

// Members-area paths that must remain public (login landing / login embed).
const PUBLIC_MEMBER_PATHS = new Set(['/members/portal'])

const looksLikeJwt = (value: string) => value.split('.').length === 3

/**
 * True if the request carries a cookie holding a valid Outseta-signed JWT. We
 * prefer the documented cookie name but fall back to verifying any JWT-shaped
 * cookie, so a forged/expired token never passes and a cookie-name change can't
 * silently break the gate.
 */
async function hasValidToken(req: NextRequest): Promise<boolean> {
  const all = req.cookies.getAll()
  const ordered = [
    ...all.filter((c) => c.name === 'Outseta.nocode.accessToken'),
    ...all.filter((c) => c.name !== 'Outseta.nocode.accessToken' && /outseta|token/i.test(c.name)),
  ]
  for (const cookie of ordered) {
    if (!cookie.value || !looksLikeJwt(cookie.value)) continue
    try {
      await jwtVerify(cookie.value, JWKS)
      return true
    } catch {
      // Try the next candidate; fail closed if none verify.
    }
  }
  return false
}

export async function middleware(req: NextRequest) {
  if (PUBLIC_MEMBER_PATHS.has(req.nextUrl.pathname)) return NextResponse.next()
  if (await hasValidToken(req)) return NextResponse.next()

  // On localhost the hosted Outseta login can't redirect back (its post-login URL
  // is the prod domain), so sending devs there sets the cookie on the wrong origin
  // and loops. Bounce to home instead — log in via the embedded top-bar widget,
  // which writes the cookie same-origin on localhost. Prod keeps the hosted gate.
  const host = req.nextUrl.hostname
  if (host === 'localhost' || host === '127.0.0.1') {
    return NextResponse.redirect(new URL('/', req.url))
  }
  return NextResponse.redirect(new URL(LOGIN_URL))
}

export const config = {
  matcher: ['/members/:path*'],
}
