import Link from 'next/link'
import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn('size-8', className)}>
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M14 7.5c-3.6 0-6.5 2.8-6.5 6.4 0 4.7 6.5 11.1 6.5 11.1s6.5-6.4 6.5-11.1c0-3.6-2.9-6.4-6.5-6.4Z"
        className="fill-primary-foreground"
      />
      <circle cx="14" cy="13.8" r="2.4" className="fill-primary" />
      <path
        d="M22.6 10.2a7.6 7.6 0 0 1 0 7.4M25.4 8.2a11.4 11.4 0 0 1 0 11.4"
        fill="none"
        strokeWidth="1.6"
        strokeLinecap="round"
        className="stroke-sage"
      />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/care"
      className={cn('inline-flex items-center gap-2.5 rounded-lg', className)}
      aria-label="SenseMap Care home"
    >
      <LogoMark />
      <span className="flex items-baseline gap-1.5 leading-none">
        <span className="text-[17px] font-semibold tracking-tight text-foreground">SenseMap</span>
        <span className="text-[15px] font-medium text-primary">Care</span>
      </span>
    </Link>
  )
}
