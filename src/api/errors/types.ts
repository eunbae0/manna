export enum ErrorCode {
	// Firebase Auth Errors
	AUTH_UNKNOWN = 1000,
	AUTH_EMAIL_EXISTS = 1001,
	AUTH_INVALID_EMAIL = 1002,
	AUTH_WEAK_PASSWORD = 1003,
	AUTH_USER_NOT_FOUND = 1004,
	AUTH_WRONG_PASSWORD = 1005,

	// Apple Auth Errors
	APPLE_UNKNOWN = 2000,
	APPLE_MISSING_ENTITLEMENT = 2001,
	APPLE_UNSUPPORTED_PARENT_BUNDLE_LOCATION = 2002,
	APPLE_EXTENSION_NOT_FOUND = 2003,
	APPLE_EXTENSION_MISSING_IDENTIFIER = 2004,
	APPLE_DUPLICATE_EXTENSION_IDENTIFIER = 2005,
	APPLE_UNKNOWN_EXTENSION_CATEGORY = 2006,
	APPLE_CODE_SIGNATURE_INVALID = 2007,
	APPLE_VALIDATION_FAILED = 2008,
	APPLE_FORBIDDEN_BY_SYSTEM_POLICY = 2009,
	APPLE_REQUEST_CANCELED = 2010,
	APPLE_REQUEST_SUPERSEDED = 2011,
	APPLE_AUTHORIZATION_REQUIRED = 2012,

	// Google Auth Errors
	GOOGLE_UNKNOWN = 3000,
	GOOGLE_SIGN_IN_CANCELLED = 3001,
	GOOGLE_IN_PROGRESS = 3002,
	GOOGLE_PLAY_SERVICES_NOT_AVAILABLE = 3003,
}

export const DISABLE_TOAST_ERROR_CODES = [
	ErrorCode.APPLE_REQUEST_CANCELED,
	ErrorCode.GOOGLE_SIGN_IN_CANCELLED,
];

export type ErrorPayload = Record<string, unknown>;

export interface ApiErrorOptions {
	code: ErrorCode;
	message: string;
	originalError?: unknown;
	payload?: ErrorPayload;
	disableToast?: boolean;
}

export class ApiError extends Error {
	code: ErrorCode;
	originalError?: unknown;
	payload?: ErrorPayload;
	disableToast?: boolean;

	constructor(options: ApiErrorOptions) {
		super(options.message);
		this.name = 'ApiError';
		this.code = options.code;
		this.originalError = options.originalError;
		this.payload = options.payload;
		this.disableToast = options.disableToast;
	}
}
