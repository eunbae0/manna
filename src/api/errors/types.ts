export enum ErrorCode {
  // Auth Errors (1000 범위)
  AUTH_UNKNOWN = 1000,
  AUTH_EMAIL_EXISTS = 1001,
  AUTH_INVALID_EMAIL = 1002,
  AUTH_WEAK_PASSWORD = 1003,
  AUTH_USER_NOT_FOUND = 1004,
  AUTH_WRONG_PASSWORD = 1005,
  
  // 다른 API 도메인 오류들 (다른 범위)
  // ...
}

export type ErrorPayload = Record<string, unknown>;

export interface ApiErrorOptions {
  code: ErrorCode;
  message: string;
  originalError?: unknown;
  payload?: ErrorPayload;
}

export class ApiError extends Error {
  code: ErrorCode;
  originalError?: unknown;
  payload?: ErrorPayload;

  constructor(options: ApiErrorOptions) {
    super(options.message);
    this.name = 'ApiError';
    this.code = options.code;
    this.originalError = options.originalError;
    this.payload = options.payload;
  }
}