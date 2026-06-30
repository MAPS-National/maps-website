'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Lock, SearchIcon } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/utilities/ui'

// window.Outseta is typed centrally in src/types/outseta.d.ts.

type NavLink = { label: string; href: string }
// `href` makes the group label itself a link to a hub/landing page (the single
// front door for that section); the items remain the deeper destinations.
type NavGroup = { label: string; href?: string; items: NavLink[]; gated?: boolean }

// Site information architecture (G1). Hardcoded — this is the site's fixed
// structure, not editorial content; the slugs match the seeded pages.
const GROUPS: NavGroup[] = [
  {
    label: 'About Us',
    href: '/about-us',
    items: [
      { label: 'Mission', href: '/about-us/mission' },
      { label: 'FAQ', href: '/about-us/faq' },
      { label: 'Partners', href: '/about-us/partners' },
      { label: 'Board & Leadership', href: '/about-us/board-leadership' },
      { label: 'Advisory Council', href: '/about-us/advisory-council' },
      { label: 'State Committees', href: '/about-us/state-committees' },
    ],
  },
  {
    label: 'Events',
    items: [
      { label: 'Upcoming Events', href: '/events/upcoming' },
      { label: 'MAPS Events', href: '/events/maps' },
      { label: 'Partner Events', href: '/events/partner' },
      { label: 'All Events', href: '/events' },
    ],
  },
  {
    label: 'Programs',
    href: '/programs',
    items: [
      { label: 'Career Support', href: '/programs/career-support' },
      { label: 'Community Building', href: '/programs/community-building' },
      { label: 'Legal Advocacy', href: '/programs/legal-advocacy' },
      { label: 'Policy Initiatives', href: '/programs/policy-initiatives' },
      { label: 'Private Sector Engagement', href: '/programs/private-sector-engagement' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'Federal Employment', href: '/resources/federal-employment' },
      { label: 'Jumuah Services', href: '/resources/jumuah-services' },
      {
        label: 'Fellowships (Young Professionals)',
        href: '/resources/public-service-fellowships-young-professionals',
      },
      {
        label: 'Fellowships (Mid-Career to Senior)',
        href: '/resources/public-service-fellowships-mid-career-to-senior-professionals',
      },
    ],
  },
  {
    label: 'Members',
    gated: true,
    // Only the portal entry point is exposed publicly; the member-only sub-pages
    // (Community Building, NY State, etc.) are reached from inside after sign-in.
    items: [{ label: 'Member Portal', href: '/members/portal' }],
  },
]

const FLAT: NavLink[] = [
  { label: 'Press', href: '/press' },
  { label: 'Latest Updates', href: '/latest-updates' },
  { label: 'Contact', href: '/contact' },
]

/**
 * Header navigation — a hamburger that opens a full-screen overlay menu at every
 * breakpoint (G1). The overlay lays the IA out in grouped columns, with the flat
 * links, the Donate/Join CTAs, and search. The Outseta login/logout control sits
 * in the always-visible top bar: the nocode module (monitorDom) shows exactly one
 * by auth state via the `data-o-anonymous` / `data-o-authenticated` attributes, and
 * each click calls the Outseta SDK directly (#115). Closes on Esc, backdrop, route
 * change, or a link.
 */
