'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Accessibility, ArrowRight, Menu, Search, X } from 'lucide-react'
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Logo } from './logo'
import { container, primaryButton } from './styles'

const NAV = [
  { href: '/care/explore', label: 'Explore' },
  { href: '/care#how-it-works', label: 'How it works' },
  { href: '/care/about', label: 'About' },
]

export function CareHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) => !href.includes('#') && pathname.startsWith(href)

  return (
    <header className="no-print sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className={cn(container, 'flex h-16 items-center justify-between gap-4')}>
        <Logo />

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={cn(
                    'rounded-lg px-3.5 py-2 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
                    'aria-[current=page]:text-foreground aria-[current=page]:underline aria-[current=page]:decoration-primary aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-[10px]',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <span className="hidden items-center gap-1.5 text-[13px] font-medium text-muted-foreground lg:inline-flex">
            <Accessibility className="size-4 text-primary" aria-hidden="true" />
            Accessibility-first
          </span>
          <Link href="/care/explore" className={cn(primaryButton, 'min-h-10 px-4 text-sm')}>
            Explore facilities
          </Link>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <Link
            href="/care/explore"
            className="inline-grid size-11 place-items-center rounded-xl text-foreground hover:bg-secondary"
          >
            <Search className="size-5" aria-hidden="true" />
            <span className="sr-only">Search facilities</span>
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="inline-grid size-11 place-items-center rounded-xl text-foreground hover:bg-secondary"
              aria-label="Open menu"
            >
              <Menu className="size-5" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right" showCloseButton={false} className="w-[88%] max-w-sm gap-0 bg-background p-0">
              <div className="flex h-16 items-center justify-between border-b border-border px-5">
                <SheetTitle className="text-base font-semibold">Menu</SheetTitle>
                <SheetClose
                  className="inline-grid size-11 place-items-center rounded-xl hover:bg-secondary"
                  aria-label="Close menu"
                >
                  <X className="size-5" aria-hidden="true" />
                </SheetClose>
              </div>
              <nav aria-label="Mobile" className="flex flex-col p-3">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className="flex min-h-12 items-center justify-between rounded-xl px-3 text-base font-medium text-foreground hover:bg-secondary aria-[current=page]:bg-sage"
                  >
                    {item.label}
                    <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
                  </Link>
                ))}
              </nav>
              <div className="mt-auto border-t border-border p-5">
                <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Accessibility className="size-4 text-primary" aria-hidden="true" />
                  Accessibility-first planning tool
                </p>
                <Link href="/care/explore" onClick={() => setOpen(false)} className={cn(primaryButton, 'w-full')}>
                  Explore facilities
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
