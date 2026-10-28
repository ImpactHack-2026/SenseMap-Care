import { AppError } from "../api/response";
import { serpRequest } from "../care/serpapi";
import type { EvidenceResult } from "../types/evidence";
import { normalizeEvidence } from "./normalize";
import type { EvidenceProvider } from "./provider";

type JsonObject = Record<string, unknown>;
const MAX_PAGES = 6;
const MAX_CANDIDATES = 60;

function object(value: unknown): JsonObject | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : undefined;
}
function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
function httpUrl(value: unknown): string | undefined {
  const raw = text(value);
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password ? url.toString() : undefined;
  } catch { return undefined; }
}

/** Reviews require a real source link for attribution; unattributed records are dropped. */
function candidate(review: unknown, facilityId: string, fallbackUrl?: string): Record<string, unknown> | null {
  const raw = object(review);
  if (!raw || typeof raw.snippet !== "string" || !raw.snippet.trim()) return null;
  const sourceUrl = httpUrl(raw.link) ?? httpUrl(fallbackUrl);
  if (!sourceUrl) return null;
  const user = object(raw.user);
  const author = text(user?.name);
  const publishedAt = text(raw.iso_date) ?? text(raw.date);
  const sourceId = text(raw.review_id);
  return {
    // Keep the original snippet so displayed excerpts match the source exactly.
    excerpt: raw.snippet, sourceUrl, sourceType: "public_review", facilityId,
    sourceName: text(raw.source) ?? "Google Maps",
    ...(author ? { author } : {}), ...(publishedAt ? { publishedAt } : {}), ...(sourceId ? { sourceId } : {}),
  };
}

/** Collects attributed public review evidence for a live facility; nothing is persisted or logged. */
export class SerpApiEvidenceProvider implements EvidenceProvider {
  constructor(
    private readonly key: string,
    private readonly fetcher: (input: URL, init: RequestInit) => Promise<Response> = fetch,
  ) {}

  async collect(facilityId: string): Promise<EvidenceResult> {
    try {
      const raw: unknown[] = [];
      let fallbackUrl: string | undefined;
      let token: string | undefined;
      for (let page = 0; page < MAX_PAGES && raw.length < MAX_CANDIDATES; page++) {
        const body = await serpRequest(this.key, this.fetcher, {
          engine: "google_maps_reviews", place_id: facilityId, hl: "en", sort_by: "newestFirst",
          ...(token ? { next_page_token: token } : {}),
        }, "evidence provider");
        fallbackUrl ??= text(body.google_maps_reviews_url);
        if (body.reviews === undefined) {
          if (object(body.search_metadata)?.status === "Success") break;
          throw new AppError("UPSTREAM_ERROR", "The evidence provider returned a malformed response.");
        }
        if (!Array.isArray(body.reviews)) throw new AppError("UPSTREAM_ERROR", "The evidence provider returned a malformed response.");
        raw.push(...body.reviews);
        token = text(object(body.serpapi_pagination)?.next_page_token);
        if (!token) break;
      }
      const candidates = raw.map((review) => candidate(review, facilityId, fallbackUrl)).filter((value): value is Record<string, unknown> => value !== null);
      const items = normalizeEvidence(candidates, facilityId);
      return {
        facilityId, dataMode: "live", status: items.length ? "available" : "insufficient_evidence", items,
        ...(items.length ? {} : { reason: "No attributed sensory evidence was found in available public reviews." }),
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("UPSTREAM_ERROR", "The evidence provider failed.");
    }
  }
}
