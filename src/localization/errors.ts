import { ErrorCode } from '@/api/errors/types';

export const errorMessages: Record<ErrorCode, string> = {
	// Firebase Auth 에러
	[ErrorCode.AUTH_UNKNOWN]: '인증 오류가 발생했습니다',
	[ErrorCode.AUTH_EMAIL_EXISTS]: '이미 등록된 이메일 주소입니다',
	[ErrorCode.AUTH_INVALID_EMAIL]: '유효하지 않은 이메일 주소입니다',
	[ErrorCode.AUTH_WEAK_PASSWORD]: '비밀번호는 최소 6자 이상이어야 합니다',
	[ErrorCode.AUTH_USER_NOT_FOUND]: '등록되지 않은 사용자입니다',
	[ErrorCode.AUTH_WRONG_PASSWORD]: '잘못된 비밀번호입니다',

	// Apple 로그인 에러
	[ErrorCode.APPLE_UNKNOWN]: '알 수 없는 인증 오류가 발생했습니다',
	[ErrorCode.APPLE_MISSING_ENTITLEMENT]: '인증 오류가 발생했습니다',
	[ErrorCode.APPLE_UNSUPPORTED_PARENT_BUNDLE_LOCATION]:
		'인증 오류가 발생했습니다',
	[ErrorCode.APPLE_EXTENSION_NOT_FOUND]: '인증 오류가 발생했습니다',
	[ErrorCode.APPLE_EXTENSION_MISSING_IDENTIFIER]: '인증 오류가 발생했습니다',
	[ErrorCode.APPLE_DUPLICATE_EXTENSION_IDENTIFIER]: '인증 오류가 발생했습니다',
	[ErrorCode.APPLE_UNKNOWN_EXTENSION_CATEGORY]: '인증 오류가 발생했습니다',
	[ErrorCode.APPLE_CODE_SIGNATURE_INVALID]: '인증 오류가 발생했습니다',
	[ErrorCode.APPLE_VALIDATION_FAILED]: '인증 오류가 발생했습니다',
	[ErrorCode.APPLE_FORBIDDEN_BY_SYSTEM_POLICY]: '인증 오류가 발생했습니다',
	[ErrorCode.APPLE_AUTHORIZATION_REQUIRED]: '인증 오류가 발생했습니다',
	[ErrorCode.APPLE_REQUEST_CANCELED]: '인증 오류가 발생했습니다',
	[ErrorCode.APPLE_REQUEST_SUPERSEDED]: '인증 오류가 발생했습니다',

	// Google 로그인 에러
	[ErrorCode.GOOGLE_UNKNOWN]: '알 수 없는 Google 로그인 오류가 발생했습니다',
	[ErrorCode.GOOGLE_SIGN_IN_CANCELLED]: 'Google 로그인이 취소되었습니다',
	[ErrorCode.GOOGLE_IN_PROGRESS]: 'Google 로그인이 이미 진행 중입니다',
	[ErrorCode.GOOGLE_PLAY_SERVICES_NOT_AVAILABLE]:
		'Google Play 서비스를 사용할 수 없습니다',
};
