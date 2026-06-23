import React from 'react'

import type { MapLocationCardsBlock as MapLocationCardsBlockProps } from '@/payload-types'

import RichText from '@/components/RichText'

type Location = NonNullable<MapLocationCardsBlockProps['locations']>[number]

/** Build the Google Maps Embed API URL, or null when we can't (no key/target). */
const buildMapSrc = (apiKey: string | undefined, query: string | undefined): string | null => {
  if (!apiKey || !query) return null
  return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(query)}`
}

const LocationCard: React.FC<{ location: Location }> = ({ location }) => (
  <li className="flex flex-col rounded-lg border border-border bg-card p-6 shadow-sm">
    <h3 className="font-serif text-xl font-semibold text-content">{location.name}</h3>
    {location.address && (
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-content-secondary">
        {location.address}
      </p>
    )}
    <dl className="mt-4 space-y-1 text-sm">
      {location.phone && (
        <div>
          <dt className="sr-only">Phone</dt>
          <dd>
            <a className="text-content-secondary hover:text-primary" href={`tel:${location.phone}`}>
              {location.phone}
            </a>
          </dd>
        </div>
      )}
      {location.email && (
        <div>
          <dt className="sr-only">Email</dt>
          <dd>
            <a
              className="text-content-secondary hover:text-primary"
              href={`mailto:${location.email}`}
            >
              {location.email}
            </a>
          </dd>
        </div>
      )}
    </dl>
    {location.linkUrl && (
      <a
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        href={location.linkUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        {location.linkLabel || 'View details'}
        <span aria-hidden="true">→</span>
      </a>
    )}
  </li>
)

/**
 * Map + Location Cards — location cards beside an optional embedded Google map.
 * The map is env-gated on NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (the #70 decision):
 * with a key it renders an Embed-API iframe; without one the block degrades to
 * cards-only. A plain iframe needs no client JS, so this stays server-only.
 */
export const MapLocationCardsBlock: React.FC<MapLocationCardsBlockProps & { id?: string }> = (
  props,
) => {
  const { enableMap, eyebrow, heading, intro, locations, mapQuery } = props

  const items = (locations || []).filter(Boolean)
  if (items.length === 0) return null

  const mapTarget = mapQuery || items[0]?.address || undefined
  const mapSrc = enableMap
    ? buildMapSrc(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, mapTarget || undefined)
    : null

  const hasHeader = eyebrow || heading || intro

  return (
    <section className="container py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        {hasHeader && (
          <div className="mb-12 max-w-2xl">
            {eyebrow && (
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
                {eyebrow}
              </p>
            )}
            {heading && (
              <h2 className="font-serif text-4xl font-semibold md:text-5xl">{heading}</h2>
            )}
            {intro && <RichText className="mt-4" data={intro} enableGutter={false} />}
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-2">
          {mapSrc && (
            <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-surface-secondary lg:aspect-auto lg:min-h-[24rem]">
              <iframe
                allowFullScreen
                className="size-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={mapSrc}
                title={heading ? `Map: ${heading}` : 'Location map'}
              />
            </div>
          )}
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {items.map((loc, i) => (
              <LocationCard key={loc.id || i} location={loc} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
