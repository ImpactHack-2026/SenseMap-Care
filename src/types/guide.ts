import type { EvidenceItem, RelevantSensoryCategory } from "./evidence";
import type { DataMode } from "./healthcare";

export const GUIDE_PREFERENCES = ["quieter_surroundings", "less_intense_lighting", "less_crowded_waiting", "seating_requirements", "clear_waiting_instructions"] as const;
export type GuidePreference = typeof GUIDE_PREFERENCES[number];
export interface GuideRequest {
  preferences: GuidePreference[];
  includePersonalNote: boolean;
}
export interface GuideEvidence {
  category: RelevantSensoryCategory;
  evidence: EvidenceItem;
  relevantToPreferences: boolean;
}
export interface PreparationGuide {
  facilityId: string;
  facilityName: string;
  dataMode: DataMode;
  disclaimer: string;
  preferences: GuidePreference[];
  knownInformation: { address?: string; phone?: string; website?: string; sensoryEvidence: GuideEvidence[] };
  unknowns: string[];
  questions: string[];
  checklist: string[];
  personalNote: string | null;
}
