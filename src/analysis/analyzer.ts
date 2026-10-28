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
  noise: { positive: /\b(?:quiet|peaceful|silent|calm|not noisy|not loud)\b/i, negative: /\b(?:noisy|loud|blaring|loud music|hear (?:everything|conversations|each other))\b/i },
  lighting: { positive: /\b(?:dim(?:mer)? lighting|dim(?:mer)? lights|soft lighting|soft lights|low lighting|lighting was dim|lights were dim)\b/i, negative: /\b(?:bright(?:er)? lighting|bright(?:er)? lights|lighting was bright|lights were bright|harsh (?:light|lighting)|glare|fluorescent)\b/i },
  crowding: {
    positive: /\b(?:not crowded|uncrowded|empty (?:waiting|lobby|room)|short wait|quick wait|no wait|little wait|in and out (?:quickly|fast)|waited (?:only|just|less than))\b/i,
    negative: /\b(?:crowded|crowding|packed (?:waiting|lobby|room|facility|area)|(?:waiting|lobby|waiting room) (?:was|were|is|are) (?:busy|full|packed)|long wait|long time (?:waiting|in (?:the )?(?:waiting|lobby))|hours? (?:of )?(?:wait|waiting)|waited (?:over|more than|an?|about) (?:an? |an hour|hour|30 minutes|two hours)|busy (?:waiting|lobby))\b|wait(?:ed|ing)?[^.!?]{0,24}\b(?:[3-9]\d|1\d\d) minutes\b/i,
  },
  seating: {
    positive: /\b(?:seats? (?:were|was) available|chairs? (?:were|was) available|plenty of (?:chairs|seats)|seating (?:was|were) available|ample seating)\b/i,
    negative: /\b(?:no (?:seats|chairs|seating)|nowhere to sit|seating (?:was|were) (?:limited|unavailable|tight)|seating.{0,24}closely together|cramped seating)\b/i,
  },
  smells: {
    positive: /\b(?:no (?:strong )?(?:smell|odors?|odours?|scent)|fragrance.free|unscented)\b/i,
    negative: /\b(?:strong|noticeable|overwhelming|lingering|bad) (?:smell|odors?|odours?|scent|fragrance)\b/i,
  },
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

/** Negation or hedging in the four words before a match makes that occurrence ambiguous. */
const NEAR_NEGATION = /\b(?:not|never|no|neither|hardly|without|isn'?t|wasn'?t|aren'?t|weren'?t|don'?t|doesn'?t|didn'?t|might|could|maybe|perhaps|probably|seems?|appears?)\s+(?:[\w'-]+\s+){0,3}$/i;

/** True when at least one un-negated occurrence of the pattern appears in the excerpt. */
function hasDirectionalPhrase(excerpt: string, pattern: RegExp): boolean {
  const regex = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
  let match: RegExpExecArray | null;
  while ((match = regex.exec(excerpt)) !== null) {
    const prefix = excerpt.slice(Math.max(0, match.index - 40), match.index);
    if (!NEAR_NEGATION.test(prefix)) return true;
    if (match.index === regex.lastIndex) regex.lastIndex += 1;
  }
  return false;
}

/** Numeric wait times are directional: an hour+ or 30min+ is unfavorable; 14min or less is favorable. */
function numericWaitDirection(excerpt: string): 1 | -1 | 0 {
  const regex = /wait(?:ed|ing)?[^.!?]{0,24}?(\d{1,3})\s*(hours?|hours|mins?|minutes?)\b/gi;
  let direction: 1 | -1 | 0 = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(excerpt)) !== null) {
    const amount = Number(match[1]);
    const directionForMatch = /hour/i.test(match[2]) ? (amount >= 1 ? -1 : 1) : amount >= 30 ? -1 : amount <= 14 ? 1 : 0;
    if (direction && directionForMatch && direction !== directionForMatch) return 0;
    if (directionForMatch) direction = directionForMatch;
  }
  return direction;
}

function polarity(item: EvidenceItem): 1 | -1 | 0 {
  const excerpt = item.excerpt;
  const rules = RULES[item.category];
  const positive = hasDirectionalPhrase(excerpt, rules.positive);
  const negative = hasDirectionalPhrase(excerpt, rules.negative);
  // Conflicting, negated or hedged signals within one excerpt are not scored.
  if (positive !== negative) return positive ? 1 : -1;
  if (positive && negative) return 0;
  return item.category === "crowding" ? numericWaitDirection(excerpt) : 0;
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
    // Eligibility follows the scoring spec: a factor is eligible when directional evidence produced a score.
    // Confidence is reported separately and never zeroes a score.
    const eligible = factors.filter((entry): entry is FactorAnalysis & { score: number } => entry.score !== null);
    const totalWeight = eligible.reduce((sum, entry) => sum + FACTOR_WEIGHTS[entry.category], 0);
    const overallScore = eligible.length >= 3 ? Math.round(eligible.reduce((sum, entry) => sum + entry.score * FACTOR_WEIGHTS[entry.category], 0) / totalWeight) : null;
    return { dataMode: result.dataMode, status: overallScore === null ? "insufficient_evidence" : "available", overallScore, factors, disclaimer: result.dataMode === "demo" ? "Illustrative demo only; not a real-world measurement or medically validated." : "Based on limited reported evidence; not medically validated and not a guarantee of sensory safety." };
  }
}
