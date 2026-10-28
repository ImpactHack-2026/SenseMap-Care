export const container = 'mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-10'

const buttonBase =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-[15px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0'

export const primaryButton = `${buttonBase} bg-primary text-primary-foreground hover:bg-deep`

export const secondaryButton = `${buttonBase} border border-input bg-card text-foreground hover:bg-secondary`

export const ghostButton = `${buttonBase} text-foreground hover:bg-secondary`

export const textLink =
  'font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary'

export const card = 'rounded-2xl border border-border bg-card'

export const eyebrow = 'text-[13px] font-semibold tracking-[0.12em] text-primary uppercase'
