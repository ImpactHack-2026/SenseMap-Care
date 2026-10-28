import { Check, Minus } from 'lucide-react'
import { FACTOR_LABELS, FACTOR_ORDER, getScoreBand } from '@/lib/care/labels'
import { computeOverall, computeOverallConfidence, isFactorEligible } from '@/lib/care/scoring'
import type { CareSensoryProfile } from '@/lib/care/types'
import { cn } from '@/lib/utils'
import { BandMeter } from '../band-meter'
import { ConfidenceIndicator } from '../confidence-indicator'
import { ScoreRing } from '../score-ring'
import { card } from '../styles'
import { ScoreExplanation } from './score-explanation'

export function OverallSummary({ profile }: { profile: CareSensoryProfile }) {
  const overall = computeOverall(profile)
  const confidence = computeOverallConfidence(profile)
  const band = overall.score !== null ? getScoreBand(overall.score) : null

  return (
    <section aria-labelledby="overall-heading" className={cn(card, 'p-6 sm:p-8')}>
      <h2 id="overall-heading" className="sr-only">
        Overall SenseMap Score
      </h2>
      <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-center md:gap-10">
        <div className="flex justify-center md:justify-start">
          <ScoreRing score={overall.score} size="lg" label="Overall SenseMap Score" />
        </div>
        <div className="flex flex-col gap-4">
          {band ? (
            <>
              <p className="font-serif text-2xl font-medium text-balance text-foreground sm:text-3xl">
                {band.description}
              </p>
              <BandMeter score={overall.score!} />
            </>
          ) : (
            <p className="font-serif text-2xl font-medium text-balance text-foreground sm:text-3xl">
              Not enough evidence for an overall score
            </p>
          )}
          <ConfidenceIndicator level={confidence} />
          <p className="text-[15px] leading-relaxed text-pretty text-muted-foreground">{profile.overallExplanation}</p>
          <div>
            <ScoreExplanation profile={profile} overall={overall} />
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <h3 className="text-[15px] font-semibold text-foreground">Evidence coverage</h3>
        <p className="mt-1 text-[14px] text-muted-foreground">
          {overall.eligible.length} of 5 factors have enough evidence to estimate.
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {FACTOR_ORDER.map((key) => {
            const ok = isFactorEligible(profile.factors[key])
            const count = profile.factors[key].evidence.length
            return (
              <li
                key={key}
                className={cn(
                  'flex flex-col gap-1 rounded-xl px-3.5 py-3',
                  ok ? 'bg-sage/70' : 'border border-dashed border-input bg-transparent',
                )}
              >
                <span className="flex items-center gap-1.5 text-[14px] font-semibold text-foreground">
                  {ok ? (
                    <Check className="size-4 text-primary" aria-hidden="true" />
                  ) : (
                    <Minus className="size-4 text-muted-foreground" aria-hidden="true" />
                  )}
                  {FACTOR_LABELS[key]}
                </span>
                <span className="text-[13px] text-muted-foreground">
                  {ok ? 'Included' : 'Limited evidence'} · {count} {count === 1 ? 'item' : 'items'}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
