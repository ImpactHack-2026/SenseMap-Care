import { ArrowUpRight } from 'lucide-react'
import type { EvidenceItem as EvidenceItemType } from '@/lib/care/types'
import { cn } from '@/lib/utils'

export function EvidenceItem({ item }: { item: EvidenceItemType }) {
  const contrasts = item.stance === 'contrasts'
  return (
    <li className="rounded-xl border border-border bg-background p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-[12px] font-semibold',
            contrasts ? 'bg-warning text-warning-foreground' : 'bg-sage text-sage-foreground',
          )}
        >
          {item.stance === 'unknown' ? 'Reported evidence' : contrasts ? 'Contrasting view' : 'Supporting'}
        </span>
        {item.isIllustrative && (
          <span className="rounded-full border border-dashed border-input px-2.5 py-0.5 text-[12px] font-medium text-muted-foreground">
            Illustrative excerpt
          </span>
        )}
      </div>
      <blockquote className="mt-3 border-l-2 border-primary/30 pl-4 text-[15px] leading-relaxed text-pretty text-foreground">
        &ldquo;{item.excerpt}&rdquo;
      </blockquote>
      <dl className="mt-4 grid gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Source</dt>
          <dd className="font-medium text-foreground">
            {item.sourceUrl ? (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
              >
                {item.sourceLabel}
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : (
              item.sourceLabel
            )}
            <span className="font-normal text-muted-foreground"> · {item.sourceType}</span>
          </dd>
        </div>
        {item.publishedAt && (
          <div>
            <dt className="text-muted-foreground">Date</dt>
            <dd className="font-medium text-foreground">{item.publishedAt}</dd>
          </div>
        )}
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">Why it is relevant</dt>
          <dd className="text-foreground">{item.relevance}</dd>
        </div>
      </dl>
    </li>
  )
}
