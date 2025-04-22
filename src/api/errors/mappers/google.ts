import { errorMessages } from '@/localization/errors';
import { ErrorCode, ApiError, DISABLE_TOAST_ERROR_CODES } from '../types';
import { statusCodes } from '@react-native-google-signin/google-signin';

/** Google Sign-In 에러 코드와 API 에러 코드 매핑 */
const GOOGLE_ERROR_MAP: Record<string, ErrorCode> = {
	[statusCodes.SIGN_IN_CANCELLED]: ErrorCode.GOOGLE_SIGN_IN_CANCELLED,
	[statusCodes.IN_PROGRESS]: ErrorCode.GOOGLE_IN_PROGRESS,
	[statusCodes.PLAY_SERVICES_NOT_AVAILABLE]:
		ErrorCode.GOOGLE_PLAY_SERVICES_NOT_AVAILABLE,
};

/**
 * Google 로그인 관련 에러를 API 에러로 변환
 * @param error Google 로그인 과정에서 발생한 에러
 * @returns 변환된 API 에러
 */
export function mapGoogleError(error: unknown): ApiError {
	const googleError = error as { code?: string };

	const googleCode = googleError.code;
	const apiErrorCode =
		(googleCode && GOOGLE_ERROR_MAP[googleCode]) || ErrorCode.GOOGLE_UNKNOWN;

	return new ApiError({
		code: apiErrorCode,
		message:
			errorMessages[apiErrorCode] ||
			'알 수 없는 Google 로그인 오류가 발생했습니다',
		originalError: error,
		payload: { googleCode },
		disableToast: DISABLE_TOAST_ERROR_CODES.includes(apiErrorCode),
	});
}
