import { loadConfig } from "../config/env";
import type { EvidenceResult } from "../types/evidence";
import { DemoEvidenceProvider } from "./demo";
import type { EvidenceProvider } from "./provider";
import { SerpApiEvidenceProvider } from "./serpapi";

/** Fallback when a live-mode request has no credentials (configuration should prevent this). */
export class UnavailableLiveEvidenceProvider implements EvidenceProvider {
  async collect(facilityId: string): Promise<EvidenceResult> {
    return { facilityId, dataMode: "live", status: "insufficient_evidence", items: [], reason: "No live evidence credentials are configured." };
  }
}

export function selectEvidenceProvider(facilityId: string, env: Record<string, string | undefined> = process.env): EvidenceProvider {
  if (facilityId.startsWith("demo-")) return new DemoEvidenceProvider();
  // A live ID must never receive fabricated demo evidence, even with no key.
  const config = loadConfig(env);
  if (config.dataMode === "demo") {
    return { collect: async (id) => ({ facilityId: id, dataMode: "demo", status: "insufficient_evidence", items: [], reason: "No demo evidence is available for a live facility ID." }) };
  }
  return config.serpApiKey ? new SerpApiEvidenceProvider(config.serpApiKey) : new UnavailableLiveEvidenceProvider();
}
