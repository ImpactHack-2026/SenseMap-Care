import { FACTOR_ORDER, FACTOR_WEIGHTS } from './labels'
import type { CareSensoryProfile, ConfidenceLevel, FactorKey, SensoryFactor } from './types'

export const MIN_ELIGIBLE_FACTORS = 3

/** A factor meets the evidence-sufficiency threshold when it has a score and is not "limited". */
export function isFactorEligible(factor: SensoryFactor): boolean {
  return factor.score !== null && factor.confidence !== 'limited' && factor.evidence.length > 0
}

export type OverallResult = {
  score: number | null
  eligible: FactorKey[]
  missing: FactorKey[]
  /** Renormalized weights for eligible factors only. */
  effectiveWeights: Partial<Record<FactorKey, number>>
}

export function computeOverall(profile: CareSensoryProfile | null): OverallResult {
  if (!profile) {
    return { score: null, eligible: [], missing: [...FACTOR_ORDER], effectiveWeights: {} }
  }
  const eligible = FACTOR_ORDER.filter((key) => isFactorEligible(profile.factors[key]))
  const missing = FACTOR_ORDER.filter((key) => !eligible.includes(key))
  const weightSum = eligible.reduce((sum, key) => sum + FACTOR_WEIGHTS[key], 0)

  const effectiveWeights: Partial<Record<FactorKey, number>> = {}
  for (const key of eligible) effectiveWeights[key] = FACTOR_WEIGHTS[key] / weightSum

  if (eligible.length < MIN_ELIGIBLE_FACTORS || weightSum === 0) {
    return { score: null, eligible, missing, effectiveWeights }
  }

  const weighted = eligible.reduce(
    (sum, key) => sum + (profile.factors[key].score as number) * FACTOR_WEIGHTS[key],
    0,
  )
  return { score: Math.round(weighted / weightSum), eligible, missing, effectiveWeights }
}

const CONFIDENCE_RANK: Record<ConfidenceLevel, number> = { limited: 0, low: 1, medium: 2, high: 3 }
const RANK_TO_CONFIDENCE: ConfidenceLevel[] = ['limited', 'low', 'medium', 'high']

/**
 * Overall confidence is the lower median of eligible factor confidences, and is "limited"
 * when an overall score cannot be produced. Per-factor confidence is always shown alongside it.
 */
export function computeOverallConfidence(profile: CareSensoryProfile | null): ConfidenceLevel {
  const overall = computeOverall(profile)
  if (!profile || overall.score === null) return 'limited'
  const ranks = overall.eligible
    .map((key) => CONFIDENCE_RANK[profile.factors[key].confidence])
    .sort((a, b) => a - b)
  return RANK_TO_CONFIDENCE[ranks[Math.floor((ranks.length - 1) / 2)]]
}

export function countEvidence(profile: CareSensoryProfile | null): number {
  if (!profile) return 0
  return FACTOR_ORDER.reduce((sum, key) => sum + profile.factors[key].evidence.length, 0)
}
