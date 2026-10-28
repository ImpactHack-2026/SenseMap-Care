import { cn } from '@/lib/utils'
import { getScoreBand } from '@/lib/care/labels'

/** A five-step meter that conveys the score band by position and count, not colour alone. */
export function BandMeter({ score, className }: { score: number; className?: string }) {
  const { band, short } = getScoreBand(score)
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="flex items-end gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((step) => (
          <span
            key={step}
            className={cn(
              'w-1.5 rounded-sm',
              step <= band ? 'bg-primary' : 'border border-input bg-transparent',
            )}
            style={{ height: 4 + step * 2.5 }}
          />
        ))}
      </span>
      <span className="text-[13px] font-medium text-foreground">
        {short}
        <span className="sr-only">, band {band} of 5</span>
      </span>
    </span>
  )
}
