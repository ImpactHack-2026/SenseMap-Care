import { describe, expect, test } from "bun:test";
import { AppError } from "../src/api/response";
import { DemoCareProvider } from "../src/care/demo";
import { selectCareProvider } from "../src/care/select-provider";
import { SerpApiCareProvider } from "../src/care/serpapi";
import { GET as searchRoute } from "../src/app/api/care/search/route";
import { GET as detailsRoute } from "../src/app/api/care/[facilityId]/route";
import type { FacilitySearch } from "../src/types/healthcare";

const search: FacilitySearch = { query: "fremont", pagination: { page: 1, pageSize: 2 } };
const mockFetch = (body: unknown, status = 200) => async () => Response.json(body, { status });
const livePlace = { place_id: "place-1", title: "Example Clinic", type: "Medical clinic", address: "Fremont, CA" };

describe("demo care provider", () => {
  test("searches fictional facilities, filters and paginates", async () => {
    const provider = new DemoCareProvider();
    const first = await provider.search(search);
    const second = await provider.search({ ...search, pagination: { page: 2, pageSize: 2 } });
    expect(first.dataMode).toBe("demo");
    expect(first.total).toBe(8);
    expect(first.hasMore).toBe(true);
    expect(first.items.every((item) => item.dataMode === "demo" && item.name.startsWith("Demo"))).toBe(true);
    expect(first.items[0].id).not.toBe(second.items[0].id);
    const clinics = await provider.search({ ...search, facilityType: "clinic" });
    expect(clinics.total).toBe(2);
    expect(clinics.items.every((item) => item.type === "clinic")).toBe(true);
    expect((await provider.search({ ...search, query: "nothing matches" })).items).toEqual([]);
    expect((await provider.getFacility("demo-oak-clinic"))?.dataMode).toBe("demo");
    expect(await provider.getFacility("missing")).toBeNull();
  });
  test("missing keys always use demo, and a configured key selects live", () => {
    expect(selectCareProvider({}).dataMode).toBe("demo");
    expect(selectCareProvider({ DATA_MODE: "live" }).dataMode).toBe("demo");
    expect(selectCareProvider({ SERPAPI_KEY: "key" }).dataMode).toBe("live");
    expect(selectCareProvider({ SERPAPI_KEY: "key", DATA_MODE: "demo" }).dataMode).toBe("demo");
  });
});

describe("SerpAPI provider", () => {
  test("normalizes live search and supported place lookup", async () => {
    const calls: URL[] = [];
    const fetcher = (async (url: string | URL | Request) => {
      const parsed = new URL(String(url)); calls.push(parsed);
      return Response.json(parsed.searchParams.has("place_id")
        ? { search_metadata: { status: "Success" }, place_results: livePlace }
        : { search_metadata: { status: "Success" }, local_results: [livePlace] });
    });
    const provider = new SerpApiCareProvider("private-key", fetcher);
    const result = await provider.search({ ...search, facilityType: "clinic" });
    expect(result.items[0]).toMatchObject({ id: "place-1", type: "clinic", dataMode: "live" });
    expect(result.dataMode).toBe("live");
    expect(calls[0].searchParams.get("engine")).toBe("google_maps");
    expect((await provider.getFacility("place-1"))?.dataMode).toBe("live");
    expect(calls[1].searchParams.get("place_id")).toBe("place-1");
    expect(JSON.stringify(result)).not.toContain("private-key");
  });
  test("reports quota, malformed bodies, provider failures and timeouts without demo fallback", async () => {
    for (const fetcher of [mockFetch({}, 429), mockFetch({ local_results: "bad" }), mockFetch({ error: "secret" }), async () => { throw new DOMException("timeout", "TimeoutError"); }]) {
      await expect(new SerpApiCareProvider("key", fetcher).search(search)).rejects.toBeInstanceOf(AppError);
    }
    const empty = await new SerpApiCareProvider("key", mockFetch({ search_metadata: { status: "Success" } })).search(search);
    expect(empty.items).toEqual([]);
    expect(empty.dataMode).toBe("live");
  });
  test("filters non-healthcare and differently typed results", async () => {
    const body = { local_results: [livePlace, { place_id: "other", title: "Bakery", type: "Bakery" }, { place_id: "hospital", title: "Hospital", type: ["General hospital", "Hospital"] }] };
    const result = await new SerpApiCareProvider("key", mockFetch(body)).search({ ...search, facilityType: "clinic" });
    expect(result.items.map((item) => item.id)).toEqual(["place-1"]);
    // Array-typed details are supported in live detail lookup.
    const detail = await new SerpApiCareProvider("key", mockFetch({ place_results: { place_id: "hospital", title: "Hospital", type: ["General hospital", "Hospital"] } })).getFacility("hospital");
    expect(detail).toMatchObject({ id: "hospital", type: "hospital", dataMode: "live" });
  });
});

describe("care routes", () => {
  test("validates requests and serves explicitly labeled demo details", async () => {
    const invalid = await searchRoute(new Request("http://localhost/api/care/search?query=fremont&facilityType=invalid"));
    expect(invalid.status).toBe(400);
    const missing = await searchRoute(new Request("http://localhost/api/care/search"));
    expect(missing.status).toBe(400);
    const detail = await detailsRoute(new Request("http://localhost"), { params: Promise.resolve({ facilityId: "demo-oak-clinic" }) });
    expect((await detail.json()).data.dataMode).toBe("demo");
    const notFound = await detailsRoute(new Request("http://localhost"), { params: Promise.resolve({ facilityId: "demo-missing" }) });
    expect(notFound.status).toBe(404);
  });
});