export const NavMenu: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const wasOpenRef = useRef(false)

  const close = useCallback(() => setOpen(false), [])

  // Portal target is only available on the client.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // Close when the route changes (a link was followed).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false)
  }, [pathname])

  // Lock body scroll, manage focus, and trap Tab + wire Esc while open.
  useEffect(() => {
    if (open && !wasOpenRef.current) closeRef.current?.focus()
    else if (!open && wasOpenRef.current) triggerRef.current?.focus()
    wasOpenRef.current = open

    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
        return
      }
      if (e.key !== 'Tab') return
      // Keep focus inside the dialog (aria-modal doesn't enforce this).
      const root = dialogRef.current
      if (!root) return
      const focusables = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const activeEl = document.activeElement as HTMLElement | null
      if (e.shiftKey && (activeEl === first || !root.contains(activeEl))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (activeEl === last || !root.contains(activeEl))) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  return (
    <div className="flex items-center gap-2">
      {/* Outseta auth control. The nocode module (monitorDom) toggles visibility
          via data-o-anonymous / data-o-authenticated (verified: shows exactly one
          by auth state). The click is the SDK directly — auth.open() pops the login
          modal in-page (no hosted-page redirect, so the cookie is written
          same-origin and it works on localhost); logout() clears the session. Top
          bar, before search, so login is prominent. Account (profile modal) lives
          in the Members menu group instead. text-foreground tracks the header's
          per-page data-theme. */}
      <a
        className="text-sm font-medium uppercase tracking-wide text-foreground hover:text-primary"
        data-o-anonymous="true"
        href="#"
        onClick={(e) => {
          e.preventDefault()
          window.Outseta?.auth?.open({ widgetMode: 'login' })
        }}
        role="button"
      >
        Login
      </a>
      <a
        className="text-sm font-medium uppercase tracking-wide text-foreground hover:text-primary"
        data-o-authenticated="true"
        href="#"
        onClick={(e) => {
          e.preventDefault()
          window.Outseta?.logout?.()
        }}
        role="button"
      >
        Logout
      </a>
      <Link aria-label="Search" className="p-2 text-foreground hover:text-primary" href="/search">
        <SearchIcon className="size-5" />
      </Link>
      <button
        aria-controls="primary-menu"
        aria-expanded={open}
        aria-label="Open menu"
        className="inline-flex items-center gap-2 rounded-md p-2 text-foreground hover:text-primary"
        onClick={() => setOpen(true)}
        ref={triggerRef}
        type="button"
      >
        <MenuIcon />
        <span className="text-sm font-medium uppercase tracking-wide">Menu</span>
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            aria-label="Site menu"
            aria-modal="true"
            className="fixed inset-0 z-[200] overflow-y-auto bg-background text-content"
            id="primary-menu"
            ref={dialogRef}
            role="dialog"
          >
            <div className="container flex items-center justify-between py-8">
              <span className="font-serif text-lg font-semibold">Menu</span>
              <button
                aria-label="Close menu"
                className="rounded-md p-2 text-content hover:text-primary"
                onClick={close}
                ref={closeRef}
                type="button"
              >
                <CloseIcon />
              </button>
            </div>

            <nav className="container grid gap-x-10 gap-y-10 pb-20 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="mb-4 border-b border-border pb-2 font-serif text-lg font-semibold text-content">
                    {group.href ? (
                      <Link
                        className="transition-colors hover:text-primary"
                        href={group.href}
                        onClick={close}
                      >
                        {group.label}
                      </Link>
                    ) : (
                      group.label
                    )}
                  </p>
                  <ul className="space-y-2.5">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <MenuLink
                          active={pathname === item.href}
                          gated={group.gated}
                          href={item.href}
                          onClick={close}
                        >
                          {item.label}
                        </MenuLink>
                      </li>
                    ))}
                    {/* Account opens the Outseta profile modal; only the nocode
                        module reveals it once authenticated. Lock matches the
                        gated Members items. */}
                    {group.label === 'Members' && (
                      <li data-o-authenticated="true">
                        <button
                          className="text-base text-content-secondary transition-colors hover:text-primary"
                          onClick={() => {
                            window.Outseta?.profile?.open()
                            close()
                          }}
                          type="button"
                        >
                          <Lock
                            aria-hidden="true"
                            className="mr-1.5 inline-block size-3.5 align-[-0.15em]"
                          />
                          Account
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </nav>

            <div className="container flex flex-col gap-8 border-t border-border py-10 lg:flex-row lg:items-center lg:justify-between">
              <ul className="flex flex-wrap gap-x-8 gap-y-3">
                {FLAT.map((item) => (
                  <li key={item.href}>
                    <MenuLink active={pathname === item.href} href={item.href} onClick={close}>
                      {item.label}
                    </MenuLink>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-3">
                {/* Member login/logout live in the always-visible header top bar
                  (see the NavMenu top row), wired to the Outseta SDK. */}
                <Link
                  className="rounded-md border border-primary px-5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  href="/donate"
                  onClick={close}
                >
                  Donate
                </Link>
                <Link
                  className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  href="/join"
                  onClick={close}
                >
                  Join MAPS
                </Link>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

const MenuLink: React.FC<{
  active: boolean
  href: string
  onClick: () => void
  gated?: boolean
  children: React.ReactNode
}> = ({ active, href, onClick, gated, children }) => (
  <Link
    className={cn(
      'text-base transition-colors hover:text-primary',
      active ? 'font-medium text-primary' : 'text-content-secondary',
    )}
    href={href}
    onClick={onClick}
  >
    {gated && <Lock aria-hidden="true" className="mr-1.5 inline-block size-3.5 align-[-0.15em]" />}
    {children}
  </Link>
)

const MenuIcon: React.FC = () => (
  <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
    <path
      d="M4 7h16M4 12h16M4 17h16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.75"
    />
  </svg>
)

const CloseIcon: React.FC = () => (
  <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
    <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" />
  </svg>
)
