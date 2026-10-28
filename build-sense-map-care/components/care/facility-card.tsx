import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FACILITY_TYPE_LABELS, FACTOR_LABELS, FACTOR_ORDER } from '@/lib/care/labels'
import { computeOverall } from '@/lib/care/scoring'
import type { Facility, FactorKey } from '@/lib/care/types'
import { BandMeter } from './band-meter'
import { DemoDataBadge } from './demo-data-badge'
import { ScoreRing } from './score-ring'
import { card } from './styles'

function FactorRow({ facility, factorKey }: { facility: Facility; factorKey: FactorKey }) {
  const factor = facility.profile?.factors[factorKey]
  const eligible = factor && factor.score !== null && factor.confidence !== 'limited'
  return (
    <li className="flex items-center gap-3 text-[14px]">
      <span className="w-[68px] shrink-0 text-muted-foreground">{FACTOR_LABELS[factorKey]}</span>
      <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
        {eligible ? (
          <span className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${factor.score}%` }} />
        ) : (
          <span className="absolute inset-0 rounded-full border border-dashed border-input" />
        )}
      </span>
      <span className={cn('w-[104px] shrink-0 text-right', eligible ? 'font-semibold tabular-nums' : 'text-muted-foreground')}>
        {eligible ? factor.score : 'Limited evidence'}
      </span>
    </li>
  )
}

export function FacilityCard({ facility, headingLevel = 'h3' }: { facility: Facility; headingLevel?: 'h2' | 'h3' }) {
  const overall = computeOverall(facility.profile)
  const Heading = headingLevel
  const summaryFactors = FACTOR_ORDER.slice(0, 3)

  return (
    <article className={cn(card, 'group relative flex h-full flex-col p-6 transition-colors hover:border-primary/40 has-[a:focus-visible]:outline-3 has-[a:focus-visible]:outline-offset-3 has-[a:focus-visible]:outline-ring')}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-medium text-primary">{FACILITY_TYPE_LABELS[facility.type]}</span>
            <DemoDataBadge mode={facility.dataMode} />
          </div>
          <Heading className="text-[19px] font-semibold leading-snug text-balance text-foreground">
            <Link
              href={`/care/${facility.id}`}
              className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none"
            >
              {facility.name}
            </Link>
          </Heading>
          <p className="mt-1.5 flex items-center gap-1.5 text-[14px] text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            {facility.neighborhood} · {facility.city}
          </p>
        </div>
        <ScoreRing score={overall.score} size="md" label="Overall SenseMap Score" />
      </div>

      {facility.profile ? (
        <>
          <div className="mt-4 min-h-6">
            {overall.score !== null ? (
              <BandMeter score={overall.score} />
            ) : (
              <p className="text-[13px] font-medium text-warning-foreground">Not enough evidence for an overall score</p>
            )}
          </div>
          <ul className="mt-5 flex flex-col gap-3" aria-label="Factor summaries">
            {summaryFactors.map((key) => (
              <FactorRow key={key} facility={facility} factorKey={key} />
            ))}
          </ul>
        </>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-input bg-secondary/50 p-4">
          <p className="text-[14px] font-medium text-foreground">Sensory information not yet available</p>
          <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">
            You can still view this facility and prepare questions to ask before visiting.
          </p>
        </div>
      )}

      <div className="flex-1" />
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
        <span className="text-[13px] text-muted-foreground">
          {overall.eligible.length} of 5 factors with enough evidence
        </span>
        <span className="inline-flex items-center gap-1 text-[14px] font-medium text-primary" aria-hidden="true">
          View sensory profile
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  )
}
