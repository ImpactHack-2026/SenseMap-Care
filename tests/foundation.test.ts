import { describe, expect, test } from "bun:test";
import { AppError, errorResponse, successResponse } from "../src/api/response";
import { loadConfig } from "../src/config/env";
import {
  MAX_FACILITY_ID_LENGTH,
  MAX_QUERY_LENGTH,
  validateFacilityId,
  validateFacilitySearch,
  validatePagination,
  validateSearchQuery,
} from "../src/validation/input";

describe("healthcare search inputs", () => {
  test("accepts and trims opaque facility IDs and search queries", () => {
    expect(validateFacilityId("  provider:clinic/123  ")).toBe("provider:clinic/123");
    expect(validateSearchQuery("  urgent care near me  ")).toBe("urgent care near me");
    expect(validateFacilitySearch({ query: " cardiology ", page: "2", pageSize: "10" }))
      .toEqual({ query: "cardiology", pagination: { page: 2, pageSize: 10 } });
  });

  test("rejects empty, non-string, overlong, and control-character inputs", () => {
    for (const id of ["", "  ", 1, "x".repeat(MAX_FACILITY_ID_LENGTH + 1), "abc\u0000def"]) {
      expect(() => validateFacilityId(id)).toThrow(AppError);
    }
    for (const query of ["", "  ", null, "x".repeat(MAX_QUERY_LENGTH + 1), "abc\ndef"]) {
      expect(() => validateSearchQuery(query)).toThrow(AppError);
    }
  });

  test("provides bounded, one-based pagination and rejects malformed values", () => {
    expect(validatePagination()).toEqual({ page: 1, pageSize: 20 });
    expect(validatePagination({ page: 3, pageSize: "100" })).toEqual({ page: 3, pageSize: 100 });
    for (const page of [0, -1, 1.5, "0", "01", "1e2", " 2 ", null, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => validatePagination({ page })).toThrow(AppError);
    }
    for (const pageSize of [0, 101, "101", "2.5", null]) {
      expect(() => validatePagination({ pageSize })).toThrow(AppError);
    }
    expect(() => validatePagination({ page: Number.MAX_SAFE_INTEGER, pageSize: 100 })).toThrow(AppError);
  });
});

describe("environment configuration", () => {
  test("auto-selects demo without a key and live with a key", () => {
    expect(loadConfig({})).toEqual({ dataMode: "demo" });
    expect(loadConfig({ SERPAPI_KEY: "  key  " })).toEqual({ dataMode: "live", serpApiKey: "key" });
    expect(loadConfig({ SERPAPI_KEY: "  " })).toEqual({ dataMode: "demo" });
  });

  test("honors explicit modes and rejects invalid configuration", () => {
    expect(loadConfig({ DATA_MODE: "demo", SERPAPI_KEY: "key" }).dataMode).toBe("demo");
    expect(loadConfig({ DATA_MODE: "live", SERPAPI_KEY: "key" }).dataMode).toBe("live");
    expect(loadConfig({ DATA_MODE: "live" }).dataMode).toBe("demo");
    expect(() => loadConfig({ DATA_MODE: "production" })).toThrow(AppError);
  });
});

describe("API envelopes", () => {
  test("preserves expected error details and hides unexpected errors", () => {
    expect(successResponse({ id: "123" })).toEqual({ success: true, data: { id: "123" } });
    expect(errorResponse(new AppError("VALIDATION_ERROR", "Invalid input.", { query: "Required." })))
      .toEqual({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input.", details: { query: "Required." } } });
    expect(errorResponse(new Error("secret upstream detail")))
      .toEqual({ success: false, error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." } });
  });
});
