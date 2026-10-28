'use client'

import { Calculator } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FACTOR_LABELS, FACTOR_ORDER, FACTOR_WEIGHTS } from '@/lib/care/labels'
import type { OverallResult } from '@/lib/care/scoring'
import type { CareSensoryProfile } from '@/lib/care/types'
import { cn } from '@/lib/utils'
import { secondaryButton } from '../styles'

export function ScoreExplanation({ profile, overall }: { profile: CareSensoryProfile; overall: OverallResult }) {
  return (
    <Dialog>
      <DialogTrigger className={cn(secondaryButton, 'w-full sm:w-auto')}>
        <Calculator aria-hidden="true" />
        How this score is calculated
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-medium">How this score is calculated</DialogTitle>
          <DialogDescription className="text-[15px] leading-relaxed">
            The overall score is a weighted average of the factors that have enough evidence. Factors with limited
            evidence are left out, and the remaining weights are scaled up to add to 100%.
          </DialogDescription>
        </DialogHeader>

        <table className="mt-2 w-full text-[14px]">
          <caption className="sr-only">Factor weights used for this facility</caption>
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th scope="col" className="py-2 font-medium">Factor</th>
              <th scope="col" className="py-2 text-right font-medium">Score</th>
              <th scope="col" className="py-2 text-right font-medium">Base weight</th>
              <th scope="col" className="py-2 text-right font-medium">Used weight</th>
            </tr>
          </thead>
          <tbody>
            {FACTOR_ORDER.map((key) => {
              const used = overall.effectiveWeights[key]
              const factor = profile.factors[key]
              return (
                <tr key={key} className={cn('border-b border-border', used === undefined && 'text-muted-foreground')}>
                  <th scope="row" className="py-2.5 text-left font-medium">
                    {FACTOR_LABELS[key]}
                  </th>
                  <td className="py-2.5 text-right tabular-nums">
                    {used !== undefined && factor.score !== null ? factor.score : '—'}
                  </td>
                  <td className="py-2.5 text-right tabular-nums">{Math.round(FACTOR_WEIGHTS[key] * 100)}%</td>
                  <td className="py-2.5 text-right tabular-nums">
                    {used !== undefined ? `${Math.round(used * 100)}%` : 'Not used'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="mt-2 flex flex-col gap-3 text-[14px] leading-relaxed text-muted-foreground">
          <p>
            An overall score is only shown when at least 3 of the 5 factors have enough evidence. Higher scores mean
            evidence suggests calmer or more favorable conditions — not that a visit will be comfortable for everyone.
          </p>
          <p>
            Scores summarize available information. They are not medical advice and do not account for your personal
            needs, the time of your visit, or recent changes at the facility.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
