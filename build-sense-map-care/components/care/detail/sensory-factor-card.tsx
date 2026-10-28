'use client'

import { useId, useState } from 'react'
import { Armchair, ChevronDown, Ear, Info, Lightbulb, Users, Wind } from 'lucide-react'
import { FACTOR_LABELS } from '@/lib/care/labels'
import { isFactorEligible } from '@/lib/care/scoring'
import type { FactorKey, SensoryFactor } from '@/lib/care/types'
import { cn } from '@/lib/utils'
import { BandMeter } from '../band-meter'
import { ConfidenceIndicator } from '../confidence-indicator'
import { card } from '../styles'
import { EvidenceItem } from './evidence-item'

const ICONS: Record<FactorKey, typeof Ear> = {
  noise: Ear,
  lighting: Lightbulb,
  crowding: Users,
  seating: Armchair,
  smells: Wind,
}

export function SensoryFactorCard({ factorKey, factor }: { factorKey: FactorKey; factor: SensoryFactor }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const Icon = ICONS[factorKey]
  const eligible = isFactorEligible(factor)
  const count = factor.evidence.length
  const label = FACTOR_LABELS[factorKey]

  return (
    <article aria-labelledby={`${panelId}-title`} className={cn(card, 'flex flex-col p-6')}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'inline-grid size-11 place-items-center rounded-xl',
              eligible ? 'bg-sage text-sage-foreground' : 'bg-secondary text-muted-foreground',
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <h3 id={`${panelId}-title`} className="text-lg font-semibold text-foreground">
            {label}
          </h3>
        </div>
        <p className="text-right">
          {eligible && factor.score !== null ? (
            <>
              <span className="text-3xl font-semibold tabular-nums text-foreground">{factor.score}</span>
              <span className="text-[14px] text-muted-foreground">/100</span>
            </>
          ) : (
            <span className="text-[14px] font-medium text-muted-foreground">No score</span>
          )}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {eligible && factor.score !== null ? (
          <BandMeter score={factor.score} />
        ) : (
          <p className="flex items-start gap-2 rounded-lg bg-secondary px-3 py-2.5 text-[14px] text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Not enough relevant evidence to estimate {label.toLowerCase()}. It is not counted in the overall score.
          </p>
        )}
        <ConfidenceIndicator level={factor.confidence} />
      </div>

      <p className="mt-4 text-[15px] leading-relaxed text-pretty text-foreground">{factor.summary}</p>

      {factor.disagreement && (
        <div className="mt-4 rounded-xl border border-warning-foreground/20 bg-warning/60 px-4 py-3">
          <p className="text-[13px] font-semibold text-warning-foreground">Sources disagree</p>
          <p className="mt-1 text-[14px] leading-relaxed text-foreground">{factor.disagreement}</p>
        </div>
      )}

      <div className="mt-auto pt-5">
        {count > 0 ? (
          <>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-border px-4 text-[15px] font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <span>{`${open ? 'Hide' : 'Show'} ${count} evidence ${count === 1 ? 'item' : 'items'}`}</span>
              <ChevronDown
                className={cn('size-4 transition-transform motion-reduce:transition-none', open && 'rotate-180')}
                aria-hidden="true"
              />
            </button>
            <ul id={panelId} hidden={!open} className="mt-3 flex flex-col gap-3">
              {factor.evidence.map((item) => (
                <EvidenceItem key={item.id} item={item} />
              ))}
            </ul>
          </>
        ) : (
          <p className="text-[14px] text-muted-foreground">No evidence excerpts available yet.</p>
        )}
      </div>
    </article>
  )
}
