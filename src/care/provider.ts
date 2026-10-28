import type { CareFacility, DataMode, FacilitySearch, PaginatedResult } from "../types/healthcare";

export interface CareSearchResult extends PaginatedResult<CareFacility> {
  dataMode: DataMode;
  hasMore: boolean;
}

export interface CareProvider {
  readonly dataMode: DataMode;
  search(input: FacilitySearch): Promise<CareSearchResult>;
  getFacility(id: string): Promise<CareFacility | null>;
}
