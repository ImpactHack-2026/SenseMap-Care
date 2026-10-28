export type FactorKey = 'noise' | 'lighting' | 'crowding' | 'seating' | 'smells'

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'limited'

export type DataMode = 'demo' | 'live'

export type FacilityType = 'clinic' | 'hospital' | 'urgent-care' | 'outpatient' | 'other'

export type EvidenceItem = {
  id: string
  excerpt: string
  /** True when the excerpt was written for the demo and is not a real quote. */
  isIllustrative: boolean
  sourceUrl?: string
  sourceType: string
  sourceLabel: string
  publishedAt?: string
  relevance: string
  stance: 'supports' | 'contrasts' | 'unknown'
}

export type SensoryFactor = {
  score: number | null
  confidence: ConfidenceLevel
  summary: string
  evidence: EvidenceItem[]
  disagreement?: string
}

export type WaitingOption = {
  id: string
  label: string
  status: 'documented' | 'unconfirmed'
  detail?: string
}

export type HourlyPattern = {
  points: { hour: number; level: number }[]
  method: 'measured' | 'reported' | 'estimated'
  sourceLabel: string
  summary: string
}

export type CareSensoryProfile = {
  factors: Record<FactorKey, SensoryFactor>
  overallExplanation: string
  hourly: HourlyPattern | null
  waitingOptions: WaitingOption[]
  arrivalProcess: string | null
  lastReviewedLabel?: string
}

export type Facility = {
  id: string
  name: string
  type: FacilityType
  neighborhood: string
  city: string
  description: string
  keywords: string[]
  dataMode: DataMode
  website?: string
  phone?: string
  profile: CareSensoryProfile | null
}

export type PreferenceKey = FactorKey | 'waiting'

export type SortKey = 'relevant' | 'overall' | 'evidence' | 'alpha'

export type SearchParams = {
  q: string
  types: FacilityType[]
  prefs: PreferenceKey[]
  sufficient: boolean
  excerpts: boolean
  sort: SortKey
}
