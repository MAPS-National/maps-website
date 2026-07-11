'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { useRouter, useSearchParams } from 'next/navigation'

export const Search: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Seed from the URL so deep links (?q=…&page=N) survive mount instead of
  // being clobbered by an initial push of the empty input.
  const [value, setValue] = useState(searchParams.get('q') ?? '')

  const debouncedValue = useDebounce(value)

  useEffect(() => {
    // Only navigate when the query actually changed; a fresh query drops any
    // ?page= so results restart from page 1.
    if (debouncedValue === (searchParams.get('q') ?? '')) return
    router.push(`/search${debouncedValue ? `?q=${encodeURIComponent(debouncedValue)}` : ''}`)
  }, [debouncedValue, router, searchParams])

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <Input
          id="search"
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
          }}
          placeholder="Search"
        />
        <button type="submit" className="sr-only">
          submit
        </button>
      </form>
    </div>
  )
}
