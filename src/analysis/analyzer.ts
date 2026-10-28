import { AppError } from "../api/response";
import { classifyEvidence } from "../evidence/normalize";
import type { FactorAnalysis, SensoryAnalysis, Confidence } from "../types/analysis";
import type { EvidenceItem, EvidenceResult, RelevantSensoryCategory } from "../types/evidence";

export const FACTOR_WEIGHTS: Readonly<Record<RelevantSensoryCategory, number>> = {
  noise: 30, lighting: 25, crowding: 20, seating: 15, smells: 10,
};
const CATEGORIES = Object.keys(FACTOR_WEIGHTS) as RelevantSensoryCategory[];

/** Each rule is a complete, category-specific phrase. Ambiguous, negated, or conflicting text is not scored. */
const RULES: Record<RelevantSensoryCategory, { positive: RegExp; negative: RegExp }> = {
  noise: { positive: /\b(?:quiet|peaceful|not noisy|not loud)\b/i, negative: /\b(?:noisy|loud|buzzing|beeping)\b/i },
  lighting: { positive: /\b(?:dim lighting|dim lights|soft lighting|soft lights|lighting was dim|lights were dim)\b/i, negative: /\b(?:bright lighting|bright lights|lighting was bright|lights were bright|glare|fluorescent)\b/i },
  crowding: { positive: /\b(?:not crowded|uncrowded|empty waiting room|waiting room was empty)\b/i, negative: /\b(?:crowded|packed|full waiting room|waiting room was full)\b/i },
  seating: { positive: /\b(?:seats? (?:were|was) available|chairs? (?:were|was) available|plenty of (?:chairs|seats)|seating was available)\b/i, negative: /\b(?:no seats|no chairs|no seating|seating was unavailable|chairs were unavailable)\b/i },
  smells: { positive: /\b(?:no (?:strong )?(?:smell|odor|odour|scent)|fragrance.free|unscented)\b/i, negative: /\b(?:strong|noticeable|overwhelming) (?:smell|odor|odour|scent|fragrance)\b/i },
};

export interface SensoryAnalyzer {
  analyze(evidence: EvidenceResult): SensoryAnalysis;
}

function validItem(item: EvidenceItem, result: EvidenceResult): boolean {
  if (!item || typeof item !== "object" || !item.provenance || item.provenance.facilityId !== result.facilityId || item.dataMode !== result.dataMode || typeof item.excerpt !== "string" || !item.excerpt.trim() || typeof item.provenance.sourceName !== "string" || !item.provenance.sourceName.trim() || !CATEGORIES.includes(item.category) || !classifyEvidence(item.excerpt).includes(item.category)) return false;
  if (item.dataMode === "demo") return item.sourceType === "illustrative_demo" && item.sourceUrl === null;
  if (item.sourceType !== "public_review" || typeof item.sourceUrl !== "string") return false;
  try { const url = new URL(item.sourceUrl); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
}

function polarity(item: EvidenceItem): 1 | -1 | 0 {
  const excerpt = item.excerpt;
  const rules = RULES[item.category];
  const positive = rules.positive.test(excerpt);
  // Remove supported negative phrases from negative matching to avoid double counting.
  const remainder = excerpt.replace(rules.positive, "");
  const negative = rules.negative.test(remainder);
  // Ignore negation and conditional statements rather than infer intent or scope.
  if (/\b(?:never|without|neither|hardly|maybe|might|could|if|although|but|however)\b/i.test(excerpt) || /\bnot\b/i.test(remainder)) return 0;
  return positive === negative ? 0 : positive ? 1 : -1;
}

function factor(category: RelevantSensoryCategory, items: EvidenceItem[]): FactorAnalysis {
  const relevant = items.filter((item) => item.category === category);
  const assessed = relevant.map((item) => ({ item, direction: polarity(item) })).filter((entry) => entry.direction !== 0);
  if (!assessed.length) return { category, score: null, confidence: "limited", evidence: relevant, explanation: relevant.length ? "No unambiguous directional evidence was found." : "No evidence for this factor." };
  const positive = assessed.filter((entry) => entry.direction === 1).length;
  const negative = assessed.length - positive;
  const sourceKeys = new Set(assessed.map(({ item }) => item.provenance.sourceId || item.sourceUrl || item.provenance.sourceName));
  const conflict = positive > 0 && negative > 0;
  let confidence: Confidence = "limited";
  if (assessed.every(({ item }) => item.dataMode === "live")) {
    if (!conflict && assessed.length >= 5 && sourceKeys.size >= 5) confidence = "high";
    else if (!conflict && assessed.length >= 3 && sourceKeys.size >= 3) confidence = "medium";
    else if (assessed.length >= 2 && sourceKeys.size >= 2) confidence = "low";
  }
  return { category, score: Math.round(100 * positive / assessed.length), confidence, evidence: relevant, explanation: `${positive} favorable and ${negative} unfavorable unambiguous mention(s); ${relevant.length - assessed.length} unclear. ${conflict ? "Reports conflict. " : ""}Confidence reflects directional evidence, independent sources, consistency, and demo provenance.` };
}

export class KeywordSensoryAnalyzer implements SensoryAnalyzer {
  analyze(result: EvidenceResult): SensoryAnalysis {
    if (!result || typeof result.facilityId !== "string" || !result.facilityId.trim() || (result.dataMode !== "demo" && result.dataMode !== "live") || !Array.isArray(result.items) || (result.status !== "available" && result.status !== "insufficient_evidence")) throw new AppError("VALIDATION_ERROR", "Invalid evidence result.");
    const unique = new Set<string>();
    const items = result.status === "available" ? result.items.filter((item) => {
      if (!validItem(item, result)) return false;
      const key = `${item.category}:${item.excerpt.trim().replace(/\s+/g, " ").toLowerCase()}`;
      if (unique.has(key)) return false;
      unique.add(key);
      return true;
    }) : [];
    const factors = CATEGORIES.map((category) => factor(category, items));
    const eligible = factors.filter((entry): entry is FactorAnalysis & { score: number } => entry.score !== null);
    const totalWeight = eligible.reduce((sum, entry) => sum + FACTOR_WEIGHTS[entry.category], 0);
    const overallScore = eligible.length >= 3 ? Math.round(eligible.reduce((sum, entry) => sum + entry.score * FACTOR_WEIGHTS[entry.category], 0) / totalWeight) : null;
    return { dataMode: result.dataMode, status: overallScore === null ? "insufficient_evidence" : "available", overallScore, factors, disclaimer: result.dataMode === "demo" ? "Illustrative demo only; not a real-world measurement or medically validated." : "Based on limited reported evidence; not medically validated and not a guarantee of sensory safety." };
  }
}
