import Link from 'next/link'
import { Armchair, Ear, Lightbulb, Users } from 'lucide-react'

const QUICK = [
  { label: 'Quieter waiting areas', href: '/care/explore?pref=noise', icon: Ear },
  { label: 'Softer lighting', href: '/care/explore?pref=lighting', icon: Lightbulb },
  { label: 'Less crowding', href: '/care/explore?pref=crowding', icon: Users },
  { label: 'Comfortable seating', href: '/care/explore?pref=seating', icon: Armchair },
]

export function QuickFilters() {
  return (
    <div>
      <p id="quick-filters-label" className="mb-3 text-[14px] text-muted-foreground">
        Or start with what matters to you
      </p>
      <ul aria-labelledby="quick-filters-label" className="flex flex-wrap gap-2">
        {QUICK.map(({ label, href, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-[14px] font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-sage"
            >
              <Icon className="size-4 text-primary" aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
