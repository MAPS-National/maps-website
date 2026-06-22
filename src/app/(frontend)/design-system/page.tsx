import type { Metadata } from 'next'
import React from 'react'

import { Button } from '@/components/ui/button'
import { ThemeToggle } from './ThemeToggle'

const brandPrimary = [
  'lightest',
  'lighter',
  'light',
  'base',
  'dark',
  'darker',
  'darkest',
] as const
const brandSecondary = brandPrimary
const neutral = [
  'white',
  'lightest',
  'lighter',
  'light',
  'base',
  'dark',
  'darker',
  'darkest',
  'black',
] as const
const radii = ['xs', 'sm', 'md', 'lg', 'xl', 'pill'] as const
const spacing = ['xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'huge', 'xhuge'] as const

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="flex flex-col gap-s">
    <h2 className="text-2xl">{title}</h2>
    {children}
  </section>
)

const Swatch = ({ label, color }: { label: string; color: string }) => (
  <div className="flex flex-col gap-1">
    <div className="h-16 w-full rounded-md border border-border" style={{ backgroundColor: color }} />
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
)

export default function StyleGuidePage() {
  return (
    <main className="container flex flex-col gap-xl py-xl">
      <header className="flex flex-col gap-xs">
        <h1 className="text-4xl">Design System</h1>
        <p className="text-muted-foreground">
          Design tokens — brand palette, radius, typography, spacing, semantic tiers.
        </p>
        <div>
          <ThemeToggle />
        </div>
      </header>

      <Section title="Brand — primary (navy)">
        <div className="grid grid-cols-2 gap-s sm:grid-cols-4 lg:grid-cols-7">
          {brandPrimary.map((step) => (
            <Swatch key={step} label={`primary-${step}`} color={`var(--brand-primary-${step})`} />
          ))}
        </div>
      </Section>

      <Section title="Brand — secondary (maroon)">
        <div className="grid grid-cols-2 gap-s sm:grid-cols-4 lg:grid-cols-7">
          {brandSecondary.map((step) => (
            <Swatch
              key={step}
              label={`secondary-${step}`}
              color={`var(--brand-secondary-${step})`}
            />
          ))}
        </div>
      </Section>

      <Section title="Neutral scale">
        <div className="grid grid-cols-3 gap-s sm:grid-cols-5 lg:grid-cols-9">
          {neutral.map((step) => (
            <Swatch key={step} label={`neutral-${step}`} color={`var(--neutral-${step})`} />
          ))}
        </div>
      </Section>

      <Section title="shadcn atoms (semantic mapping)">
        <div className="flex flex-wrap gap-s">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap items-center gap-s pt-xs">
          <span className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white">
            Brand primary
          </span>
          <span className="rounded-md bg-brand-secondary px-4 py-2 text-sm font-medium text-white">
            Brand secondary (maroon)
          </span>
          <span className="text-content-secondary text-sm">
            Maroon is a deliberate accent (<code>bg-brand-secondary</code>), not the neutral
            secondary action.
          </span>
        </div>
      </Section>

      <Section title="Radius scale">
        <div className="flex flex-wrap items-end gap-l">
          {radii.map((r) => (
            <div key={r} className="flex flex-col items-center gap-1">
              <div
                className="h-20 w-20 bg-primary"
                style={{ borderRadius: `var(--rad-${r})` }}
              />
              <span className="text-xs text-muted-foreground">rad-{r}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="flex flex-col gap-xs">
          <h1 className="text-5xl">Heading — Lora serif</h1>
          <h2 className="text-3xl">Subheading — Lora serif</h2>
          <p className="max-w-prose text-base">
            Body copy is set in Montserrat. The quick brown fox jumps over the lazy dog. Headings
            render in Lora, body in Montserrat, both self-hosted via next/font.
          </p>
          <p className="font-mono text-sm">Mono fallback (Geist) — 0123456789</p>
        </div>
      </Section>

      <Section title="Spacing scale">
        <div className="flex flex-col gap-xxs">
          {spacing.map((s) => (
            <div key={s} className="flex items-center gap-s">
              <span className="w-16 text-xs text-muted-foreground">space-{s}</span>
              <div className="h-4 shrink-0 bg-secondary" style={{ width: `var(--space-${s})` }} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Semantic tiers (theme-aware)">
        <div className="grid gap-s sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1 rounded-md border border-border bg-background p-m text-foreground">
            <span className="font-semibold">Surface — primary</span>
            <span className="text-content-secondary text-sm">Secondary text on primary surface</span>
          </div>
          <div className="flex flex-col gap-1 rounded-md border border-border bg-surface-secondary p-m text-foreground">
            <span className="font-semibold">Surface — secondary</span>
            <span className="text-content-secondary text-sm">Muted background tier</span>
          </div>
          <div className="flex flex-col gap-1 rounded-md border border-border-strong bg-surface-tertiary p-m text-foreground">
            <span className="font-semibold">Surface — tertiary</span>
            <span className="text-sm">Strong border</span>
          </div>
          <div className="flex flex-col gap-1 rounded-md bg-surface-alternate p-m text-content-alternate">
            <span className="font-semibold">Surface — alternate</span>
            <span className="text-sm">Inverts between light/dark</span>
            <a className="text-link-alternate text-sm underline" href="#">
              Alternate link
            </a>
          </div>
          <div className="flex flex-col gap-1 rounded-md bg-surface-success p-m text-content-success">
            <span className="font-semibold">Success</span>
            <span className="text-sm">Surface + content</span>
          </div>
          <div className="flex flex-col gap-1 rounded-md bg-surface-error p-m text-content-error">
            <span className="font-semibold">Error</span>
            <span className="text-sm">Surface + content</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-l pt-xs">
          <a className="text-link underline" href="#">
            Primary link
          </a>
          <a className="text-link-secondary underline" href="#">
            Secondary link
          </a>
        </div>
      </Section>
    </main>
  )
}

export const metadata: Metadata = {
  title: 'Design System',
  robots: { index: false, follow: false },
}
