import { describe, expect, test } from "bun:test";
import { AppError } from "../src/api/response";
import { GET } from "../src/app/api/care/[facilityId]/evidence/route";
import { DemoEvidenceProvider } from "../src/evidence/demo";
import { classifyEvidence, normalizeEvidence } from "../src/evidence/normalize";
import { selectEvidenceProvider } from "../src/evidence/select-provider";

const facilityId = "place-123";
const review = { facilityId, excerpt: "The waiting room was noisy.", sourceType: "public_review", sourceUrl: "https://example.org/review/123", sourceName: "Example source", author: "Reviewer", sourceId: "123" };

describe("evidence normalization", () => {
  test("classifies the requested sensory categories and irrelevant text", () => {
    expect(classifyEvidence("loud noise and bright lighting")).toEqual(["noise", "lighting"]);
    expect(classifyEvidence("The crowded room had chairs and a strong smell.")).toEqual(["crowding", "seating", "smells"]);
    expect(classifyEvidence("The staff were kind and professional.")).toEqual(["irrelevant"]);
  });
  test("retains source attribution and deduplicates whitespace and case variations", () => {
    const items = normalizeEvidence([review, { ...review, excerpt: "  THE waiting room was   noisy.  " }], facilityId);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ excerpt: review.excerpt, category: "noise", sourceType: "public_review", dataMode: "live", sourceUrl: review.sourceUrl, provenance: { facilityId, sourceName: "Example source", author: "Reviewer", sourceId: "123" } });
  });
  test("rejects malformed, missing source, cross-facility and irrelevant records", () => {
    expect(normalizeEvidence([null, {}, { ...review, sourceUrl: "" }, { ...review, sourceUrl: "javascript:alert(1)" }, { ...review, sourceName: "" }, { ...review, facilityId: "other" }, { ...review, excerpt: "The staff were kind." }, { ...review, excerpt: 42 }], facilityId)).toEqual([]);
  });
  test("preserves all relevant categories without treating duplicate excerpts as new sources", () => {
    const result = normalizeEvidence([{ ...review, excerpt: "Bright lights and noisy music." }, { ...review, excerpt: "Bright lights and noisy music." }], facilityId);
    expect(result.map((item) => item.category)).toEqual(["noise", "lighting"]);
  });
});

describe("evidence providers", () => {
  test("returns labeled illustrative examples only for known demo facilities", async () => {
    const demo = await new DemoEvidenceProvider().collect("demo-oak-clinic");
    expect(demo.status).toBe("available");
    expect(demo.items.every((item) => item.sourceType === "illustrative_demo" && item.sourceUrl === null && item.dataMode === "demo" && item.provenance.sourceName.includes("not a real review"))).toBe(true);
    expect((await new DemoEvidenceProvider().collect("demo-unknown")).status).toBe("insufficient_evidence");
  });
  test("does not fabricate evidence for live IDs, regardless of key", async () => {
    for (const env of [{}, { SERPAPI_KEY: "key" }]) {
      const result = await selectEvidenceProvider(facilityId, env).collect(facilityId);
      expect(result.status).toBe("insufficient_evidence");
      expect(result.items).toEqual([]);
    }
    expect((await selectEvidenceProvider("demo-oak-clinic", { SERPAPI_KEY: "key" }).collect("demo-oak-clinic")).dataMode).toBe("demo");
  });
  test("provider failures are not converted to fabricated evidence", async () => {
    expect(() => selectEvidenceProvider(facilityId, { DATA_MODE: "invalid" })).toThrow(AppError);
  });
});

describe("evidence API", () => {
  test("returns uncached demo evidence and validates IDs", async () => {
    const response = await GET(new Request("http://localhost"), { params: Promise.resolve({ facilityId: "demo-oak-clinic" }) });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect((await response.json()).data.items[0].sourceType).toBe("illustrative_demo");
    const bad = await GET(new Request("http://localhost"), { params: Promise.resolve({ facilityId: " " }) });
    expect(bad.status).toBe(400);
  });
});
