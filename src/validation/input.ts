import { AppError } from "../api/response";
import { FACILITY_TYPES, type FacilitySearch, type FacilityType, type Pagination } from "../types/healthcare";

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const MAX_QUERY_LENGTH = 200;
export const MAX_FACILITY_ID_LENGTH = 255;

function invalid(field: string, message: string): never {
  throw new AppError("VALIDATION_ERROR", "Invalid input.", { [field]: message });
}

/** Facility IDs are opaque provider identifiers, not necessarily numeric or UUIDs. */
export function validateFacilityId(value: unknown): string {
  if (typeof value !== "string") return invalid("facilityId", "Must be a string.");
  const id = value.trim();
  if (!id || id.length > MAX_FACILITY_ID_LENGTH || /[\u0000-\u001f\u007f]/.test(id)) {
    return invalid("facilityId", `Must be 1–${MAX_FACILITY_ID_LENGTH} characters without control characters.`);
  }
  return id;
}

export function validateSearchQuery(value: unknown): string {
  if (typeof value !== "string") return invalid("query", "Must be a string.");
  const query = value.trim();
  if (!query || query.length > MAX_QUERY_LENGTH || /[\u0000-\u001f\u007f]/.test(query)) {
    return invalid("query", `Must be 1–${MAX_QUERY_LENGTH} characters without control characters.`);
  }
  return query;
}

function positiveInteger(value: unknown, field: string, fallback: number): number {
  if (value === undefined) return fallback;
  const number = typeof value === "number"
    ? value
    : typeof value === "string" && /^[1-9]\d*$/.test(value)
      ? Number(value)
      : NaN;
  if (!Number.isSafeInteger(number) || number < 1) {
    return invalid(field, "Must be a positive integer.");
  }
  return number;
}

export function validatePagination(input: { page?: unknown; pageSize?: unknown } = {}): Pagination {
  const page = positiveInteger(input.page, "page", DEFAULT_PAGE);
  const pageSize = positiveInteger(input.pageSize, "pageSize", DEFAULT_PAGE_SIZE);
  if (pageSize > MAX_PAGE_SIZE) return invalid("pageSize", `Must not exceed ${MAX_PAGE_SIZE}.`);
  if (!Number.isSafeInteger((page - 1) * pageSize)) return invalid("page", "Page offset is too large.");
  return { page, pageSize };
}

export function validateFacilityType(value: unknown): FacilityType | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !FACILITY_TYPES.includes(value as FacilityType)) {
    return invalid("facilityType", `Must be one of: ${FACILITY_TYPES.join(", ")}.`);
  }
  return value as FacilityType;
}

export function validateFacilitySearch(input: {
  query?: unknown;
  page?: unknown;
  pageSize?: unknown;
  facilityType?: unknown;
}): FacilitySearch {
  const facilityType = validateFacilityType(input.facilityType);
  return {
    query: validateSearchQuery(input.query),
    pagination: validatePagination(input),
    ...(facilityType ? { facilityType } : {}),
  };
}
