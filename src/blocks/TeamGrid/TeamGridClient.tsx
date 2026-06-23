'use client'

import NextImage from 'next/image'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '@/utilities/ui'

/** A group a member belongs to: stable filter value + display label. */
export type TeamTab = { value: string; label: string }

export type TeamMember = {
  id: string
  name: string
  jobTitle?: string
  jobTitleSecondary?: string
  /** Groups this member belongs to (a member can be in several). */
  categories: TeamTab[]
  email?: string
  linkedin?: string
  photoSrc?: string
  photoAlt?: string
  /** Pre-rendered rich-text bio (server-rendered, passed across the RSC boundary). */
  bio?: React.ReactNode
}

const gridCols: Record<string, string> = {
  '2': 'sm:grid-cols-2',
  '3': 'sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-2 lg:grid-cols-4',
}

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

/**
 * Interactive surface for the Team grid, with a per-member bio modal. Two
 * layouts: `grouped` stacks a labelled section per category (matching the live
 * site); `tabs` shows one grid with a category filter bar. The modal is a
 * focus-managed dialog (Esc / backdrop to close, focus sent to the close button
 * on open and restored to the opening card on close).
 */
export const TeamGridClient: React.FC<{
  columns: string
  layout: 'grouped' | 'tabs'
  members: TeamMember[]
}> = ({ columns, layout, members }) => {
  const [active, setActive] = useState<string>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const wasOpenRef = useRef(false)

  // Ordered, de-duplicated groups present in the data → filter tabs.
  const tabs = useMemo(() => {
    const seen = new Map<string, string>()
    for (const m of members) for (const c of m.categories) if (!seen.has(c.value)) seen.set(c.value, c.label)
    return Array.from(seen, ([value, label]) => ({ value, label }))
  }, [members])

  const showTabs = layout === 'tabs' && tabs.length > 1

  // Grouped layout: one section per group, in tab order, members preserved.
  const groups = useMemo(
    () =>
      tabs
        .map((t) => ({
          ...t,
          members: members.filter((m) => m.categories.some((c) => c.value === t.value)),
        }))
        .filter((g) => g.members.length > 0),
    [tabs, members],
  )

  const visible = useMemo(
    () =>
      active === 'all'
        ? members
        : members.filter((m) => m.categories.some((c) => c.value === active)),
    [active, members],
  )

  const openMember = useMemo(() => members.find((m) => m.id === openId) ?? null, [members, openId])

  const open = useCallback((id: string, el: HTMLElement) => {
    triggerRef.current = el
    setOpenId(id)
  }, [])

  const close = useCallback(() => setOpenId(null), [])

  // Restore focus in an effect (after the dialog unmounts) — see MediaGallery.
  useEffect(() => {
    const isOpen = openId !== null
    if (isOpen && !wasOpenRef.current) closeRef.current?.focus()
    else if (!isOpen && wasOpenRef.current) triggerRef.current?.focus()
    wasOpenRef.current = isOpen

    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [openId, close])

  return (
    <>
      {layout === 'grouped' && groups.length > 0 ? (
        groups.map((g) => (
          <div className="mb-14 last:mb-0" key={g.value}>
            <h3 className="mb-6 flex items-center gap-3 text-2xl font-semibold md:text-3xl">
              <span aria-hidden="true" className="h-7 w-1 rounded-full bg-primary" />
              {g.label}
            </h3>
            <Grid columns={columns} members={g.members} onOpen={open} />
          </div>
        ))
      ) : (
        <>
          {showTabs && (
            <div className="mb-8 flex flex-wrap gap-2" role="tablist">
              <FilterTab active={active === 'all'} label="All" onClick={() => setActive('all')} />
              {tabs.map((t) => (
                <FilterTab
                  active={active === t.value}
                  key={t.value}
                  label={t.label}
                  onClick={() => setActive(t.value)}
                />
              ))}
            </div>
          )}
          <Grid columns={columns} members={visible} onOpen={open} />
        </>
      )}

      {openMember && (
        <div
          aria-label={openMember.name}
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) close()
          }}
          role="dialog"
        >
          <div className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-card p-6 shadow-xl sm:p-8">
            <button
              aria-label="Close"
              className="absolute right-4 top-4 rounded-md p-2 text-content-secondary hover:text-primary"
              onClick={close}
              ref={closeRef}
              type="button"
            >
              <CloseIcon />
            </button>

            <div className="flex flex-col gap-6 sm:flex-row">
              <Photo className="w-full shrink-0 rounded-lg sm:w-40" member={openMember} />
              <div className="min-w-0">
                <h3 className="text-2xl font-semibold">{openMember.name}</h3>
                {openMember.jobTitle && <p className="mt-1 text-primary">{openMember.jobTitle}</p>}
                {openMember.jobTitleSecondary && (
                  <p className="text-primary">{openMember.jobTitleSecondary}</p>
                )}
                {openMember.categories.length > 0 && (
                  <p className="mt-1 text-sm text-content-secondary">
                    {openMember.categories.map((c) => c.label).join(' · ')}
                  </p>
                )}
                {(openMember.email || openMember.linkedin) && (
                  <div className="mt-4 flex items-center gap-3.5">
                    {openMember.linkedin && (
                      <a
                        aria-label={`${openMember.name} on LinkedIn`}
                        className="text-content-secondary transition-colors hover:text-primary"
                        href={openMember.linkedin}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <LinkedInIcon />
                      </a>
                    )}
                    {openMember.email && (
                      <a
                        aria-label={`Email ${openMember.name}`}
                        className="text-content-secondary transition-colors hover:text-primary"
                        href={`mailto:${openMember.email}`}
                      >
                        <EmailIcon />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {openMember.bio && <div className="mt-6">{openMember.bio}</div>}
          </div>
        </div>
      )}
    </>
  )
}

const FilterTab: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({
  active,
  label,
  onClick,
}) => (
  <button
    aria-pressed={active}
    className={cn(
      'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
      active
        ? 'border-primary bg-primary text-primary-foreground'
        : 'border-border text-content-secondary hover:border-primary hover:text-primary',
    )}
    onClick={onClick}
    role="tab"
    type="button"
  >
    {label}
  </button>
)

/** A responsive card grid of members. Shared by both layouts. */
const Grid: React.FC<{
  columns: string
  members: TeamMember[]
  onOpen: (id: string, el: HTMLElement) => void
}> = ({ columns, members, onOpen }) => (
  <ul className={cn('grid grid-cols-1 gap-6', gridCols[columns] ?? gridCols['3'])}>
    {members.map((m) => (
      <li key={m.id}>
        <Card member={m} onOpen={onOpen} />
      </li>
    ))}
  </ul>
)

/**
 * One member card — square headshot, name + title beneath, left-aligned (live
 * site). The whole card opens the bio modal. Hoisted to module scope so its
 * identity is stable across the parent's re-renders (filtering / modal toggles)
 * — otherwise cards would remount and detach the button captured for focus
 * restoration. See MediaGallery's Thumb.
 */
const Card: React.FC<{
  member: TeamMember
  onOpen: (id: string, el: HTMLElement) => void
}> = ({ member, onOpen }) => (
  <button
    className="group flex w-full flex-col overflow-hidden rounded-lg border border-border bg-card text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-xl"
    onClick={(e) => onOpen(member.id, e.currentTarget)}
    type="button"
  >
    <span className="relative block overflow-hidden">
      <Photo className="w-full transition-transform duration-500 group-hover:scale-105" member={member} />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-4 pb-3 pt-10 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        View bio
        <ArrowIcon />
      </span>
    </span>
    <span className="px-4 pt-4 text-lg font-semibold transition-colors group-hover:text-primary">
      {member.name}
    </span>
    {member.jobTitle && (
      <span className="px-4 pb-4 pt-0.5 text-sm text-content-secondary">{member.jobTitle}</span>
    )}
    {!member.jobTitle && <span className="pb-4" />}
  </button>
)

/** Square (1:1) headshot, or initials on a brand tint when no photo. Rounding is
 * left to the caller — cards clip via overflow-hidden, the modal rounds itself. */
const Photo: React.FC<{ className?: string; member: TeamMember }> = ({ className, member }) => {
  if (member.photoSrc) {
    return (
      <span
        className={cn('relative block aspect-square overflow-hidden bg-surface-secondary', className)}
      >
        <NextImage
          alt={member.photoAlt || member.name}
          className="object-cover"
          fill
          sizes="(max-width: 640px) 50vw, 280px"
          src={member.photoSrc}
        />
      </span>
    )
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex aspect-square items-center justify-center bg-primary/10 text-3xl font-semibold text-primary',
        className,
      )}
    >
      {initials(member.name)}
    </span>
  )
}

