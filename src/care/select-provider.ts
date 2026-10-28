import { loadConfig } from "../config/env";
import { DemoCareProvider } from "./demo";
import type { CareProvider } from "./provider";
import { SerpApiCareProvider } from "./serpapi";

export function selectCareProvider(env: Record<string, string | undefined> = process.env): CareProvider {
  const config = loadConfig(env);
  return config.dataMode === "live" && config.serpApiKey
    ? new SerpApiCareProvider(config.serpApiKey)
    : new DemoCareProvider();
}
