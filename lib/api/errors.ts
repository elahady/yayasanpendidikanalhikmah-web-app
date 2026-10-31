/**
 * Format error seragam REST API v1 (docs/api-contract.md):
 * HTTP status yang sesuai + body `{ "error": { "code": "KODE", "message": "teks Indonesia" } }`.
 */

export type ApiErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "SELF_ATTENDANCE_FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "RATE_LIMITED"
  | "INTERNAL";

const STATUS: Record<ApiErrorCode, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  SELF_ATTENDANCE_FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION: 422,
  RATE_LIMITED: 429,
  INTERNAL: 500,
};

export class ApiError extends Error {
  readonly status: number;
  constructor(
    readonly code: ApiErrorCode,
    message: string,
    readonly headers?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = STATUS[code];
  }
}

export function responsError(err: ApiError): Response {
  return Response.json(
    { error: { code: err.code, message: err.message } },
    { status: err.status, headers: err.headers },
  );
}