const CloseIcon: React.FC = () => (
  <svg
    aria-hidden="true"
    className="size-6"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

// Social glyphs lifted verbatim from the live site (mapsnational.webflow.io) so
// the directory's icons match the source exactly.
const LinkedInIcon: React.FC = () => (
  <svg
    aria-hidden="true"
    className="size-6"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      clipRule="evenodd"
      d="M5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3ZM8 18C8.27614 18 8.5 17.7761 8.5 17.5V10.5C8.5 10.2239 8.27614 10 8 10H6.5C6.22386 10 6 10.2239 6 10.5V17.5C6 17.7761 6.22386 18 6.5 18H8ZM7.25 9C6.42157 9 5.75 8.32843 5.75 7.5C5.75 6.67157 6.42157 6 7.25 6C8.07843 6 8.75 6.67157 8.75 7.5C8.75 8.32843 8.07843 9 7.25 9ZM17.5 18C17.7761 18 18 17.7761 18 17.5V12.9C18.0325 11.3108 16.8576 9.95452 15.28 9.76C14.177 9.65925 13.1083 10.1744 12.5 11.1V10.5C12.5 10.2239 12.2761 10 12 10H10.5C10.2239 10 10 10.2239 10 10.5V17.5C10 17.7761 10.2239 18 10.5 18H12C12.2761 18 12.5 17.7761 12.5 17.5V13.75C12.5 12.9216 13.1716 12.25 14 12.25C14.8284 12.25 15.5 12.9216 15.5 13.75V17.5C15.5 17.7761 15.7239 18 16 18H17.5Z"
      fillRule="evenodd"
    />
  </svg>
)

const EmailIcon: React.FC = () => (
  <svg
    aria-hidden="true"
    className="size-6"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="m22 6c0-1.1-.9-2-2-2h-16c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2zm-2 0-8 5-8-5zm0 12h-16v-10l8 5 8-5z" />
  </svg>
)

const ArrowIcon: React.FC = () => (
  <svg
    aria-hidden="true"
    className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 12h14M13 6l6 6-6 6"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)
