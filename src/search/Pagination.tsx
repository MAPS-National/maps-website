'use client'
import {
  Pagination as PaginationComponent,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useRouter } from 'next/navigation'
import React from 'react'

/**
 * Pager for /search results. The shared components/Pagination hardcodes the
 * posts archive's /posts/page/N routes; search paginates via query params so
 * the active query is preserved (`/search?q=…&page=N`).
 */
export const SearchPagination: React.FC<{
  page: number
  query?: string
  totalPages: number
}> = ({ page, query, totalPages }) => {
  const router = useRouter()

  if (totalPages <= 1) return null

  const goTo = (target: number) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (target > 1) params.set('page', String(target))
    const qs = params.toString()
    router.push(`/search${qs ? `?${qs}` : ''}`)
  }

  const hasPrevPage = page > 1
  const hasNextPage = page < totalPages

  return (
    <div className="container my-12">
      <PaginationComponent>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious disabled={!hasPrevPage} onClick={() => goTo(page - 1)} />
          </PaginationItem>

          {page - 1 > 1 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {hasPrevPage && (
            <PaginationItem>
              <PaginationLink onClick={() => goTo(page - 1)}>{page - 1}</PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationLink isActive onClick={() => goTo(page)}>
              {page}
            </PaginationLink>
          </PaginationItem>

          {hasNextPage && (
            <PaginationItem>
              <PaginationLink onClick={() => goTo(page + 1)}>{page + 1}</PaginationLink>
            </PaginationItem>
          )}

          {page + 1 < totalPages && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext disabled={!hasNextPage} onClick={() => goTo(page + 1)} />
          </PaginationItem>
        </PaginationContent>
      </PaginationComponent>
    </div>
  )
}
