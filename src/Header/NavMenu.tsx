'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SearchIcon } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/utilities/ui'

type NavLink = { label: string; href: string }
type NavGroup = { label: string; items: NavLink[] }

// Site information architecture (G1). Hardcoded — this is the site's fixed
// structure, not editorial content; the slugs match the seeded pages.
const GROUPS: NavGroup[] = [
  {
    label: 'About Us',
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
    label: 'Programs',
    items: [
      { label: 'Career Support', href: '/programs/career-support' },
      { label: 'Community Building', href: '/programs/community-building' },
      { label: 'Legal Advocacy', href: '/programs/legal-advocacy' },
      { label: 'Policy Initiatives', href: '/programs/policy-initiatives' },
      { label: 'Public Sector Engagement', href: '/programs/public-sector-engagement' },
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
    items: [
      { label: 'Member Portal', href: '/members/portal' },
      { label: 'Community Building', href: '/members/community-building' },
      { label: 'New York State', href: '/members/new-york-state' },
      { label: 'Policy & Legal Advocacy', href: '/members/policy-legal-advocacy' },
      { label: 'Professional Development', href: '/members/professional-development' },
      { label: 'MAPS Academy Videos', href: '/members/maps-academy-vids' },
      { label: 'Points of Contact', href: '/members/resources-points-of-contact' },
    ],
  },
]

const FLAT: NavLink[] = [
  { label: 'Press', href: '/press' },
  { label: 'Events', href: '/events' },
  { label: 'Contact', href: '/contact-us' },
]

/**
 * Header navigation — a hamburger that opens a full-screen overlay menu at every
 * breakpoint (G1). The overlay lays the IA out in grouped columns, with the flat
 * links, the Donate/Join CTAs, search, and the Outseta login/logout control
 * beneath. Outseta's no-code module (monitorDom) binds the `o-login-link` /
 * `o-logout-link` anchors and toggles the `data-o-anonymous` / `data-o-authenticated`
 * blocks by auth state (#115). Closes on Esc, backdrop, route change, or a link.
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
      {/* Outseta auth control — the no-code module (monitorDom) binds these by id
          and shows exactly one based on auth state. Lives here (the always-visible
          top bar), before the search icon, so login is prominent. text-foreground
          tracks the header's per-page data-theme. The ids must be unique, so this
          is the ONLY copy of these anchors. */}
      <a
        className="text-sm font-medium uppercase tracking-wide text-foreground hover:text-primary"
        data-o-anonymous="true"
        href="#"
        id="o-login-link"
        onClick={(e) => e.preventDefault()}
        role="button"
      >
        Login
      </a>
      <a
        className="text-sm font-medium uppercase tracking-wide text-foreground hover:text-primary"
        data-o-authenticated="true"
        href="#"
        id="o-logout-link"
        onClick={(e) => e.preventDefault()}
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

          <nav className="container grid gap-x-10 gap-y-10 pb-20 md:grid-cols-2 lg:grid-cols-4">
            {GROUPS.map((group) => (
              <div key={group.label}>
                <p className="mb-4 border-b border-border pb-2 font-serif text-lg font-semibold text-content">
                  {group.label}
                </p>
                <ul className="space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <MenuLink active={pathname === item.href} href={item.href} onClick={close}>
                        {item.label}
                      </MenuLink>
                    </li>
                  ))}
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
              {/* Member login/logout moved to the always-visible header top bar
                  (see the NavMenu top row); the Outseta no-code binder keys off the
                  o-login-link / o-logout-link ids, which must be unique. */}
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
  children: React.ReactNode
}> = ({ active, href, onClick, children }) => (
  <Link
    className={cn(
      'text-base transition-colors hover:text-primary',
      active ? 'font-medium text-primary' : 'text-content-secondary',
    )}
    href={href}
    onClick={onClick}
  >
    {children}
  </Link>
)

const MenuIcon: React.FC = () => (
  <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
    <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" />
  </svg>
)

const CloseIcon: React.FC = () => (
  <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
    <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" />
  </svg>
)
