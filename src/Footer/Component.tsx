import Link from 'next/link'
import React from 'react'
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { Logo } from '@/components/Logo/Logo'

// Site footer — ported from the live MAPS site (migration/_extracted/index.html).
// The structure is fixed brand IA, hardcoded like the header nav (NavMenu), so the
// footer no longer reads the `footer` CMS global.

type FooterLink = { label: string; href: string }

// Lean wayfinding set: the two hubs (which now own the deep program/about
// routing via their card directories) plus the live feeds and contact. Leaf
// links were dropped when /programs and /about-us shipped — a footer listing
// every leaf is the flat directory we set out to avoid.
const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Explore',
    links: [
      { label: 'Programs', href: '/programs' },
      { label: 'About Us', href: '/about-us' },
      { label: 'Events', href: '/events' },
      { label: 'Latest Updates', href: '/latest-updates' },
      { label: 'Contact', href: '/contact-us' },
    ],
  },
]

// lucide covers four of the five; X (formerly Twitter) keeps the twitter.com href
// per the live site but uses the current X glyph.
const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const SOCIAL: { label: string; href: string; Icon: React.FC<{ className?: string }> }[] = [
  { label: 'Facebook', href: 'https://www.facebook.com/MAPSNational', Icon: Facebook },
  { label: 'Instagram', href: 'https://www.instagram.com/mapsnational/', Icon: Instagram },
  { label: 'X', href: 'https://twitter.com/MAPSNational', Icon: XIcon },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/muslim-americans-in-public-service/',
    Icon: Linkedin,
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/channel/UCb5T3l6hpKdWCFBltCmX-5g',
    Icon: Youtube,
  },
]

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-[var(--brand-primary-darker)] text-[var(--neutral-lightest)]">
      <div className="container py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Brand + newsletter */}
          <div className="max-w-md">
            <Link className="inline-flex items-center" href="/">
              <Logo variant="secondary" theme="dark" />
            </Link>
            <p className="mt-6 text-sm text-[var(--neutral-light)]">
              Stay informed on the latest MAPS updates as a non-member. For member exclusive
              benefits, learn more about MAPS membership.
            </p>

            {/* Newsletter signup — visual placeholder only.
                ponytail: not wired to any provider (Mailchimp dropped); add a submit
                handler + endpoint when a provider is chosen. Inert by design: no
                <form>, button is type="button", so nothing posts. */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="footer-email">
                Email address
              </label>
              <input
                className="w-full rounded-md border border-[var(--neutral-dark)] bg-[var(--neutral-darkest)] px-4 py-2 text-sm text-[var(--neutral-lightest)] placeholder:text-[var(--neutral-base)]"
                id="footer-email"
                name="email"
                placeholder="Enter your email"
                type="email"
              />
              <button
                className="shrink-0 rounded-md bg-[var(--neutral-lightest)] px-5 py-2 text-sm font-semibold text-[var(--brand-primary-base)] transition-colors hover:bg-white"
                type="button"
              >
                Subscribe
              </button>
            </div>
            <p className="mt-2 text-xs text-[var(--neutral-base)]">
              By subscribing you agree to receive updates from us.
            </p>
          </div>

          {/* Link columns + social */}
          <div className="grid grid-cols-2 gap-8">
            {COLUMNS.map((col) => (
              <nav aria-label={col.title} key={col.title}>
                <p className="mb-4 text-sm font-semibold">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        className="text-sm text-[var(--neutral-light)] transition-colors hover:text-[var(--neutral-lightest)]"
                        href={l.href}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <div>
              <p className="mb-4 text-sm font-semibold">Follow us</p>
              <ul className="flex flex-wrap gap-3">
                {SOCIAL.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a
                      aria-label={label}
                      className="inline-flex size-9 items-center justify-center rounded-md border border-[var(--neutral-dark)] text-[var(--neutral-lightest)] transition-colors hover:bg-[var(--neutral-dark)]"
                      href={href}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Icon className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider + bottom credit row */}
        <div className="mt-10 flex flex-col gap-4 border-t border-[var(--neutral-dark)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--neutral-light)]">
            © {new Date().getFullYear()} MAPS. All rights reserved.
          </p>
          <ThemeSelector />
        </div>
      </div>
    </footer>
  )
}
