import { auth } from '@/firebase/config';
import { logDebug, logError, logInfo, logWarning } from '@/utils/logger';

export interface ApiLogContext {
	operation: string;
	module: string;
	userId?: string;
	[key: string]: unknown;
}

/**
 * Logs the start of an API operation
 * @param operation Name of the operation being performed
 * @param module API module name (e.g., 'auth', 'notes')
 * @param context Additional context information
 */
export function logApiStart(
	operation: string,
	module: string,
	context: Record<string, unknown> = {},
): void {
	logInfo(`API Call Started: ${module}.${operation}`, {
		context: {
			operation,
			module,
			...context,
		},
	});
}

/**
 * Logs the successful completion of an API operation
 * @param operation Name of the operation being performed
 * @param module API module name (e.g., 'auth', 'notes')
 * @param context Additional context information
 */
export function logApiSuccess(
	operation: string,
	module: string,
	context: Record<string, unknown> = {},
): void {
	logInfo(`API Call Succeeded: ${module}.${operation}`, {
		context: {
			operation,
			module,
			...context,
		},
	});
}

/**
 * Logs an API operation error
 * @param error The error that occurred
 * @param operation Name of the operation being performed
 * @param module API module name (e.g., 'auth', 'notes')
 * @param context Additional context information
 */
export function logApiError(
	error: unknown,
	operation: string,
	module: string,
	context: Record<string, unknown> = {},
): void {
	logError(error, `API Call Failed: ${module}.${operation}`, {
		includeStack: true,
		context: {
			operation,
			module,
			...context,
		},
	});
}

/**
 * Creates a higher-order function that wraps an API function with logging
 * @param fn The API function to wrap
 * @param operation Name of the operation being performed
 * @param module API module name (e.g., 'auth', 'notes')
 * @returns A wrapped function that includes logging
 */

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function withApiLogging<T extends (...args: any[]) => Promise<unknown>>(
	fn: T,
	operation: string,
	module: string,
): T {
	return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
		// Extract userId if available (commonly from auth.currentUser)
		const userId = auth.currentUser?.uid;

		const baseContext = userId ? { userId } : {};

		try {
			logApiStart(operation, module, baseContext);

			const result = await fn(...args);

			// Extract any __logContext if present in the result
			let additionalContext = {};
			if (result && typeof result === 'object') {
				const resultWithContext = result as Record<string, unknown>;
				if (
					'__logContext' in resultWithContext &&
					resultWithContext.__logContext
				) {
					additionalContext = resultWithContext.__logContext as Record<
						string,
						unknown
					>;
					// Set to undefined instead of using delete to avoid performance issues
					resultWithContext.__logContext = undefined;
				}
			}

			// For success logging, include info about the result
			const resultInfo =
				result && typeof result === 'object'
					? { resultType: result.constructor.name }
					: {};

			logApiSuccess(operation, module, {
				...baseContext,
				...resultInfo,
				...additionalContext,
			});

			return result as ReturnType<T>;
		} catch (error) {
			logApiError(error, operation, module, baseContext);
			throw error;
		}
	}) as T;
}
