import { describe, expect, test } from "bun:test";
import { POST } from "../src/app/api/care/[facilityId]/guide/route";
import { generatePreparationGuide } from "../src/care/guide";
import { getCareProfile } from "../src/care/profile";
import { validateGuideRequest } from "../src/validation/guide";

const context = (facilityId: string) => ({ params: Promise.resolve({ facilityId }) });
const request = (body: string) => new Request("http://localhost/api/care/demo-oak-clinic/guide", { method: "POST", headers: { "Content-Type": "application/json" }, body });

describe("guide request validation", () => {
  test("accepts optional preferences and note flag", () => {
    expect(validateGuideRequest({})).toEqual({ preferences: [], includePersonalNote: false });
    expect(validateGuideRequest({ preferences: ["quieter_surroundings", "seating_requirements"], includePersonalNote: true }).preferences).toHaveLength(2);
  });
  test("rejects unsupported accommodations, sensitive fields, duplicates and invalid input", () => {
    for (const input of [null, [], { preferences: ["quiet_room"] }, { diagnosis: "private" }, { preferences: ["seating_requirements", "seating_requirements"] }, { preferences: "noise" }, { includePersonalNote: "yes" }]) {
      expect(() => validateGuideRequest(input)).toThrow();
    }
  });
});

describe("preparation guide", () => {
  test("uses attributed demo evidence and leaves sensory scores unchanged", async () => {
    const profile = await getCareProfile("demo-oak-clinic");
    const snapshot = structuredClone(profile);
    const guide = generatePreparationGuide(profile, validateGuideRequest({ preferences: ["quieter_surroundings", "less_intense_lighting", "clear_waiting_instructions"], includePersonalNote: true }));
    expect(profile).toEqual(snapshot);
    expect(guide.dataMode).toBe("demo");
    expect(guide.disclaimer).toContain("fictional");
    expect(guide.knownInformation.sensoryEvidence[0].relevantToPreferences).toBe(true);
    expect(guide.knownInformation.sensoryEvidence[0].evidence).toEqual(profile.analysis.factors[0].evidence[0]);
    expect(guide.unknowns.some((unknown) => unknown.includes("lighting"))).toBe(true);
    expect(guide.unknowns.some((unknown) => unknown.includes("instructions"))).toBe(true);
    expect(guide.questions.some((question) => question.includes("options"))).toBe(true);
    expect(guide.personalNote).toContain("quieter place to wait");
  });
  test("handles a profile with no evidence without inventing facts", async () => {
    const profile = await getCareProfile("demo-oak-clinic");
    profile.analysis.factors.forEach((factor) => { factor.evidence = []; factor.score = null; });
    const guide = generatePreparationGuide(profile, validateGuideRequest({ preferences: ["seating_requirements"] }));
    expect(guide.knownInformation.sensoryEvidence).toEqual([]);
    expect(guide.unknowns.some((unknown) => unknown.includes("seating"))).toBe(true);
    expect(guide.questions[0]).toContain("What seating is available");
    expect(guide.personalNote).toBeNull();
  });
  test("works with no preferences and asks instead of promising accommodations", async () => {
    const guide = generatePreparationGuide(await getCareProfile("demo-oak-clinic"), validateGuideRequest({}));
    expect(guide.questions.length).toBeGreaterThan(0);
    expect(guide.checklist.length).toBeGreaterThan(0);
    expect(guide.personalNote).toBeNull();
  });
});

describe("guide endpoint", () => {
  test("returns uncached demo guide without a key", async () => {
    const response = await POST(request(JSON.stringify({ preferences: ["seating_requirements"], includePersonalNote: true })), context("demo-oak-clinic"));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body.data.dataMode).toBe("demo");
    expect(body.data.personalNote).toContain("seating");
  });
  test("returns validation errors and rejects unknown facilities", async () => {
    expect((await POST(request("{"), context("demo-oak-clinic"))).status).toBe(400);
    expect((await POST(request(JSON.stringify({ preferences: ["quiet_room"] })), context("demo-oak-clinic"))).status).toBe(400);
    expect((await POST(request(JSON.stringify({ preferences: [], extra: "x".repeat(5000) })), context("demo-oak-clinic"))).status).toBe(400);
    expect((await POST(request("{}"), context("demo-unknown"))).status).toBe(404);
  });
});
