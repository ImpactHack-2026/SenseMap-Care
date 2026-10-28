import type { EvidenceItem, RelevantSensoryCategory, SensoryCategory } from "../types/evidence";

// Conservative keyword matching only: mentions are not assessments of sensory impact.
const PATTERNS: Array<[RelevantSensoryCategory, RegExp]> = [
  ["noise", /\b(nois(?:e|y)|loud|quiet|sound|sounds|buzzing|beeping|music)\b/i],
  ["lighting", /\b(light(?:ing|s)?|bright|dim|glare|fluorescent)\b/i],
  ["crowding", /\b(crowd(?:ed|ing|s)?|wait(?:ed|s)?|waiting (?:a )?long|packed (?:waiting|lobby|room|facility|area)|busy (?:waiting|lobby)|full (?:waiting|lobby))\b/i],
  ["seating", /\b(seat(?:ing|s)?|chair(?:s)?|bench(?:es)?)\b/i],
  ["smells", /\b(smell(?:s|ed|ing)?|scent(?:s|ed)?|odor(?:s)?|odour(?:s)?|fragrance|perfume)\b/i],
];

/** An excerpt may relate to multiple categories; unknown text is never treated as evidence. */
export function classifyEvidence(excerpt: string): SensoryCategory[] {
  const matches = PATTERNS.filter(([, pattern]) => pattern.test(excerpt)).map(([category]) => category);
  return matches.length ? matches : ["irrelevant"];
}

export interface EvidenceCandidate {
  excerpt?: unknown;
  sourceUrl?: unknown;
  sourceType?: unknown;
  facilityId?: unknown;
  sourceName?: unknown;
  author?: unknown;
  publishedAt?: unknown;
  sourceId?: unknown;
}

function nonempty(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= maxLength && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(trimmed) ? trimmed : undefined;
}

function validSourceUrl(value: unknown): string | undefined {
  const raw = nonempty(value, 2048);
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password ? url.toString() : undefined;
  } catch { return undefined; }
}

export function normalizeEvidence(candidates: readonly unknown[], facilityId: string): EvidenceItem[] {
  const items: EvidenceItem[] = [];
  const seen = new Set<string>();
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) continue;
    const raw = candidate as EvidenceCandidate;
    const excerpt = nonempty(raw.excerpt, 5000) && typeof raw.excerpt === "string" ? raw.excerpt : undefined;
    const sourceName = nonempty(raw.sourceName, 200);
    const sourceType = raw.sourceType;
    if (!excerpt || !sourceName || raw.facilityId !== facilityId || (sourceType !== "public_review" && sourceType !== "illustrative_demo")) continue;
    const isDemo = sourceType === "illustrative_demo";
    const sourceUrl = validSourceUrl(raw.sourceUrl);
    if ((!isDemo && !sourceUrl) || (isDemo && raw.sourceUrl != null)) continue;
    const categories = classifyEvidence(excerpt).filter((category): category is RelevantSensoryCategory => category !== "irrelevant");
    if (!categories.length) continue;
    const duplicateKey = excerpt.trim().replace(/\s+/g, " ").toLocaleLowerCase();
    if (seen.has(duplicateKey)) continue;
    seen.add(duplicateKey);
    const author = nonempty(raw.author, 200);
    const publishedAt = nonempty(raw.publishedAt, 100);
    const sourceId = nonempty(raw.sourceId, 255);
    for (const category of categories) {
      items.push({
        excerpt, sourceUrl: sourceUrl ?? null, sourceType, category, dataMode: isDemo ? "demo" : "live",
        provenance: { facilityId, sourceName, ...(author ? { author } : {}), ...(publishedAt ? { publishedAt } : {}), ...(sourceId ? { sourceId } : {}) },
      });
    }
  }
  return items;
}
