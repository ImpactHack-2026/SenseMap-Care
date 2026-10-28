import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Logo } from './logo'
import { container } from './styles'

const LINKS = [
  { href: '/care/explore', label: 'Explore' },
  { href: '/care#how-it-works', label: 'How it works' },
  { href: '/care/about', label: 'About' },
  { href: '/care/about#privacy', label: 'Data and privacy' },
  { href: '/care/about#limitations', label: 'Limitations' },
]

export function CareFooter() {
  return (
    <footer className="no-print mt-24 border-t border-border bg-secondary/60">
      <div className={cn(container, 'grid gap-10 py-12 md:grid-cols-[1.2fr_1fr]')}>
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Helping people prepare for healthcare environments with more information, more control, and fewer
            surprises.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[15px] text-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-border">
        <p className={cn(container, 'py-6 text-sm leading-relaxed text-muted-foreground')}>
          SenseMap Care is an informational planning tool. It does not diagnose, treat, or guarantee a sensory-safe
          visit. Contact facilities directly to confirm current conditions and accommodations.
        </p>
      </div>
    </footer>
  )
}
