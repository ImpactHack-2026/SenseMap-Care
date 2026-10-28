import { AppError } from "../api/response";
import type { DataMode } from "../types/healthcare";

export interface AppConfig {
  dataMode: DataMode;
  /** Server-side only. Never include this value in an API response or client bundle. */
  serpApiKey?: string;
}

/** Validate once on server startup; pass an explicit environment in tests. */
export function loadConfig(env: Record<string, string | undefined> = process.env): AppConfig {
  const requestedMode = env.DATA_MODE?.trim() || "auto";
  const serpApiKey = env.SERPAPI_KEY?.trim() || undefined;

  if (requestedMode !== "auto" && requestedMode !== "demo" && requestedMode !== "live") {
    throw new AppError("CONFIGURATION_ERROR", "DATA_MODE must be auto, demo, or live.");
  }

  const dataMode: DataMode = requestedMode === "auto"
    ? (serpApiKey ? "live" : "demo")
    : requestedMode;

  // Missing credentials always select demo; never invent live results.
  return { dataMode: serpApiKey ? dataMode : "demo", ...(serpApiKey ? { serpApiKey } : {}) };
}
