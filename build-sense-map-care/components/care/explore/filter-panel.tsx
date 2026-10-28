'use client'

import { FACILITY_TYPE_LABELS, PREFERENCE_LABELS } from '@/lib/care/labels'
import type { FacilityType, PreferenceKey, SearchParams } from '@/lib/care/types'
import { cn } from '@/lib/utils'

const TYPES = Object.keys(FACILITY_TYPE_LABELS) as FacilityType[]
const PREFS = Object.keys(PREFERENCE_LABELS) as PreferenceKey[]

function CheckRow({
  id,
  label,
  checked,
  onChange,
  hint,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  hint?: string
}) {
  return (
    <li>
      <label
        htmlFor={id}
        className={cn(
          'flex min-h-11 cursor-pointer items-start gap-3 rounded-lg px-2 py-2.5 text-[15px] transition-colors hover:bg-secondary',
          checked && 'bg-sage/60 hover:bg-sage',
        )}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className="mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-primary"
        />
        <span className="leading-snug">
          <span className="text-foreground">{label}</span>
          {hint && (
            <span id={`${id}-hint`} className="mt-0.5 block text-[13px] text-muted-foreground">
              {hint}
            </span>
          )}
        </span>
      </label>
    </li>
  )
}

export function FilterPanel({
  params,
  onChange,
  idPrefix,
}: {
  params: SearchParams
  onChange: (next: Partial<SearchParams>) => void
  idPrefix: string
}) {
  const toggle = <T,>(list: T[], value: T, on: boolean) =>
    on ? [...list.filter((v) => v !== value), value] : list.filter((v) => v !== value)

  return (
    <div className="flex flex-col gap-8">
      <fieldset>
        <legend className="mb-2 text-[15px] font-semibold text-foreground">Facility type</legend>
        <ul className="flex flex-col gap-0.5">
          {TYPES.map((type) => (
            <CheckRow
              key={type}
              id={`${idPrefix}-type-${type}`}
              label={FACILITY_TYPE_LABELS[type]}
              checked={params.types.includes(type)}
              onChange={(on) => onChange({ types: toggle(params.types, type, on) })}
            />
          ))}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="mb-1 text-[15px] font-semibold text-foreground">Sensory preferences</legend>
        <p className="mb-2 text-[13px] leading-relaxed text-muted-foreground">
          Facilities without enough evidence are listed separately, not hidden.
        </p>
        <ul className="flex flex-col gap-0.5">
          {PREFS.map((pref) => (
            <CheckRow
              key={pref}
              id={`${idPrefix}-pref-${pref}`}
              label={PREFERENCE_LABELS[pref]}
              checked={params.prefs.includes(pref)}
              onChange={(on) => onChange({ prefs: toggle(params.prefs, pref, on) })}
            />
          ))}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-[15px] font-semibold text-foreground">Evidence</legend>
        <ul className="flex flex-col gap-0.5">
          <CheckRow
            id={`${idPrefix}-sufficient`}
            label="Has enough evidence for an overall score"
            checked={params.sufficient}
            onChange={(on) => onChange({ sufficient: on })}
            hint="At least 3 of 5 factors have supporting evidence."
          />
          <CheckRow
            id={`${idPrefix}-excerpts`}
            label="Has evidence excerpts"
            checked={params.excerpts}
            onChange={(on) => onChange({ excerpts: on })}
          />
        </ul>
      </fieldset>
    </div>
  )
}
