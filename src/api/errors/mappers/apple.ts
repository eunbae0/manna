import { errorMessages } from '@/localization/errors';
import { ErrorCode, ApiError, DISABLE_TOAST_ERROR_CODES } from '../types';

/** based on: https://developer.apple.com/documentation/systemextensions/ossystemextensionerror/code */
const APPLE_ERROR_MAP: Record<string, ErrorCode> = {
	ERR_UNKNOWN: ErrorCode.APPLE_UNKNOWN,
	ERR_MISSING_ENTITLEMENT: ErrorCode.APPLE_MISSING_ENTITLEMENT,
	ERR_UNSUPPORTED_PARENT_BUNDLE_LOCATION:
		ErrorCode.APPLE_UNSUPPORTED_PARENT_BUNDLE_LOCATION,
	ERR_EXTENSION_NOT_FOUND: ErrorCode.APPLE_EXTENSION_NOT_FOUND,
	ERR_DUPLICATE_EXTENSION_IDENTIFIER:
		ErrorCode.APPLE_DUPLICATE_EXTENSION_IDENTIFIER,
	ERR_UNKNOWN_EXTENSION_CATEGORY: ErrorCode.APPLE_UNKNOWN_EXTENSION_CATEGORY,
	ERR_CODE_SIGNATURE_INVALID: ErrorCode.APPLE_CODE_SIGNATURE_INVALID,
	ERR_VALIDATION_FAILED: ErrorCode.APPLE_VALIDATION_FAILED,
	ERR_FORBIDDEN_BY_SYSTEM_POLICY: ErrorCode.APPLE_FORBIDDEN_BY_SYSTEM_POLICY,
	ERR_REQUEST_CANCELED: ErrorCode.APPLE_REQUEST_CANCELED,
	ERR_REQUEST_SUPERSEDED: ErrorCode.APPLE_REQUEST_SUPERSEDED,
	ERR_AUTHORIZATION_REQUIRED: ErrorCode.APPLE_AUTHORIZATION_REQUIRED,
};

export function mapAppleError(error: unknown): ApiError {
	const appleError = error as { code?: string };

	const appleCode = appleError.code;
	const apiErrorCode =
		(appleCode && APPLE_ERROR_MAP[appleCode]) || ErrorCode.APPLE_UNKNOWN;

	return new ApiError({
		code: apiErrorCode,
		message:
			errorMessages[apiErrorCode] || '알 수 없는 인증 오류가 발생했습니다',
		originalError: error,
		payload: { appleCode },
		disableToast: DISABLE_TOAST_ERROR_CODES.includes(apiErrorCode),
	});
}
