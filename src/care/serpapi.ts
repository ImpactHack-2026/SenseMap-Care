import { AppError } from "../api/response";
import type { CareFacility, FacilitySearch, FacilityType } from "../types/healthcare";
import type { CareProvider, CareSearchResult } from "./provider";

const PAGE_SIZE = 20;
const MAX_PROVIDER_PAGES = 6;
const TIMEOUT_MS = 10_000;
const TYPE_QUERY: Record<FacilityType, string> = {
  hospital: "hospital", clinic: "medical clinic", urgent_care: "urgent care",
  primary_care: "primary care physician", specialist: "medical specialist",
};

type JsonObject = Record<string, unknown>;
function object(value: unknown): JsonObject | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : undefined;
}
function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
function classify(place: JsonObject): FacilityType | undefined {
  const labels = [place.type, ...(Array.isArray(place.types) ? place.types : [])].filter((item): item is string => typeof item === "string").join(" ").toLowerCase();
  if (/urgent care|walk.in clinic/.test(labels)) return "urgent_care";
  if (/hospital|medical center/.test(labels)) return "hospital";
  if (/primary care|family (practice|physician|medicine)|general practitioner/.test(labels)) return "primary_care";
  if (/cardiolog|dermatolog|neurolog|oncolog|pediatr|orthop|psychiatr|specialist|surgeon|medical doctor|physician|doctor/.test(labels)) return "specialist";
  if (/clinic|health center|healthcare|medical/.test(labels)) return "clinic";
  return undefined;
}
function normalize(value: unknown): CareFacility | null {
  const place = object(value);
  if (!place) throw new AppError("UPSTREAM_ERROR", "The care provider returned a malformed response.");
  const id = text(place.place_id);
  const name = text(place.title);
  if (!id || !name) throw new AppError("UPSTREAM_ERROR", "The care provider returned a malformed facility.");
  const type = classify(place);
  if (!type) return null; // Do not claim unrelated Maps results are healthcare facilities.
  const address = text(place.address);
  const phone = text(place.phone);
  const website = text(place.website);
  const coords = object(place.gps_coordinates);
  const lat = coords?.latitude;
  const lon = coords?.longitude;
  return {
    id, name, type, dataMode: "live",
    ...(address ? { address: { formatted: address } } : {}),
    ...(phone ? { phone } : {}),
    ...(website ? { website } : {}),
    ...(typeof lat === "number" && Number.isFinite(lat) && lat >= -90 && lat <= 90 && typeof lon === "number" && Number.isFinite(lon) && lon >= -180 && lon <= 180 ? { coordinates: { latitude: lat, longitude: lon } } : {}),
  };
}

export class SerpApiCareProvider implements CareProvider {
  readonly dataMode = "live" as const;
  constructor(private readonly key: string, private readonly fetcher: (input: URL, init: RequestInit) => Promise<Response> = fetch) {}

  private async request(params: Record<string, string>): Promise<JsonObject> {
    const url = new URL("https://serpapi.com/search.json");
    url.search = new URLSearchParams({ engine: "google_maps", ...params, api_key: this.key }).toString();
    let response: Response;
    try {
      response = await this.fetcher(url, { signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
    } catch (error) {
      if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
        throw new AppError("UPSTREAM_ERROR", "The care provider timed out.");
      }
      throw new AppError("UPSTREAM_ERROR", "The care provider is unavailable.");
    }
    if (response.status === 429) throw new AppError("UPSTREAM_ERROR", "The care provider quota or rate limit was reached.");
    if (!response.ok) throw new AppError("UPSTREAM_ERROR", "The care provider request failed.");
    let body: JsonObject | undefined;
    try { body = object(await response.json()); } catch { /* handled below */ }
    if (!body) throw new AppError("UPSTREAM_ERROR", "The care provider returned a malformed response.");
    if (body.error) throw new AppError("UPSTREAM_ERROR", "The care provider could not complete the request.");
    const metadata = object(body.search_metadata);
    if (metadata?.status && metadata.status !== "Success") throw new AppError("UPSTREAM_ERROR", "The care provider did not complete the request.");
    return body;
  }

  async search({ query, facilityType, pagination }: FacilitySearch): Promise<CareSearchResult> {
    const offset = (pagination.page - 1) * pagination.pageSize;
    if (offset >= PAGE_SIZE * MAX_PROVIDER_PAGES) {
      throw new AppError("VALIDATION_ERROR", "Live search is limited to the first 120 matching results.");
    }
    const results: CareFacility[] = [];
    const seen = new Set<string>();
    let hasProviderNext = false;
    for (let page = 0; page < MAX_PROVIDER_PAGES; page++) {
      const body = await this.request({ type: "search", q: `${query} ${facilityType ? TYPE_QUERY[facilityType] : "healthcare"} Fremont CA`, start: String(page * PAGE_SIZE), hl: "en" });
      let raw: unknown[];
      if (Array.isArray(body.local_results)) raw = body.local_results;
      else if (object(body.place_results)) raw = [body.place_results];
      else if (body.local_results === undefined && body.place_results === undefined && object(body.search_metadata)?.status === "Success") raw = [];
      else throw new AppError("UPSTREAM_ERROR", "The care provider returned a malformed response.");
      for (const item of raw) {
        const facility = normalize(item);
        if (facility && (!facilityType || facility.type === facilityType) && !seen.has(facility.id)) {
          seen.add(facility.id);
          results.push(facility);
        }
      }
      hasProviderNext = !!text(object(body.serpapi_pagination)?.next);
      if (!hasProviderNext || results.length > offset + pagination.pageSize) break;
    }
    return { dataMode: "live", items: results.slice(offset, offset + pagination.pageSize), pagination, hasMore: results.length > offset + pagination.pageSize || hasProviderNext };
  }

  async getFacility(id: string): Promise<CareFacility | null> {
    const body = await this.request({ place_id: id, hl: "en" });
    if (body.place_results === undefined && object(body.search_metadata)?.status === "Success") return null;
    if (!object(body.place_results)) throw new AppError("UPSTREAM_ERROR", "The care provider returned a malformed response.");
    return normalize(body.place_results);
  }
}
