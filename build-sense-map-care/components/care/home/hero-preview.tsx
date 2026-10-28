import { FACILITY_TYPE_LABELS, FACTOR_LABELS, FACTOR_ORDER } from '@/lib/care/labels'
import { computeOverall, computeOverallConfidence } from '@/lib/care/scoring'
import type { Facility } from '@/lib/care/types'
import { cn } from '@/lib/utils'
import { BandMeter } from '../band-meter'
import { ConfidenceIndicator } from '../confidence-indicator'
import { DemoDataBadge } from '../demo-data-badge'
import { ScoreRing } from '../score-ring'

export function HeroPreview({ facility }: { facility: Facility }) {
  const overall = computeOverall(facility.profile)
  const confidence = computeOverallConfidence(facility.profile)
  const factors = facility.profile!.factors

  return (
    <figure aria-labelledby="hero-preview-caption" className="relative">
      <div aria-hidden="true" className="absolute -inset-4 -z-10 rounded-[2rem] bg-sage/60 sm:-inset-6" />
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            Example profile
          </span>
          <DemoDataBadge />
        </div>

        <div className="mt-5 flex items-center gap-5">
          <ScoreRing score={overall.score} size="md" label="Example overall SenseMap Score" />
          <div className="min-w-0">
            <p className="text-[18px] font-semibold leading-snug text-foreground">{facility.name}</p>
            <p className="text-[14px] text-muted-foreground">{FACILITY_TYPE_LABELS[facility.type]}</p>
            {overall.score !== null && <BandMeter score={overall.score} className="mt-2" />}
          </div>
        </div>

        <ul className="mt-6 flex flex-col divide-y divide-border border-y border-border">
          {FACTOR_ORDER.map((key) => {
            const factor = factors[key]
            const hasScore = factor.score !== null
            return (
              <li key={key} className="flex items-center justify-between gap-4 py-3">
                <span className="text-[15px] text-foreground">{FACTOR_LABELS[key]}</span>
                <span className="flex items-center gap-3">
                  <span className="hidden sm:block">
                    <ConfidenceIndicator level={factor.confidence} />
                  </span>
                  <span
                    className={cn(
                      'min-w-9 text-right text-[15px] tabular-nums',
                      hasScore ? 'font-semibold text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {hasScore ? factor.score : '—'}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>

        <div className="mt-5 flex flex-col gap-1.5">
          <ConfidenceIndicator level={confidence} />
          <p className="text-[14px] leading-relaxed text-muted-foreground">
            Based on {overall.eligible.length} of 5 factors with enough evidence.
            {overall.missing.length > 0 &&
              ` Not included: ${overall.missing.map((k) => FACTOR_LABELS[k].toLowerCase()).join(', ')}.`}
          </p>
        </div>
      </div>
      <figcaption id="hero-preview-caption" className="sr-only">
        An example sensory profile for a fictional demo facility, showing an overall score, five factor scores, and
        confidence levels.
      </figcaption>
    </figure>
  )
}
