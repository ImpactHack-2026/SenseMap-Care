import Link from 'next/link'
import { container, primaryButton } from '@/components/care/styles'
import { cn } from '@/lib/utils'

export default function FacilityNotFound() {
  return (
    <div className={cn(container, 'flex flex-col items-start gap-5 py-20')}>
      <h1 className="font-serif text-4xl font-medium text-foreground">Facility not found</h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        We couldn&apos;t find that facility. It may have been removed, or the link may be incorrect.
      </p>
      <Link href="/care/explore" className={primaryButton}>
        Explore facilities
      </Link>
    </div>
  )
}
