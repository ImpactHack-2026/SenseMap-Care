import type { ConfidenceLevel, FacilityType, FactorKey, PreferenceKey, SortKey } from './types'

export const LAUNCH_CITY = 'Fremont, California'

export const FACTOR_ORDER: FactorKey[] = ['noise', 'lighting', 'crowding', 'seating', 'smells']

export const FACTOR_LABELS: Record<FactorKey, string> = {
  noise: 'Noise',
  lighting: 'Lighting',
  crowding: 'Crowding',
  seating: 'Seating',
  smells: 'Smells',
}

export const FACTOR_WEIGHTS: Record<FactorKey, number> = {
  noise: 0.3,
  lighting: 0.25,
  crowding: 0.2,
  seating: 0.15,
  smells: 0.1,
}

export const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  clinic: 'Clinic',
  hospital: 'Hospital',
  'urgent-care': 'Urgent care',
  outpatient: 'Outpatient center',
  other: 'Other healthcare facility',
}

export const PREFERENCE_LABELS: Record<PreferenceKey, string> = {
  noise: 'Prefer quieter conditions',
  lighting: 'Prefer softer lighting',
  crowding: 'Prefer less crowding',
  seating: 'Prefer comfortable seating',
  smells: 'Prefer fewer strong smells',
  waiting: 'Prefer clear waiting information',
}

export const SORT_LABELS: Record<SortKey, string> = {
  relevant: 'Most relevant',
  overall: 'Highest supported overall score',
  evidence: 'Most evidence available',
  alpha: 'Alphabetical',
}

export const CONFIDENCE_META: Record<
  ConfidenceLevel,
  { label: string; description: string; level: number }
> = {
  high: {
    label: 'High confidence',
    description: 'Consistent, relevant evidence from several items. Conditions can still vary.',
    level: 3,
  },
  medium: {
    label: 'Medium confidence',
    description: 'Several relevant mentions, but conditions may vary.',
    level: 2,
  },
  low: {
    label: 'Low confidence',
    description: 'Few or inconsistent mentions. Treat as a rough indication.',
    level: 1,
  },
  limited: {
    label: 'Limited evidence',
    description: 'Not enough relevant evidence to estimate this factor.',
    level: 0,
  },
}

export type ScoreBand = { band: 1 | 2 | 3 | 4 | 5; short: string; description: string }

export function getScoreBand(score: number): ScoreBand {
  if (score >= 80)
    return {
      band: 5,
      short: 'Relatively calm',
      description: 'Evidence suggests relatively calm or favorable conditions.',
    }
  if (score >= 60)
    return {
      band: 4,
      short: 'Moderately favorable',
      description: 'Evidence suggests moderately favorable conditions.',
    }
  if (score >= 40)
    return { band: 3, short: 'Mixed', description: 'Mixed or less favorable evidence.' }
  if (score >= 20)
    return {
      band: 2,
      short: 'Potentially challenging',
      description: 'Evidence suggests potentially challenging conditions.',
    }
  return {
    band: 1,
    short: 'Highly challenging',
    description: 'Evidence suggests highly challenging conditions.',
  }
}
