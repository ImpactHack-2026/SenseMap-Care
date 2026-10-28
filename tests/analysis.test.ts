import { describe, expect, test } from "bun:test";
import { KeywordSensoryAnalyzer } from "../src/analysis/analyzer";
import { normalizeEvidence } from "../src/evidence/normalize";
import { GET } from "../src/app/api/care/[facilityId]/profile/route";
import type { EvidenceResult } from "../src/types/evidence";

const analyzer = new KeywordSensoryAnalyzer();
function evidence(texts: string[], mode: "demo" | "live" = "live"): EvidenceResult {
  const facilityId = mode === "demo" ? "demo-oak-clinic" : "place-1";
  const items = normalizeEvidence(texts.map((excerpt, i) => ({ excerpt, facilityId, sourceType: mode === "demo" ? "illustrative_demo" : "public_review", sourceUrl: mode === "demo" ? null : `https://example.org/${i}`, sourceName: mode === "demo" ? "Illustrative demo" : "Example", sourceId: String(i) })), facilityId);
  return { facilityId, dataMode: mode, status: "available", items };
}

describe("sensory scoring", () => {
  test("renormalizes weights over three eligible factors", () => {
    const result = analyzer.analyze(evidence(["The waiting room was quiet.", "The lighting was bright.", "The room was crowded."]));
    expect(result.status).toBe("available");
    expect(result.overallScore).toBe(40); // 100*30/(30+25+20)
    expect(result.factors.map((factor) => factor.score)).toEqual([100, 0, 0, null, null]);
  });
  test("requires three factors and does not turn unknown mentions into zero", () => {
    const result = analyzer.analyze(evidence(["The room was quiet.", "The music was playing.", "The chairs were red."]));
    expect(result.status).toBe("insufficient_evidence");
    expect(result.overallScore).toBeNull();
    expect(result.factors.find((f) => f.category === "seating")?.score).toBeNull();
    expect(analyzer.analyze({ facilityId: "x", dataMode: "live", status: "insufficient_evidence", items: [] }).overallScore).toBeNull();
  });
  test("scores conflicting reports and caps confidence", () => {
    const result = analyzer.analyze(evidence(["The waiting area was quiet.", "The waiting room was noisy."]));
    expect(result.factors[0].score).toBe(50);
    expect(result.factors[0].confidence).toBe("low");
    expect(result.factors[0].explanation).toContain("Reports conflict");
  });
  test("assigns all confidence levels based on independent attributed evidence", () => {
    const texts = ["The room was quiet.", "The waiting room was quiet.", "The office was quiet.", "The lobby was quiet.", "The clinic was quiet."];
    for (const [n, expected] of [[1, "limited"], [2, "low"], [3, "medium"], [5, "high"]] as const) {
      expect(analyzer.analyze(evidence(texts.slice(0, n))).factors[0].confidence).toBe(expected);
    }
    expect(analyzer.analyze(evidence(texts, "demo")).factors[0].confidence).toBe("limited");
  });
  test("rejects invalid inputs and ignores malformed or mismatched evidence", () => {
    expect(() => analyzer.analyze(null as unknown as EvidenceResult)).toThrow();
    const data = evidence(["The room was quiet."]);
    data.items[0].provenance.facilityId = "other";
    expect(analyzer.analyze(data).factors[0].score).toBeNull();
    const negation = analyzer.analyze(evidence(["The room was not quiet.", "It might be noisy."]));
    expect(negation.factors[0].score).toBeNull();
  });
  test("preserves exact source text and is deterministic", () => {
    const original = "  The room was quiet.  ";
    const data = evidence([original]);
    expect(data.items[0].excerpt).toBe(original);
    expect(analyzer.analyze(data).factors[0].evidence[0].excerpt).toBe(original);
    expect(analyzer.analyze(data)).toEqual(analyzer.analyze(data));
  });
});

describe("profile endpoint", () => {
  test("returns a labeled demo profile without keys and 404 for missing facilities", async () => {
    const response = await GET(new Request("http://localhost"), { params: Promise.resolve({ facilityId: "demo-oak-clinic" }) });
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body.data.analysis.dataMode).toBe("demo");
    expect(body.data.analysis.overallScore).toBeNull();
    expect(body.data.analysis.disclaimer).toContain("not a real-world measurement");
    const missing = await GET(new Request("http://localhost"), { params: Promise.resolve({ facilityId: "demo-unknown" }) });
    expect(missing.status).toBe(404);
  });
});
