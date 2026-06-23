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
 * Interactive surface for the Team grid: a category filter tab bar and a card
 * grid, with a per-member bio modal. The modal is a focus-managed dialog
 * (Esc / backdrop to close, focus sent to the close button on open and restored
 * to the opening card on close).
 */
export const TeamGridClient: React.FC<{
  columns: string
  enableFilter: boolean
  members: TeamMember[]
}> = ({ columns, enableFilter, members }) => {
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

  const showTabs = enableFilter && tabs.length > 1

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

      <ul className={cn('grid grid-cols-1 gap-6', gridCols[columns] ?? gridCols['3'])}>
        {visible.map((m) => (
          <li key={m.id}>
            <Card member={m} onOpen={open} />
          </li>
        ))}
      </ul>

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
              <div className="shrink-0">
                <Avatar member={openMember} size={120} />
              </div>
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
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {openMember.email && (
                      <a
                        className="text-primary hover:underline"
                        href={`mailto:${openMember.email}`}
                      >
                        {openMember.email}
                      </a>
                    )}
                    {openMember.linkedin && (
                      <a
                        className="text-primary hover:underline"
                        href={openMember.linkedin}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        LinkedIn
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

/**
 * One member card. Hoisted to module scope so its identity is stable across the
 * parent's re-renders (filtering / modal toggles) — otherwise cards would remount
 * and detach the button captured for focus restoration. See MediaGallery's Thumb.
 */
const Card: React.FC<{
  member: TeamMember
  onOpen: (id: string, el: HTMLElement) => void
}> = ({ member, onOpen }) => (
  <button
    className="group flex w-full flex-col items-center rounded-lg border border-border bg-card p-5 text-center transition-colors hover:border-primary"
    onClick={(e) => onOpen(member.id, e.currentTarget)}
    type="button"
  >
    <Avatar member={member} size={112} />
    <span className="mt-4 font-semibold transition-colors group-hover:text-primary">
      {member.name}
    </span>
    {member.jobTitle && (
      <span className="mt-0.5 text-sm text-content-secondary">{member.jobTitle}</span>
    )}
  </button>
)

/** Headshot, or initials on a brand-tinted disc when no photo is set. */
const Avatar: React.FC<{ member: TeamMember; size: number }> = ({ member, size }) => {
  if (member.photoSrc) {
    return (
      <span
        className="relative block overflow-hidden rounded-full bg-surface-secondary"
        style={{ height: size, width: size }}
      >
        <NextImage
          alt={member.photoAlt || member.name}
          className="object-cover"
          fill
          sizes={`${size}px`}
          src={member.photoSrc}
        />
      </span>
    )
  }
  return (
    <span
      aria-hidden="true"
      className="flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary"
      style={{ height: size, width: size, fontSize: size / 3 }}
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
