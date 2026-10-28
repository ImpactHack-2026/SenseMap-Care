import type { CareFacility, FacilitySearch } from "../types/healthcare";
import type { CareProvider, CareSearchResult } from "./provider";

// All names, addresses, and contact information below are fictional demo data.
const facilities: CareFacility[] = [
  { id: "demo-harbor-hospital", name: "Demo Harbor Hospital", type: "hospital", dataMode: "demo", address: { formatted: "100 Demo Way, Fremont, CA" } },
  { id: "demo-oak-clinic", name: "Demo Oak Family Clinic", type: "clinic", dataMode: "demo", address: { formatted: "110 Demo Way, Fremont, CA" } },
  { id: "demo-sunrise-urgent", name: "Demo Sunrise Urgent Care", type: "urgent_care", dataMode: "demo", address: { formatted: "120 Demo Way, Fremont, CA" } },
  { id: "demo-meadow-primary", name: "Demo Meadow Primary Care", type: "primary_care", dataMode: "demo", address: { formatted: "130 Demo Way, Fremont, CA" } },
  { id: "demo-willow-specialist", name: "Demo Willow Cardiology", type: "specialist", dataMode: "demo", address: { formatted: "140 Demo Way, Fremont, CA" }, specialties: ["Cardiology"] },
  { id: "demo-river-clinic", name: "Demo River Community Clinic", type: "clinic", dataMode: "demo", address: { formatted: "150 Demo Way, Fremont, CA" } },
  { id: "demo-cedar-urgent", name: "Demo Cedar Urgent Care", type: "urgent_care", dataMode: "demo", address: { formatted: "160 Demo Way, Fremont, CA" } },
  { id: "demo-park-primary", name: "Demo Park Primary Care", type: "primary_care", dataMode: "demo", address: { formatted: "170 Demo Way, Fremont, CA" } },
];

export class DemoCareProvider implements CareProvider {
  readonly dataMode = "demo" as const;

  async search({ query, facilityType, pagination }: FacilitySearch): Promise<CareSearchResult> {
    const terms = query.toLowerCase().split(/\s+/);
    const matches = facilities.filter((facility) => {
      const searchable = [facility.name, facility.type.replaceAll("_", " "), facility.address?.formatted, ...(facility.specialties ?? []), "healthcare"].join(" ").toLowerCase();
      return (!facilityType || facility.type === facilityType) && terms.every((term) => searchable.includes(term));
    });
    const start = (pagination.page - 1) * pagination.pageSize;
    return { dataMode: this.dataMode, items: matches.slice(start, start + pagination.pageSize), pagination, total: matches.length, hasMore: start + pagination.pageSize < matches.length };
  }

  async getFacility(id: string): Promise<CareFacility | null> {
    return facilities.find((facility) => facility.id === id) ?? null;
  }
}
