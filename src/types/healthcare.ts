/** Coordinates in decimal degrees (WGS 84). */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  formatted?: string;
}

/** A facility is a place offering healthcare, not a claim about care quality. */
export interface Facility {
  id: string;
  name: string;
  address?: Address;
  coordinates?: Coordinates;
  phone?: string;
  website?: string;
  specialties?: string[];
}

export const FACILITY_TYPES = ["hospital", "clinic", "urgent_care", "primary_care", "specialist"] as const;
export type FacilityType = typeof FACILITY_TYPES[number];

export interface CareFacility extends Facility {
  type: FacilityType;
  /** Indicates whether this record is fictional or comes from the live provider. */
  dataMode: DataMode;
}

export interface FacilitySearch {
  query: string;
  pagination: Pagination;
  facilityType?: FacilityType;
}

/** Pages are one-based. */
export interface Pagination {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: Pagination;
  total?: number;
}

export type DataMode = "demo" | "live";
