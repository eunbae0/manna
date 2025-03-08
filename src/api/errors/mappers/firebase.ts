import { ErrorCode, ApiError } from '../types';

const FIREBASE_ERROR_MAP: Record<string, ErrorCode> = {
	'auth/email-already-in-use': ErrorCode.AUTH_EMAIL_EXISTS,
	'auth/invalid-email': ErrorCode.AUTH_INVALID_EMAIL,
	'auth/weak-password': ErrorCode.AUTH_WEAK_PASSWORD,
	'auth/user-not-found': ErrorCode.AUTH_USER_NOT_FOUND,
	'auth/wrong-password': ErrorCode.AUTH_WRONG_PASSWORD,
	// 더 많은 매핑...
};

export function mapFirebaseError(error: unknown): ApiError {
	const firebaseError = error as { code?: string; message?: string };

	const firebaseCode = firebaseError.code;
	const apiErrorCode =
		(firebaseCode && FIREBASE_ERROR_MAP[firebaseCode]) ||
		ErrorCode.AUTH_UNKNOWN;

	return new ApiError({
		code: apiErrorCode,
		message: firebaseError.message || '알 수 없는 인증 오류가 발생했습니다',
		originalError: error,
		payload: { firebaseCode },
	});
}
