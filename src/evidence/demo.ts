import { DemoCareProvider } from "../care/demo";
import type { EvidenceResult } from "../types/evidence";
import { normalizeEvidence } from "./normalize";
import type { EvidenceProvider } from "./provider";

// These are invented examples, not reviews or observations of actual facilities.
const EXAMPLES: Record<string, string[]> = {
  "demo-harbor-hospital": ["Illustrative example: the waiting room was noisy.", "Illustrative example: the lighting was bright."],
  "demo-oak-clinic": ["Illustrative example: the waiting room felt quiet.", "Illustrative example: chairs were available in the waiting area."],
  "demo-sunrise-urgent": ["Illustrative example: the waiting room felt crowded."],
  "demo-meadow-primary": ["Illustrative example: the waiting room had a noticeable scent."],
  "demo-willow-specialist": ["Illustrative example: the lighting was dim."],
  "demo-river-clinic": ["Illustrative example: the waiting area had several seats."],
  "demo-cedar-urgent": ["Illustrative example: background music was loud."],
  "demo-park-primary": ["Illustrative example: the waiting room was quiet."],
};

export class DemoEvidenceProvider implements EvidenceProvider {
  async collect(facilityId: string): Promise<EvidenceResult> {
    const facility = await new DemoCareProvider().getFacility(facilityId);
    const candidates = (facility ? EXAMPLES[facilityId] ?? [] : []).map((excerpt) => ({
      excerpt, sourceUrl: null, sourceType: "illustrative_demo", facilityId,
      sourceName: "Fictional illustrative demo; not a real review",
    }));
    const items = normalizeEvidence(candidates, facilityId);
    return {
      facilityId, dataMode: "demo", status: items.length ? "available" : "insufficient_evidence", items,
      ...(!items.length ? { reason: "No illustrative demo evidence is available for this facility." } : {}),
    };
  }
}
