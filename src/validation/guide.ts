import { AppError } from "../api/response";
import { GUIDE_PREFERENCES, type GuidePreference, type GuideRequest } from "../types/guide";

export function validateGuideRequest(value: unknown): GuideRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new AppError("VALIDATION_ERROR", "Request body must be a JSON object.");
  const body = value as Record<string, unknown>;
  if (Object.keys(body).some((key) => key !== "preferences" && key !== "includePersonalNote")) throw new AppError("VALIDATION_ERROR", "Request contains unsupported fields.");
  const preferences = body.preferences === undefined ? [] : body.preferences;
  if (!Array.isArray(preferences) || preferences.length > GUIDE_PREFERENCES.length || preferences.some((preference) => typeof preference !== "string" || !GUIDE_PREFERENCES.includes(preference as GuidePreference)) || new Set(preferences).size !== preferences.length) {
    throw new AppError("VALIDATION_ERROR", "Invalid preferences.", { preferences: `Use distinct values from: ${GUIDE_PREFERENCES.join(", ")}.` });
  }
  if (body.includePersonalNote !== undefined && typeof body.includePersonalNote !== "boolean") throw new AppError("VALIDATION_ERROR", "includePersonalNote must be a boolean.");
  return { preferences: preferences as GuidePreference[], includePersonalNote: body.includePersonalNote === true };
}
