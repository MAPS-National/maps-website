import { cn } from '@/utilities/ui'
import React from 'react'

import { Card, CardPostData } from '@/components/Card'

import { CollectionArchiveSlider } from './CollectionArchiveSlider'

// Search results mix collections, so each item may carry the collection it
// came from; plain post archives omit it and fall back to 'posts'.
export type ArchiveItem = CardPostData & { relationTo?: 'pages' | 'posts' }

export type Props = {
  display?: 'grid' | 'slider'
  posts: ArchiveItem[]
  showRegister?: boolean
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { display = 'grid', posts, showRegister } = props

  if (display === 'slider') {
    return <CollectionArchiveSlider posts={posts} showRegister={showRegister} />
  }

  return (
    <div className={cn('container')}>
      <div>
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {posts?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div className="col-span-4" key={index}>
                  <Card
                    className="h-full"
                    doc={result}
                    relationTo={result.relationTo ?? 'posts'}
                    showCategories
                    showRegister={showRegister}
                  />
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}
