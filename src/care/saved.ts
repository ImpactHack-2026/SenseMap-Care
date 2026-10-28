import { createClient } from "@supabase/supabase-js";
import { AppError } from "../api/response";
import { validateFacilityId } from "../validation/input";

type SavedRow = { facility_id: string; created_at: string };
const TIMEOUT_MS = 8000;

/** Explicit Bearer tokens only: cookies and anonymous device identifiers are not authentication. */
export async function savedFacilities(request: Request, operation: "list" | "save" | "remove", rawId?: unknown): Promise<SavedRow[] | null> {
  const header = request.headers.get("authorization");
  const match = header?.match(/^Bearer ([A-Za-z0-9._-]+)$/i);
  if (!match) throw new AppError("UNAUTHORIZED", "A signed-in user is required.");
  const token = match[1];
  const id = operation === "list" ? undefined : validateFacilityId(rawId);
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_ANON_KEY?.trim();
  if (!url || !key) throw new AppError("SERVICE_UNAVAILABLE", "Saved facilities are not configured.");
  try {
    const parsed = new URL(url);
    if ((parsed.protocol !== "https:" && !(parsed.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname))) || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== "/") throw new Error("invalid URL");
  } catch { throw new AppError("SERVICE_UNAVAILABLE", "Saved facilities are not configured."); }
  try {
    const boundedFetch: typeof fetch = Object.assign(
      (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => fetch(input, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" }),
      { preconnect: fetch.preconnect },
    );
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: { Authorization: `Bearer ${token}` }, fetch: boundedFetch },
    });
    const { data: auth, error: authError } = await client.auth.getUser(token);
    if (authError) {
      if (authError.status === 401 || authError.status === 403 || authError.code === "bad_jwt" || authError.code === "session_not_found") throw new AppError("UNAUTHORIZED", "A signed-in user is required.");
      throw new AppError("SERVICE_UNAVAILABLE", "Saved facilities are temporarily unavailable.");
    }
    if (!auth.user || auth.user.is_anonymous) throw new AppError("UNAUTHORIZED", "A signed-in user is required.");
    const table = client.from("saved_care_facilities");
    if (operation === "list") {
      const { data, error } = await table.select("facility_id,created_at").eq("user_id", auth.user.id).order("created_at", { ascending: false }).limit(500);
      if (error || !Array.isArray(data)) throw new AppError("SERVICE_UNAVAILABLE", "Saved facilities are temporarily unavailable.");
      return data as SavedRow[];
    }
    if (operation === "save") {
      // Ignore duplicates without UPDATE privileges. Check the facility exists before saving.
      const { DemoCareProvider } = await import("./demo");
      const { selectCareProvider } = await import("./select-provider");
      const provider = id!.startsWith("demo-") ? new DemoCareProvider() : selectCareProvider();
      if (!await provider.getFacility(id!)) throw new AppError("NOT_FOUND", "Facility not found.");
      const { error } = await table.upsert({ user_id: auth.user.id, facility_id: id }, { onConflict: "user_id,facility_id", ignoreDuplicates: true });
      if (error) throw new AppError("SERVICE_UNAVAILABLE", "Saved facilities are temporarily unavailable.");
    } else {
      const { error } = await table.delete().eq("user_id", auth.user.id).eq("facility_id", id!);
      if (error) throw new AppError("SERVICE_UNAVAILABLE", "Saved facilities are temporarily unavailable.");
    }
    return null;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("SERVICE_UNAVAILABLE", "Saved facilities are temporarily unavailable.");
  }
}
