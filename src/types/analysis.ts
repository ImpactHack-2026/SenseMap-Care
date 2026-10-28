import type { EvidenceItem, RelevantSensoryCategory } from "./evidence";
import type { CareFacility, DataMode } from "./healthcare";

export type Confidence = "high" | "medium" | "low" | "limited";
export interface FactorAnalysis {
  category: RelevantSensoryCategory;
  score: number | null;
  confidence: Confidence;
  evidence: EvidenceItem[];
  explanation: string;
}
export interface SensoryAnalysis {
  dataMode: DataMode;
  status: "available" | "insufficient_evidence";
  overallScore: number | null;
  factors: FactorAnalysis[];
  disclaimer: string;
}
export interface CareProfile {
  facility: CareFacility;
  analysis: SensoryAnalysis;
}
