import { CircleCheck, CircleHelp, DoorOpen } from 'lucide-react'
import type { CareSensoryProfile } from '@/lib/care/types'
import { cn } from '@/lib/utils'
import { card } from '../styles'

export function WaitingOptions({ profile }: { profile: CareSensoryProfile }) {
  const { waitingOptions, arrivalProcess } = profile

  return (
    <section aria-labelledby="waiting-heading" className={cn(card, 'p-6 sm:p-8')}>
      <div className="flex items-center gap-3">
        <span className="inline-grid size-11 place-items-center rounded-xl bg-secondary text-foreground">
          <DoorOpen className="size-5" aria-hidden="true" />
        </span>
        <h2 id="waiting-heading" className="text-xl font-semibold text-foreground">
          Arrival and waiting options
        </h2>
      </div>

      <div className="mt-5">
        <h3 className="text-[14px] font-semibold text-muted-foreground">Arrival process</h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-pretty text-foreground">
          {arrivalProcess ?? 'No information about the arrival process is available yet.'}
        </p>
      </div>

      <div className="mt-6">
        <h3 className="text-[14px] font-semibold text-muted-foreground">Accommodations</h3>
        {waitingOptions.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-2.5">
            {waitingOptions.map((option) => {
              const documented = option.status === 'documented'
              return (
                <li key={option.id} className="flex items-start gap-3 rounded-xl bg-background px-4 py-3">
                  {documented ? (
                    <CircleCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  ) : (
                    <CircleHelp className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  )}
                  <div>
                    <p className="text-[15px] font-medium text-foreground">
                      {option.label}
                      <span className={cn('ml-2 text-[13px] font-normal', documented ? 'text-primary' : 'text-muted-foreground')}>
                        {documented ? 'Documented' : 'Not confirmed — ask the facility'}
                      </span>
                    </p>
                    {option.detail && (
                      <p className="mt-0.5 text-[14px] leading-relaxed text-muted-foreground">{option.detail}</p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="mt-1.5 text-[15px] text-muted-foreground">No accommodation information is available yet.</p>
        )}
      </div>
    </section>
  )
}
