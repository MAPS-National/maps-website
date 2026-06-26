'use client'

import React from 'react'

import { Carousel } from '@/components/Carousel'
import { Card, type CardPostData } from '@/components/Card'

/**
 * Slider treatment for the Archive feed (home "Latest Updates"). Reuses the
 * shared Carousel primitive — a scroll-snap track with prev/next controls. No
 * autoplay here (news cards), unlike the testimonial/gallery sliders.
 */
export const CollectionArchiveSlider: React.FC<{ posts: CardPostData[]; showRegister?: boolean }> = ({
  posts,
  showRegister,
}) => {
  const items = posts?.filter((p): p is CardPostData => typeof p === 'object' && p !== null) ?? []
  if (items.length === 0) return null

  return (
    <div className="container">
      <Carousel ariaLabel="Latest updates" slideClassName="w-[78%] sm:w-[46%] lg:w-[31%]">
        {items.map((result, index) => (
          <Card className="h-full" doc={result} key={index} relationTo="posts" showCategories showRegister={showRegister} />
        ))}
      </Carousel>
    </div>
  )
}
