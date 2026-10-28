import type { DataMode } from "./healthcare";

export type SensoryCategory = "noise" | "lighting" | "crowding" | "seating" | "smells" | "irrelevant";
export type RelevantSensoryCategory = Exclude<SensoryCategory, "irrelevant">;

export interface EvidenceItem {
  excerpt: string;
  /** Null only for clearly labeled illustrative examples; never an invented URL. */
  sourceUrl: string | null;
  sourceType: "public_review" | "illustrative_demo";
  category: RelevantSensoryCategory;
  dataMode: DataMode;
  provenance: {
    facilityId: string;
    sourceName: string;
    author?: string;
    publishedAt?: string;
    sourceId?: string;
  };
}

export interface EvidenceResult {
  facilityId: string;
  dataMode: DataMode;
  status: "available" | "insufficient_evidence";
  items: EvidenceItem[];
  /** Explains source availability, not a judgment about the facility. */
  reason?: string;
}
