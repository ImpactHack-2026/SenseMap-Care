import Link from 'next/link'
import { ChevronRight, ExternalLink, MapPin, Phone } from 'lucide-react'
import { FACILITY_TYPE_LABELS } from '@/lib/care/labels'
import type { Facility } from '@/lib/care/types'
import { DemoDataBadge } from '../demo-data-badge'

export function FacilityHeader({ facility, lastReviewed }: { facility: Facility; lastReviewed?: string }) {
  return (
    <header className="flex flex-col gap-5">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-[14px] text-muted-foreground">
          <li>
            <Link href="/care" className="rounded hover:text-foreground hover:underline underline-offset-4">
              Care
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5" />
          </li>
          <li>
            <Link href="/care/explore" className="rounded hover:text-foreground hover:underline underline-offset-4">
              Explore
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5" />
          </li>
          <li aria-current="page" className="font-medium text-foreground">
            {facility.name}
          </li>
        </ol>
      </nav>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-sage px-3 py-1 text-[13px] font-semibold text-sage-foreground">
          {FACILITY_TYPE_LABELS[facility.type]}
        </span>
        <DemoDataBadge mode={facility.dataMode} />
      </div>

      <h1 className="font-serif text-4xl font-medium tracking-tight text-balance text-foreground sm:text-5xl">
        {facility.name}
      </h1>
      <p className="max-w-3xl text-lg leading-relaxed text-pretty text-muted-foreground">{facility.description}</p>

      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-foreground">
        <li className="flex items-center gap-2">
          <MapPin className="size-4 text-muted-foreground" aria-hidden="true" />
          {facility.neighborhood}, {facility.city}
        </li>
        {facility.phone && (
          <li>
            <a href={`tel:${facility.phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-2 hover:underline underline-offset-4">
              <Phone className="size-4 text-muted-foreground" aria-hidden="true" />
              {facility.phone}
            </a>
          </li>
        )}
        {facility.website && (
          <li>
            <a
              href={facility.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:underline underline-offset-4"
            >
              <ExternalLink className="size-4 text-muted-foreground" aria-hidden="true" />
              Website
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </li>
        )}
      </ul>
      {lastReviewed && <p className="text-[13px] text-muted-foreground">Last reviewed: {lastReviewed}</p>}
    </header>
  )
}
