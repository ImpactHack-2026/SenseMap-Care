import { cn } from '@/lib/utils'
import { CONFIDENCE_META } from '@/lib/care/labels'
import type { ConfidenceLevel } from '@/lib/care/types'

export function ConfidenceIndicator({
  level,
  showDescription = false,
  className,
}: {
  level: ConfidenceLevel
  showDescription?: boolean
  className?: string
}) {
  const meta = CONFIDENCE_META[level]
  return (
    <div className={cn('flex items-start gap-2', className)}>
      <span className="mt-1 flex h-3 items-end gap-[3px]" aria-hidden="true">
        {[1, 2, 3].map((step) => (
          <span
            key={step}
            className={cn(
              'w-[5px] rounded-[2px]',
              step <= meta.level ? 'bg-foreground/75' : 'border border-dashed border-foreground/35',
            )}
            style={{ height: 4 + step * 3 }}
          />
        ))}
      </span>
      <span className="text-[13px] leading-snug">
        <span className="font-medium text-foreground">{meta.label}</span>
        {showDescription && <span className="text-muted-foreground"> · {meta.description}</span>}
      </span>
    </div>
  )
}
