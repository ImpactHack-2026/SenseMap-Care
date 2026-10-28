import { AppError } from "../api/response";
import { KeywordSensoryAnalyzer, type SensoryAnalyzer } from "../analysis/analyzer";
import { selectEvidenceProvider } from "../evidence/select-provider";
import type { CareProfile } from "../types/analysis";
import { validateFacilityId } from "../validation/input";
import { DemoCareProvider } from "./demo";
import { selectCareProvider } from "./select-provider";

export async function getCareProfile(facilityId: string, analyzer: SensoryAnalyzer = new KeywordSensoryAnalyzer()): Promise<CareProfile> {
  const id = validateFacilityId(facilityId);
  const provider = id.startsWith("demo-") ? new DemoCareProvider() : selectCareProvider();
  const facility = await provider.getFacility(id);
  if (!facility) throw new AppError("NOT_FOUND", "Facility not found.");
  const evidence = await selectEvidenceProvider(id).collect(id);
  if (evidence.facilityId !== facility.id || evidence.dataMode !== facility.dataMode) throw new AppError("UPSTREAM_ERROR", "Evidence does not match the requested facility.");
  return { facility, analysis: analyzer.analyze(evidence) };
}
