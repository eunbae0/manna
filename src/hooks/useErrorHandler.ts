import { useEffect } from 'react';
import { ApiError } from '@/api/errors/types';
import { useToastStore } from '@/store/toast';
import { logError } from '@/utils/logger';

/**
 * Enhanced error handling hook that both logs errors for developers
 * and displays toast notifications for users
 *
 * @param error - The API error to handle
 * @param clearError - Function to clear the error after handling
 * @param options - Additional options for error logging
 */
export function useErrorHandler(
	error: ApiError | null,
	clearError: () => void,
	options?: {
		/** Custom message prefix to use in logs */
		logPrefix?: string;
		/** Additional context to include in error logs */
		context?: Record<string, unknown>;
		/** Whether to include stack trace in logs */
		includeStack?: boolean;
	},
) {
	const { showError } = useToastStore();

	useEffect(() => {
		if (!error) return;

		// 1. Log the error for developers with detailed information
		const logPrefix = options?.logPrefix || 'Application Error';
		const logMessage = `${logPrefix}: ${error.code} - ${error.message}`;

		logError(error.originalError || error, logMessage, {
			context: {
				errorCode: error.code,
				errorPayload: error.payload,
				...options?.context,
			},
			includeStack: options?.includeStack ?? true,
		});

		// 2. Show toast notification for users (if not disabled)
		const disableToast = error instanceof ApiError ? error.disableToast : false;

		if (!disableToast) {
			showError(error);
		}

		// 3. Clear the error after handling to prevent duplicates
		clearError();
	}, [error, clearError, options]);
}
