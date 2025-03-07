import { ApiError, ErrorCode } from './types';
import { mapFirebaseError } from './mappers/firebase';
import { errorMessages } from '@/localization/errors';

export function createApiError(code: ErrorCode, originalError?: unknown): ApiError {
  return new ApiError({
    code,
    message: errorMessages[code],
    originalError
  });
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  // Firebase 오류 탐지 및 변환
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code.startsWith('auth/')) {
    return mapFirebaseError(error);
  }

  // 기타 오류를 일반 API 오류로 변환
  return new ApiError({
    code: ErrorCode.AUTH_UNKNOWN,
    message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
    originalError: error
  });
}