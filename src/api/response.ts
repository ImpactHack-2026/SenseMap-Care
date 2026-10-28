export type ErrorCode =
  | "UNAUTHORIZED"
  | "SERVICE_UNAVAILABLE"
  | "VALIDATION_ERROR"
  | "CONFIGURATION_ERROR"
  | "NOT_FOUND"
  | "UPSTREAM_ERROR"
  | "INTERNAL_ERROR";

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Record<string, string>;
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: Record<string, string>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function successResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

/** Unexpected errors are not exposed to API consumers. Log them separately server-side. */
export function errorResponse(error: unknown): ApiResponse<never> {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    };
  }
  return {
    success: false,
    error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." },
  };
}
