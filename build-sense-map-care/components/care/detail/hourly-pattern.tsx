import { Clock } from 'lucide-react'
import type { HourlyPattern as HourlyPatternType } from '@/lib/care/types'
import { cn } from '@/lib/utils'
import { card } from '../styles'

const METHOD_LABELS: Record<HourlyPatternType['method'], string> = {
  measured: 'Measured',
  reported: 'Reported by visitors',
  estimated: 'Estimated',
}

function formatHour(hour: number) {
  const suffix = hour >= 12 ? 'pm' : 'am'
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h}${suffix}`
}

function levelLabel(level: number) {
  if (level >= 70) return 'Busy'
  if (level >= 40) return 'Moderate'
  return 'Quieter'
}

export function HourlyPattern({ pattern }: { pattern: HourlyPatternType | null }) {
  return (
    <section aria-labelledby="hourly-heading" className={cn(card, 'p-6 sm:p-8')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-grid size-11 place-items-center rounded-xl bg-secondary text-foreground">
            <Clock className="size-5" aria-hidden="true" />
          </span>
          <h2 id="hourly-heading" className="text-xl font-semibold text-foreground">
            Typical busyness by hour
          </h2>
        </div>
        {pattern && (
          <span className="rounded-full border border-input px-3 py-1 text-[13px] font-medium text-muted-foreground">
            {METHOD_LABELS[pattern.method]}
          </span>
        )}
      </div>

      {pattern ? (
        <>
          <p className="mt-4 text-[15px] leading-relaxed text-pretty text-foreground">{pattern.summary}</p>
          <div aria-hidden="true" className="mt-6 flex h-40 items-end gap-1.5 sm:gap-2.5">
            {pattern.points.map((point) => (
              <div key={point.hour} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div
                  className={cn(
                    'w-full rounded-t-md',
                    point.level >= 70 ? 'bg-warning-foreground/70' : point.level >= 40 ? 'bg-primary/55' : 'bg-primary/25',
                  )}
                  style={{ height: `${Math.max(point.level, 4)}%` }}
                />
                <span className="text-[11px] tabular-nums text-muted-foreground sm:text-[12px]">
                  {formatHour(point.hour)}
                </span>
              </div>
            ))}
          </div>
          <table className="sr-only">
            <caption>Typical busyness by hour ({METHOD_LABELS[pattern.method].toLowerCase()})</caption>
            <thead>
              <tr>
                <th scope="col">Hour</th>
                <th scope="col">Busyness</th>
              </tr>
            </thead>
            <tbody>
              {pattern.points.map((point) => (
                <tr key={point.hour}>
                  <th scope="row">{formatHour(point.hour)}</th>
                  <td>
                    {levelLabel(point.level)} ({point.level} out of 100)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted-foreground" aria-hidden="true">
            <span className="flex items-center gap-2">
              <span className="size-3 rounded-sm bg-primary/25" /> Quieter
            </span>
            <span className="flex items-center gap-2">
              <span className="size-3 rounded-sm bg-primary/55" /> Moderate
            </span>
            <span className="flex items-center gap-2">
              <span className="size-3 rounded-sm bg-warning-foreground/70" /> Busy
            </span>
          </div>
          <p className="mt-4 text-[13px] text-muted-foreground">
            Source: {pattern.sourceLabel}. Actual conditions on any given day may differ.
          </p>
        </>
      ) : (
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          No hourly pattern is available for this facility. Consider calling ahead to ask when it is usually quieter.
        </p>
      )}
    </section>
  )
}
