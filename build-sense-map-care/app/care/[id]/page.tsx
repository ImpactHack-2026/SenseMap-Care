import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, FileQuestion } from 'lucide-react'
import { FacilityHeader } from '@/components/care/detail/facility-header'
import { HourlyPattern } from '@/components/care/detail/hourly-pattern'
import { OverallSummary } from '@/components/care/detail/overall-summary'
import { SensoryFactorCard } from '@/components/care/detail/sensory-factor-card'
import { WaitingOptions } from '@/components/care/detail/waiting-options'
import { card, container, secondaryButton } from '@/components/care/styles'
import { getFacility } from '@/lib/care/data'
import { FACTOR_ORDER } from '@/lib/care/labels'
import { cn } from '@/lib/utils'

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const facility = await getFacility(id)
  if (!facility) return { title: 'Facility not found' }
  return {
    title: `${facility.name} — sensory profile`,
    description: `Evidence-based sensory profile for ${facility.name} in ${facility.neighborhood}, ${facility.city}: noise, lighting, crowding, seating, and smells.`,
  }
}

export default async function FacilityPage({ params }: PageProps) {
  const { id } = await params
  const facility = await getFacility(id)
  if (!facility) notFound()

  const profile = facility.profile

  return (
    <div className={cn(container, 'flex flex-col gap-10 py-10 sm:py-14')}>
      <FacilityHeader facility={facility} lastReviewed={profile?.lastReviewedLabel} />

      {profile ? (
        <>
          <OverallSummary profile={profile} />

          <section aria-labelledby="factors-heading" className="flex flex-col gap-5">
            <div>
              <h2 id="factors-heading" className="font-serif text-3xl font-medium text-foreground">
                Sensory factors
              </h2>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                Each factor is estimated separately from the evidence we found. Open a factor to read the excerpts
                behind it.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {FACTOR_ORDER.map((key) => (
                <SensoryFactorCard key={key} factorKey={key} factor={profile.factors[key]} />
              ))}
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-2">
            <HourlyPattern pattern={profile.hourly} />
            <WaitingOptions profile={profile} />
          </div>
        </>
      ) : (
        <section className={cn(card, 'flex flex-col items-start gap-4 p-8')}>
          <FileQuestion className="size-8 text-muted-foreground" aria-hidden="true" />
          <h2 className="font-serif text-2xl font-medium text-foreground">No sensory profile yet</h2>
          <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            We have not found enough relevant evidence to describe this facility. Calling ahead to ask about quieter
            times and waiting options can help.
          </p>
        </section>
      )}

      <p className="max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
        SenseMap Care summarizes publicly available information and is not medical advice. Conditions change — confirm
        accommodations directly with the facility before your visit.
      </p>

      <div>
        <Link href="/care/explore" className={secondaryButton}>
          <ArrowLeft aria-hidden="true" />
          Back to explore
        </Link>
      </div>
    </div>
  )
}
