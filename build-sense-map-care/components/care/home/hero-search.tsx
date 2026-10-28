import { Search } from 'lucide-react'
import { LAUNCH_CITY } from '@/lib/care/labels'
import { cn } from '@/lib/utils'
import { primaryButton } from '../styles'

export function HeroSearch() {
  return (
    <form action="/care/explore" method="get" role="search" className="w-full">
      <label htmlFor="hero-search" className="mb-2 block text-[15px] font-medium text-foreground">
        Search clinics and hospitals
      </label>
      <div className="flex flex-col gap-3 rounded-2xl border border-input bg-card p-2 shadow-[0_1px_0_rgba(36,53,47,0.04)] focus-within:border-primary sm:flex-row sm:items-center">
        <div className="flex min-h-12 flex-1 items-center gap-3 px-3">
          <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            id="hero-search"
            name="q"
            type="search"
            autoComplete="off"
            placeholder="Facility name, type, or service"
            aria-describedby="hero-search-hint"
            className="w-full min-w-0 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <button type="submit" className={cn(primaryButton, 'sm:min-w-40')}>
          Search facilities
        </button>
      </div>
      <p id="hero-search-hint" className="mt-2.5 text-[14px] text-muted-foreground">
        Currently showing demo facilities in {LAUNCH_CITY}.
      </p>
    </form>
  )
}
