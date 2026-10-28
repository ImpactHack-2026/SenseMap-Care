import { cn } from '@/lib/utils'
import { getScoreBand } from '@/lib/care/labels'

const SIZES = {
  sm: { px: 56, stroke: 6, number: 'text-[17px]', sub: 'hidden' },
  md: { px: 84, stroke: 7, number: 'text-2xl', sub: 'text-[11px]' },
  lg: { px: 168, stroke: 10, number: 'text-5xl', sub: 'text-sm' },
} as const

export function ScoreRing({
  score,
  size = 'md',
  label = 'SenseMap Score',
  className,
}: {
  score: number | null
  size?: keyof typeof SIZES
  label?: string
  className?: string
}) {
  const { px, stroke, number, sub } = SIZES[size]
  const radius = 50 - stroke / 2 - 1
  const circumference = 2 * Math.PI * radius
  const offset = score === null ? circumference : circumference * (1 - score / 100)
  const accessibleLabel =
    score === null
      ? `${label}: not enough evidence for a score`
      : `${label}: ${score} out of 100, ${getScoreBand(score).short}`

  return (
    <div
      role="img"
      aria-label={accessibleLabel}
      className={cn('relative inline-grid shrink-0 place-items-center', className)}
      style={{ width: px, height: px }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-secondary"
          strokeDasharray={score === null ? '3 4' : undefined}
          style={score === null ? { stroke: 'var(--input)' } : undefined}
        />
        {score !== null && (
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            className="stroke-primary transition-[stroke-dashoffset] duration-700 ease-out"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        )}
      </svg>
      <div className="relative flex flex-col items-center leading-none" aria-hidden="true">
        <span className={cn('font-semibold tabular-nums tracking-tight text-foreground', number)}>
          {score ?? '—'}
        </span>
        {size !== 'sm' && (
          <span className={cn('mt-1 text-muted-foreground', sub)}>{score === null ? 'No score' : '/ 100'}</span>
        )}
      </div>
    </div>
  )
}
