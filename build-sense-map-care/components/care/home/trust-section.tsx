import Link from 'next/link'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { container, eyebrow, textLink } from '../styles'

const IS = [
  'A way to explore available sensory information before a visit',
  'Clear about how much evidence supports each estimate',
  'A starting point for questions to ask the facility directly',
]

const IS_NOT = [
  'A diagnosis, treatment, or medical recommendation',
  'A guarantee that any visit will be sensory-safe',
  'A replacement for confirming details with the facility',
]

export function TrustSection() {
  return (
    <section aria-labelledby="trust-heading" className="py-20 sm:py-24">
      <div className={container}>
        <div className="grid gap-10 rounded-3xl bg-deep p-8 text-primary-foreground sm:p-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div>
            <p className={cn(eyebrow, 'text-sage')}>Honest by design</p>
            <h2 id="trust-heading" className="mt-3 font-serif text-3xl font-medium tracking-tight text-balance sm:text-4xl">
              We show what we know — and what we don&apos;t
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed text-primary-foreground/80">
              Every score comes with a confidence level and the evidence behind it. When there isn&apos;t enough
              information, we say so instead of guessing.
            </p>
            <p className="mt-6">
              <Link href="/care/about" className={cn(textLink, 'text-sage decoration-sage/50 hover:decoration-sage')}>
                Read about our methods and limitations
              </Link>
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl bg-primary-foreground/[0.06] p-6 ring-1 ring-primary-foreground/10">
              <h3 className="text-[15px] font-semibold">SenseMap Care is</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {IS.map((item) => (
                  <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-primary-foreground/85">
                    <Check className="mt-1 size-4 shrink-0 text-sage" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-primary-foreground/[0.06] p-6 ring-1 ring-primary-foreground/10">
              <h3 className="text-[15px] font-semibold">SenseMap Care is not</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {IS_NOT.map((item) => (
                  <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-primary-foreground/85">
                    <Minus className="mt-1 size-4 shrink-0 text-primary-foreground/60" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
