import { afterEach, describe, expect, test } from "bun:test";
import { GET as search } from "../src/app/api/care/search/route";
import { GET as profile } from "../src/app/api/care/[facilityId]/profile/route";
import { POST as guide } from "../src/app/api/care/[facilityId]/guide/route";
import { GET as list } from "../src/app/api/care/saved/route";
import { PUT as save, DELETE as remove } from "../src/app/api/care/saved/[facilityId]/route";

const originalFetch = globalThis.fetch;
const originalUrl = process.env.SUPABASE_URL;
const originalKey = process.env.SUPABASE_ANON_KEY;
const originalMode = process.env.DATA_MODE;
const originalSerp = process.env.SERPAPI_KEY;
const userId = "11111111-1111-4111-8111-111111111111";
const otherId = "22222222-2222-4222-8222-222222222222";
const context = (facilityId: string) => ({ params: Promise.resolve({ facilityId }) });
const req = (method: string, token?: string) => new Request("http://localhost/api/care/saved", { method, ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}) });

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const [name, value] of Object.entries({ SUPABASE_URL: originalUrl, SUPABASE_ANON_KEY: originalKey, DATA_MODE: originalMode, SERPAPI_KEY: originalSerp })) {
    if (value === undefined) delete process.env[name]; else process.env[name] = value;
  }
});

function fakeSupabase() {
  const records = new Map<string, Set<string>>();
  const calls: string[] = [];
  globalThis.fetch = Object.assign(async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    const headers = new Headers(init?.headers);
    const authorization = headers.get("authorization");
    calls.push(`${init?.method ?? "GET"} ${url.pathname}`);
    if (!url.hostname.endsWith("supabase.test")) throw new Error("Unexpected provider");
    if (url.pathname === "/auth/v1/user") {
      if (authorization === "Bearer invalid") return Response.json({ code: "bad_jwt", msg: "invalid token" }, { status: 401 });
      if (authorization === "Bearer outage") return Response.json({ msg: "private server details" }, { status: 503 });
      return Response.json({ id: authorization === "Bearer user2" ? otherId : userId, aud: "authenticated", role: "authenticated", is_anonymous: authorization === "Bearer anonymous" });
    }
    const owner = authorization === "Bearer user2" ? otherId : userId;
    const existing = records.get(owner) ?? new Set<string>();
    records.set(owner, existing);
    if ((init?.method ?? "GET") === "GET") return Response.json([...existing].map((facility_id) => ({ facility_id, created_at: "2026-01-01T00:00:00Z" })));
    if (init?.method === "POST") { const body = JSON.parse(String(init.body)); if (body.user_id !== owner) throw new Error("owner mismatch"); existing.add(body.facility_id); return new Response(null, { status: 201 }); }
    if (init?.method === "DELETE") { existing.delete(url.searchParams.get("facility_id")?.replace(/^eq\./, "") ?? ""); return new Response(null, { status: 204 }); }
    return new Response(null, { status: 500 });
  }, { preconnect: originalFetch.preconnect });
  return calls;
}

describe("saved facilities", () => {
  test("rejects unauthenticated and anonymous users and isolates service failures", async () => {
    delete process.env.SUPABASE_URL; delete process.env.SUPABASE_ANON_KEY;
    expect((await list(req("GET"))).status).toBe(401);
    expect((await list(req("GET", "user1"))).status).toBe(503);
    process.env.SUPABASE_URL = "https://project.supabase.test"; process.env.SUPABASE_ANON_KEY = "test-key";
    fakeSupabase();
    expect((await list(req("GET", "invalid"))).status).toBe(401);
    expect((await list(req("GET", "anonymous"))).status).toBe(401);
    const unavailable = await list(req("GET", "outage"));
    expect(unavailable.status).toBe(503);
    expect(JSON.stringify(await unavailable.json())).not.toContain("private server details");
  });
  test("runs the demo search-to-guide-to-save journey with per-user isolation", async () => {
    process.env.DATA_MODE = "demo"; delete process.env.SERPAPI_KEY;
    process.env.SUPABASE_URL = "https://project.supabase.test"; process.env.SUPABASE_ANON_KEY = "test-key";
    const calls = fakeSupabase();
    const found = await (await search(new Request("http://localhost/api/care/search?query=oak"))).json();
    const id = found.data.items[0].id;
    const detail = await (await profile(req("GET"), context(id))).json();
    expect(detail.data.analysis.dataMode).toBe("demo");
    expect(detail.data.analysis.status).toBe("insufficient_evidence");
    expect(detail.data.analysis.overallScore).toBeNull();
    expect(detail.data.analysis.factors[0].evidence[0].sourceType).toBe("illustrative_demo");
    expect(detail.data.analysis.factors[0].confidence).toBe("limited");
    const guideResponse = await guide(new Request("http://localhost/guide", { method: "POST", body: JSON.stringify({ preferences: ["quieter_surroundings"] }) }), context(id));
    expect((await guideResponse.json()).data.dataMode).toBe("demo");
    expect((await save(req("PUT", "user1"), context(id))).status).toBe(200);
    expect((await save(req("PUT", "user1"), context(id))).status).toBe(200);
    expect((await (await list(req("GET", "user1"))).json()).data.items).toHaveLength(1);
    expect((await (await list(req("GET", "user2"))).json()).data.items).toHaveLength(0);
    expect((await remove(req("DELETE", "user1"), context(id))).status).toBe(200);
    expect((await (await list(req("GET", "user1"))).json()).data.items).toHaveLength(0);
    expect(calls.some((call) => call.includes("/rest/v1/saved_care_facilities"))).toBe(true);
  });
  test("invalid IDs and database failures are sanitized while browsing stays available", async () => {
    process.env.DATA_MODE = "demo"; process.env.SUPABASE_URL = "https://project.supabase.test"; process.env.SUPABASE_ANON_KEY = "test-key";
    fakeSupabase();
    expect((await save(req("PUT", "user1"), context(" "))).status).toBe(400);
    expect((await save(req("PUT", "user1"), context("demo-unknown"))).status).toBe(404);
    const baseFetch = globalThis.fetch;
    globalThis.fetch = Object.assign(async (input: string | URL | Request, init?: RequestInit) => {
      if (String(input).includes("/rest/v1/")) return Response.json({ message: "secret database detail" }, { status: 500 });
      return baseFetch(input, init);
    }, { preconnect: originalFetch.preconnect });
    const response = await list(req("GET", "user1"));
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("secret database detail");
    expect((await search(new Request("http://localhost/api/care/search?query=oak"))).status).toBe(200);
  });
});
