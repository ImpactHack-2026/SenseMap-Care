'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { Loader2, Search, SlidersHorizontal, X } from 'lucide-react'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { FACILITY_TYPE_LABELS, PREFERENCE_LABELS, SORT_LABELS } from '@/lib/care/labels'
import { serializeSearchParams } from '@/lib/care/search'
import type { SearchParams, SortKey } from '@/lib/care/types'
import { cn } from '@/lib/utils'
import { primaryButton, secondaryButton } from '../styles'
import { FilterPanel } from './filter-panel'

const EMPTY: SearchParams = { q: '', types: [], prefs: [], sufficient: false, excerpts: false, sort: 'relevant' }

export function ExploreShell({
  initialParams,
  resultCount,
  children,
}: {
  initialParams: SearchParams
  resultCount: number
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [params, setParams] = useState(initialParams)
  const [query, setQuery] = useState(initialParams.q)
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Adopt URL changes that did not originate here (e.g. links, back/forward) without
  // remounting, so typing focus and the open filter sheet are preserved.
  const incoming = serializeSearchParams(initialParams)
  const [lastIncoming, setLastIncoming] = useState(incoming)
  if (incoming !== lastIncoming) {
    setLastIncoming(incoming)
    if (incoming !== serializeSearchParams(params)) {
      setParams(initialParams)
      setQuery(initialParams.q)
    }
  }

  const commit = (next: SearchParams) => {
    setParams(next)
    startTransition(() => {
      router.replace(`${pathname}${serializeSearchParams(next)}`, { scroll: false })
    })
  }

  const update = (patch: Partial<SearchParams>) => commit({ ...params, q: query, ...patch })

  const onQueryChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => commit({ ...params, q: value }), 350)
  }

  const clearAll = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setQuery('')
    commit(EMPTY)
  }

  const activeCount =
    params.types.length + params.prefs.length + (params.sufficient ? 1 : 0) + (params.excerpts ? 1 : 0)

  const chips: { key: string; label: string; remove: () => void }[] = [
    ...params.types.map((t) => ({
      key: `type-${t}`,
      label: FACILITY_TYPE_LABELS[t],
      remove: () => update({ types: params.types.filter((v) => v !== t) }),
    })),
    ...params.prefs.map((p) => ({
      key: `pref-${p}`,
      label: PREFERENCE_LABELS[p],
      remove: () => update({ prefs: params.prefs.filter((v) => v !== p) }),
    })),
    ...(params.sufficient
      ? [{ key: 'sufficient', label: 'Enough evidence for a score', remove: () => update({ sufficient: false }) }]
      : []),
    ...(params.excerpts
      ? [{ key: 'excerpts', label: 'Has evidence excerpts', remove: () => update({ excerpts: false }) }]
      : []),
  ]

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-12">
      <aside aria-labelledby="filters-heading" className="hidden lg:block">
        <div className="sticky top-24 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 id="filters-heading" className="text-lg font-semibold text-foreground">
              Filters
            </h2>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="rounded-md px-2 py-1 text-[14px] font-medium text-primary underline-offset-4 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          <FilterPanel params={params} onChange={update} idPrefix="desktop" />
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <form
            role="search"
            className="flex-1"
            onSubmit={(e) => {
              e.preventDefault()
              if (debounceRef.current) clearTimeout(debounceRef.current)
              commit({ ...params, q: query })
            }}
          >
            <label htmlFor="explore-search" className="mb-1.5 block text-[14px] font-medium text-foreground">
              Search facilities
            </label>
            <div className="flex min-h-12 items-center gap-3 rounded-xl border border-input bg-card px-3.5 focus-within:border-primary focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-ring">
              <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                id="explore-search"
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Name, type, or service"
                autoComplete="off"
                className="w-full min-w-0 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              {isPending ? (
                <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden="true" />
              ) : (
                query && (
                  <button
                    type="button"
                    onClick={() => onQueryChange('')}
                    className="-mr-1.5 inline-grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <X className="size-4" aria-hidden="true" />
                    <span className="sr-only">Clear search</span>
                  </button>
                )
              )}
            </div>
          </form>

          <div className="flex gap-3">
            <Sheet>
              <SheetTrigger className={cn(secondaryButton, 'flex-1 lg:hidden')}>
                <SlidersHorizontal aria-hidden="true" />
                Filters
                {activeCount > 0 && (
                  <span className="inline-grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[12px] leading-5 text-primary-foreground">
                    {activeCount}
                    <span className="sr-only"> active</span>
                  </span>
                )}
              </SheetTrigger>
              <SheetContent
                side="bottom"
                showCloseButton={false}
                className="max-h-[88dvh] gap-0 rounded-t-3xl bg-background p-0"
              >
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <div>
                    <SheetTitle className="text-lg font-semibold">Filters</SheetTitle>
                    <SheetDescription className="sr-only">Results update as you change filters.</SheetDescription>
                  </div>
                  <SheetClose
                    className="inline-grid size-11 place-items-center rounded-xl hover:bg-secondary"
                    aria-label="Close filters"
                  >
                    <X className="size-5" aria-hidden="true" />
                  </SheetClose>
                </div>
                <div className="overflow-y-auto px-4 py-5">
                  <FilterPanel params={params} onChange={update} idPrefix="mobile" />
                </div>
                <div className="flex gap-3 border-t border-border p-4">
                  <button type="button" onClick={clearAll} className={cn(secondaryButton, 'flex-1')}>
                    Clear all
                  </button>
                  <SheetClose className={cn(primaryButton, 'flex-[1.4]')}>
                    {isPending ? 'Updating…' : `Show ${resultCount} ${resultCount === 1 ? 'result' : 'results'}`}
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex-1 sm:flex-none">
              <label htmlFor="explore-sort" className="mb-1.5 block text-[14px] font-medium text-foreground sm:sr-only lg:not-sr-only">
                Sort by
              </label>
              <select
                id="explore-sort"
                value={params.sort}
                onChange={(e) => update({ sort: e.target.value as SortKey })}
                className="min-h-12 w-full cursor-pointer rounded-xl border border-input bg-card px-3.5 text-[15px] text-foreground sm:w-auto"
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <option key={key} value={key}>
                    {SORT_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[14px] text-muted-foreground">Active filters:</span>
            <ul className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <li key={chip.key}>
                  <button
                    type="button"
                    onClick={chip.remove}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-primary/25 bg-sage px-3 text-[13px] font-medium text-sage-foreground hover:border-primary/50"
                  >
                    {chip.label}
                    <X className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">(remove filter)</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div
          aria-busy={isPending}
          className={cn('mt-8 transition-opacity duration-200', isPending && 'opacity-55')}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
