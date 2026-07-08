import clsx from 'clsx'
import React from 'react'

type Variant = 'primary' | 'secondary'

interface Props {
  className?: string
  /** primary = header mark, secondary = footer mark */
  variant?: Variant
  /**
   * Force a single asset instead of auto theme-switching. Use on surfaces whose
   * background does not follow the theme (e.g. the always-dark footer).
   */
  theme?: 'light' | 'dark'
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

// Intrinsic aspect ratios from the source SVGs, scaled to a 34px tall mark.
const dims: Record<Variant, { width: number; height: number }> = {
  primary: { width: 156, height: 34 },
  secondary: { width: 122, height: 34 },
}

export const Logo = ({
  className,
  variant = 'primary',
  theme,
  loading = 'lazy',
  priority = 'low',
}: Props) => {
  const { width, height } = dims[variant]
  const base = clsx('h-[34px] w-auto', className)
  // alt lives on each <img> directly (not in the spread) so jsx-a11y can see it.
  const alt = 'MAPS National'
  const common = {
    width,
    height,
    loading,
    fetchPriority: priority,
    decoding: 'async' as const,
  }

  // Fixed surface: render a single asset (no theme switching).
  if (theme) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img {...common} alt={alt} className={base} src={`/maps-logo-${variant}-${theme}.svg`} />
    )
  }

  // Theme-aware: dark-ink mark in light themes, white mark in dark themes.
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...common}
        alt={alt}
        className={clsx(base, 'block dark:hidden')}
        src={`/maps-logo-${variant}-light.svg`}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...common}
        alt={alt}
        className={clsx(base, 'hidden dark:block')}
        src={`/maps-logo-${variant}-dark.svg`}
      />
    </>
  )
}
