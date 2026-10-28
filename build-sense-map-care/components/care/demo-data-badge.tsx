import { FlaskConical, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DataMode } from '@/lib/care/types'

export function DemoDataBadge({
  mode = 'demo',
  label,
  className,
}: {
  mode?: DataMode
  label?: string
  className?: string
}) {
  const isDemo = mode === 'demo'
  const Icon = isDemo ? FlaskConical : ShieldCheck
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[13px] font-medium leading-none',
        isDemo
          ? 'border-dashed border-lavender-foreground/40 bg-lavender text-lavender-foreground'
          : 'border-primary/30 bg-sage text-sage-foreground',
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label ?? (isDemo ? 'Demo data' : 'Live data')}
    </span>
  )
}
