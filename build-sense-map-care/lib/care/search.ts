import { FACILITY_TYPE_LABELS, FACTOR_ORDER, PREFERENCE_LABELS, SORT_LABELS } from './labels'
import { computeOverall, countEvidence, isFactorEligible } from './scoring'
import type { Facility, FacilityType, PreferenceKey, SearchParams, SortKey } from './types'

export const PREFERENCE_MATCH_THRESHOLD = 60

const FACILITY_TYPES = Object.keys(FACILITY_TYPE_LABELS) as FacilityType[]
const PREFERENCE_KEYS = Object.keys(PREFERENCE_LABELS) as PreferenceKey[]
const SORT_KEYS = Object.keys(SORT_LABELS) as SortKey[]

type RawParams = Record<string, string | string[] | undefined>

function toList(value: string | string[] | undefined): string[] {
  if (!value) return []
  return (Array.isArray(value) ? value : value.split(',')).flatMap((v) => v.split(',')).filter(Boolean)
}

export function parseSearchParams(raw: RawParams): SearchParams {
  const q = typeof raw.q === 'string' ? raw.q.slice(0, 120) : ''
  const sort = typeof raw.sort === 'string' && SORT_KEYS.includes(raw.sort as SortKey) ? (raw.sort as SortKey) : 'relevant'
  return {
    q,
    types: toList(raw.type).filter((t): t is FacilityType => FACILITY_TYPES.includes(t as FacilityType)),
    prefs: toList(raw.pref).filter((p): p is PreferenceKey => PREFERENCE_KEYS.includes(p as PreferenceKey)),
    sufficient: raw.sufficient === '1',
    excerpts: raw.excerpts === '1',
    sort,
  }
}

export function serializeSearchParams(params: SearchParams): string {
  const search = new URLSearchParams()
  if (params.q.trim()) search.set('q', params.q.trim())
  if (params.types.length) search.set('type', params.types.join(','))
  if (params.prefs.length) search.set('pref', params.prefs.join(','))
  if (params.sufficient) search.set('sufficient', '1')
  if (params.excerpts) search.set('excerpts', '1')
  if (params.sort !== 'relevant') search.set('sort', params.sort)
  const query = search.toString()
  return query ? `?${query}` : ''
}

type PreferenceStatus = 'match' | 'unknown' | 'mismatch'

function preferenceStatus(facility: Facility, pref: PreferenceKey): PreferenceStatus {
  const profile = facility.profile
  if (!profile) return 'unknown'
  if (pref === 'waiting') {
    const hasInfo = Boolean(profile.arrivalProcess) || profile.waitingOptions.some((o) => o.status === 'documented')
    return hasInfo ? 'match' : 'unknown'
  }
  const factor = profile.factors[pref]
  if (!isFactorEligible(factor)) return 'unknown'
  return (factor.score as number) >= PREFERENCE_MATCH_THRESHOLD ? 'match' : 'mismatch'
}

function textScore(facility: Facility, tokens: string[]): number {
  if (!tokens.length) return 0
  const name = facility.name.toLowerCase()
  const haystack = [
    facility.name,
    FACILITY_TYPE_LABELS[facility.type],
    facility.neighborhood,
    facility.city,
    ...facility.keywords,
  ]
    .join(' ')
    .toLowerCase()
  let score = 0
  for (const token of tokens) {
    if (!haystack.includes(token)) return -1
    score += name.includes(token) ? 3 : 1
  }
  return score
}

function eligibleCount(facility: Facility): number {
  if (!facility.profile) return 0
  return FACTOR_ORDER.filter((key) => isFactorEligible(facility.profile!.factors[key])).length
}

export type UnrankedResult = { facility: Facility; reason: string }

export type SearchResult = {
  results: Facility[]
  unranked: UnrankedResult[]
  excludedCount: number
}

export function searchFacilities(facilities: Facility[], params: SearchParams): SearchResult {
  const tokens = params.q.toLowerCase().split(/\s+/).filter(Boolean)
  const results: { facility: Facility; relevance: number }[] = []
  const unranked: UnrankedResult[] = []
  let excludedCount = 0

  for (const facility of facilities) {
    const relevance = textScore(facility, tokens)
    if (relevance < 0) continue
    if (params.types.length && !params.types.includes(facility.type)) continue

    const overall = computeOverall(facility.profile)
    if (params.sufficient && overall.score === null) continue
    if (params.excerpts && countEvidence(facility.profile) === 0) continue

    const statuses = params.prefs.map((pref) => ({ pref, status: preferenceStatus(facility, pref) }))
    if (statuses.some((s) => s.status === 'mismatch')) {
      excludedCount += 1
      continue
    }
    const unknown = statuses.filter((s) => s.status === 'unknown')
    if (unknown.length) {
      const names = unknown.map((s) => (s.pref === 'waiting' ? 'waiting arrangements' : s.pref))
      unranked.push({
        facility,
        reason: facility.profile
          ? `Not enough evidence about ${names.join(' and ')} to compare.`
          : 'No sensory information is available for this facility yet.',
      })
      continue
    }
    if (params.sort === 'overall' && overall.score === null) {
      unranked.push({ facility, reason: 'Not enough evidence for an overall score, so it is not ranked.' })
      continue
    }
    results.push({ facility, relevance })
  }

  results.sort((a, b) => {
    switch (params.sort) {
      case 'overall':
        return (computeOverall(b.facility.profile).score as number) - (computeOverall(a.facility.profile).score as number)
      case 'evidence':
        return (
          eligibleCount(b.facility) - eligibleCount(a.facility) ||
          countEvidence(b.facility.profile) - countEvidence(a.facility.profile)
        )
      case 'alpha':
        return a.facility.name.localeCompare(b.facility.name)
      default:
        return (
          b.relevance - a.relevance ||
          eligibleCount(b.facility) - eligibleCount(a.facility) ||
          a.facility.name.localeCompare(b.facility.name)
        )
    }
  })

  return { results: results.map((r) => r.facility), unranked, excludedCount }
}
