import { ClipboardList, FileSearch, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { container, eyebrow } from '../styles'

const STEPS = [
  {
    icon: Search,
    title: 'Search for a facility',
    body: 'Look up a clinic, hospital, or urgent care by name, type, or service, and filter by the sensory conditions that matter to you.',
  },
  {
    icon: FileSearch,
    title: 'Understand the evidence',
    body: 'See noise, lighting, crowding, seating, and smells separately — each with a confidence level and the excerpts behind it.',
  },
  {
    icon: ClipboardList,
    title: 'Prepare for your visit',
    body: 'Build a personal checklist and questions to ask the facility, based on what is known and what still needs confirming.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="scroll-mt-24 py-20 sm:py-24">
      <div className={container}>
        <div className="max-w-2xl">
          <p className={eyebrow}>How it works</p>
          <h2 id="how-heading" className="mt-3 font-serif text-3xl font-medium tracking-tight text-balance sm:text-4xl">
            From uncertainty to a plan, in three steps
          </h2>
        </div>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }, index) => (
            <li key={title} className={cn('relative rounded-2xl border border-border bg-card p-7')}>
              <div className="flex items-center justify-between">
                <span className="inline-grid size-12 place-items-center rounded-xl bg-sage text-sage-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="font-serif text-3xl text-muted-foreground/60" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">
                <span className="sr-only">Step {index + 1}: </span>
                {title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
