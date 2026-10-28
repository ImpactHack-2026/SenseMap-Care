import type { Metadata } from 'next'
import { DemoDataBadge } from '@/components/care/demo-data-badge'
import { ExploreShell } from '@/components/care/explore/explore-shell'
import { FacilityResults } from '@/components/care/explore/facility-results'
import { container } from '@/components/care/styles'
import { listFacilities } from '@/lib/care/data'
import { LAUNCH_CITY } from '@/lib/care/labels'
import { parseSearchParams, searchFacilities } from '@/lib/care/search'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Explore facilities',
  description: 'Search clinics and hospitals and filter by sensory conditions such as noise, lighting, and crowding.',
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = parseSearchParams(await searchParams)
  const { facilities, mode, hasMore } = await listFacilities(params.q)
  const result = searchFacilities(facilities, { ...params, q: '' })
  const hasFilters =
    Boolean(params.q) || params.types.length > 0 || params.prefs.length > 0 || params.sufficient || params.excerpts

  return (
    <div className={cn(container, 'py-10 sm:py-14')}>
      <div className="mb-10 flex flex-col gap-4 border-b border-border pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <DemoDataBadge mode={mode} />
          <span className="text-[14px] text-muted-foreground">{LAUNCH_CITY}</span>
        </div>
        <h1 className="font-serif text-4xl font-medium tracking-tight text-balance sm:text-5xl">Explore facilities</h1>
        <p className="max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
          Search by name, type, or service, and filter by the sensory conditions that matter to you. All facilities
          {mode === 'demo' ? ' Demo facilities are fictional examples.' : ' Results come from the live search provider.'}
          {hasMore && ' Showing the first page of results.'}
        </p>
      </div>

      <ExploreShell
        initialParams={params}
        resultCount={result.results.length + result.unranked.length}
      >
        <FacilityResults result={result} hasFilters={hasFilters} />
      </ExploreShell>
    </div>
  )
}
