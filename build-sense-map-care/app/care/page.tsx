import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { FacilityCard } from '@/components/care/facility-card'
import { HeroPreview } from '@/components/care/home/hero-preview'
import { HeroSearch } from '@/components/care/home/hero-search'
import { HowItWorks } from '@/components/care/home/how-it-works'
import { QuickFilters } from '@/components/care/home/quick-filters'
import { TrustSection } from '@/components/care/home/trust-section'
import { container, eyebrow, textLink } from '@/components/care/styles'
import { listFacilities } from '@/lib/care/data'
import { cn } from '@/lib/utils'

export default async function CareHomePage() {
  const facilities = await listFacilities()
  const previewFacility = facilities.find((f) => f.id === 'willow-bend-family-clinic') ?? facilities[0]
  const featured = facilities.filter((f) => f.profile).slice(0, 3)

  return (
    <>
      <section aria-labelledby="hero-heading" className="overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className={cn(container, 'grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20')}>
          <div className="flex flex-col gap-8">
            <div>
              <p className={eyebrow}>Sensory information for healthcare visits</p>
              <h1
                id="hero-heading"
                className="mt-4 font-serif text-[2.6rem] leading-[1.08] font-medium tracking-tight text-balance text-foreground sm:text-6xl"
              >
                Know what to expect before you arrive.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
                Explore sensory information about clinics and hospitals, understand what the available evidence says,
                and prepare for your visit with greater confidence.
              </p>
            </div>
            <HeroSearch />
            <QuickFilters />
          </div>
          <div className="mx-auto w-full max-w-md lg:max-w-none">
            <HeroPreview facility={previewFacility} />
          </div>
        </div>
      </section>

      <section aria-labelledby="featured-heading" className="border-y border-border bg-card/60 py-20 sm:py-24">
        <div className={container}>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className={eyebrow}>Demo facilities</p>
              <h2
                id="featured-heading"
                className="mt-3 font-serif text-3xl font-medium tracking-tight text-balance sm:text-4xl"
              >
                See how sensory profiles work
              </h2>
              <p className="mt-3 text-[16px] leading-relaxed text-muted-foreground">
                These fictional facilities show the range of what you might find — from well-documented profiles to
                ones with limited evidence.
              </p>
            </div>
            <Link href="/care/explore" className={cn(textLink, 'inline-flex shrink-0 items-center gap-1.5')}>
              Explore all facilities
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((facility) => (
              <li key={facility.id}>
                <FacilityCard facility={facility} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <HowItWorks />
      <TrustSection />
    </>
  )
}
