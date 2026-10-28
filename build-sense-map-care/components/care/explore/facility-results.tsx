import Link from 'next/link'
import { HelpCircle, SearchX } from 'lucide-react'
import type { SearchResult } from '@/lib/care/search'
import { cn } from '@/lib/utils'
import { FacilityCard } from '../facility-card'
import { card, secondaryButton } from '../styles'

export function FacilityResults({ result, hasFilters }: { result: SearchResult; hasFilters: boolean }) {
  const { results, unranked, excludedCount } = result
  const total = results.length + unranked.length

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p role="status" aria-live="polite" className="text-[15px] text-foreground">
          <span className="font-semibold">{results.length}</span>{' '}
          {results.length === 1 ? 'facility matches' : 'facilities match'}
          {unranked.length > 0 && (
            <span className="text-muted-foreground">
              {' '}
              · {unranked.length} more with not enough evidence to compare
            </span>
          )}
        </p>
        {excludedCount > 0 && (
          <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
            {excludedCount} {excludedCount === 1 ? 'facility is' : 'facilities are'} hidden because available evidence
            suggests {excludedCount === 1 ? 'it does' : 'they do'} not match your preferences.
          </p>
        )}
      </div>

      {total === 0 && (
        <div className={cn(card, 'flex flex-col items-center px-6 py-14 text-center')}>
          <span className="inline-grid size-14 place-items-center rounded-2xl bg-secondary text-muted-foreground">
            <SearchX className="size-6" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-lg font-semibold text-foreground">No facilities match</h2>
          <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Try a different search term or remove some filters.
          </p>
          {hasFilters && (
            <Link href="/care/explore" className={cn(secondaryButton, 'mt-6')}>
              Clear search and filters
            </Link>
          )}
        </div>
      )}

      {results.length > 0 && (
        <section aria-labelledby="results-heading">
          <h2 id="results-heading" className="sr-only">
            Matching facilities
          </h2>
          <ul className="grid gap-6 md:grid-cols-2">
            {results.map((facility) => (
              <li key={facility.id}>
                <FacilityCard facility={facility} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {unranked.length > 0 && (
        <section aria-labelledby="unranked-heading" className="flex flex-col gap-5">
          <div className="flex items-start gap-3 rounded-2xl border border-dashed border-input bg-secondary/50 p-5">
            <HelpCircle className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <h2 id="unranked-heading" className="text-[16px] font-semibold text-foreground">
                Not enough evidence to compare
              </h2>
              <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">
                These facilities may still suit you, but there isn&apos;t enough information to tell. They are listed
                here rather than ranked or hidden.
              </p>
            </div>
          </div>
          <ul className="grid gap-6 md:grid-cols-2">
            {unranked.map(({ facility, reason }) => (
              <li key={facility.id} className="flex flex-col gap-2">
                <FacilityCard facility={facility} />
                <p className="px-1 text-[13px] text-muted-foreground">{reason}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
