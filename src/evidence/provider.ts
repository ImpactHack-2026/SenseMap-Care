import type { EvidenceResult } from "../types/evidence";

export interface EvidenceProvider {
  collect(facilityId: string): Promise<EvidenceResult>;
}
