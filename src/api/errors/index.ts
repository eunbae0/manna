import { ApiError, ErrorCode } from './types';
import { mapFirebaseError } from './mappers/firebase';
import { errorMessages } from '@/localization/errors';
import { mapAppleError } from './mappers/apple';
import { logApiError } from '../utils/logger';

export function createApiError(
	code: ErrorCode,
	originalError?: unknown,
): ApiError {
	return new ApiError({
		code,
		message: errorMessages[code],
		originalError,
	});
}

export function handleApiError(
	error: unknown,
	operationName?: string,
	moduleName?: string,
): ApiError {
	// Get the calling function name if operation is not provided
	let finalOperation = operationName;
	if (!finalOperation) {
		try {
			const stack = new Error().stack;
			if (stack) {
				const callerLine = stack.split('\n')[2];
				finalOperation = callerLine.match(/at\s+(\S+)\s+/)?.[1] || 'unknown';
			}
		} catch (e) {
			finalOperation = 'unknown';
		}
	}

	// Try to determine the module from the error or use a default
	let finalModule = moduleName;
	if (!finalModule) {
		if (
			error &&
			typeof error === 'object' &&
			'code' in error &&
			typeof error.code === 'string'
		) {
			if (error.code.startsWith('auth/')) {
				finalModule = 'auth';
			} else if (error.code.startsWith('firestore/')) {
				finalModule = 'firestore';
			} else {
				finalModule = 'api';
			}
		} else {
			finalModule = 'api';
		}
	}

	// Log the error with context
	logApiError(error, finalOperation || 'unknown', finalModule || 'api');

	if (error instanceof ApiError) {
		return error;
	}

	// Firebase 오류 탐지 및 변환
	if (
		error &&
		typeof error === 'object' &&
		'code' in error &&
		typeof error.code === 'string' &&
		error.code.startsWith('auth/')
	) {
		return mapFirebaseError(error);
	}

	// Apple 오류 탐지 및 변환
	if (
		error &&
		typeof error === 'object' &&
		'code' in error &&
		typeof error.code === 'string' &&
		error.code.startsWith('ERR_')
	) {
		return mapAppleError(error);
	}

	// 기타 오류를 일반 API 오류로 변환
	return new ApiError({
		code: ErrorCode.AUTH_UNKNOWN,
		message:
			error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
		originalError: error,
	});
}
