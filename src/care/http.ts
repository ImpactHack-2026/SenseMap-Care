import { AppError, errorResponse } from "../api/response";

export function careError(error: unknown): Response {
  const status = error instanceof AppError
    ? ({ UNAUTHORIZED: 401, SERVICE_UNAVAILABLE: 503, VALIDATION_ERROR: 400, CONFIGURATION_ERROR: 500, NOT_FOUND: 404, UPSTREAM_ERROR: 502, INTERNAL_ERROR: 500 } as const)[error.code]
    : 500;
  return Response.json(errorResponse(error), { status, headers: { "Cache-Control": "no-store" } });
}

export function careJson(body: unknown): Response {
  return Response.json(body, { headers: { "Cache-Control": "no-store" } });
}
