/**
 * Logger utility for application-wide logging
 * Provides consistent logging format and centralized control over log levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
	/** Additional context or metadata to include with the log */
	context?: Record<string, unknown>;
	/** Whether to include a stack trace (for errors) */
	includeStack?: boolean;
}

/**
 * Determines if logging is enabled based on environment
 * In production, we might want to disable certain log levels
 */
const isLoggingEnabled = (level: LogLevel): boolean => {
	// In a real app, you might check process.env.NODE_ENV or a config setting
	// For now, we'll enable all logging in development
	if (process.env.NODE_ENV === 'production') {
		// In production, only show warnings and errors
		return level === 'warn' || level === 'error';
	}

	return true;
};

/**
 * Format the log message with timestamp and other metadata
 */
const formatLogMessage = (
	level: LogLevel,
	message: string,
	options?: LogOptions,
): string => {
	const timestamp = new Date().toISOString();
	const contextStr = options?.context
		? `\nContext: ${JSON.stringify(options.context, null, 2)}`
		: '';

	return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
};

/**
 * Log an error with optional context and stack trace
 */
export const logError = (
	error: unknown,
	message = 'An error occurred',
	options?: LogOptions,
): void => {
	if (!isLoggingEnabled('error')) return;

	const errorObj = error instanceof Error ? error : new Error(String(error));
	const stack =
		options?.includeStack !== false ? `\nStack: ${errorObj.stack}` : '';

	// Combine error details with any provided context
	const context = {
		...(options?.context || {}),
		errorMessage: errorObj.message,
		errorName: errorObj.name,
	};

	// Log to console in development
	console.error(
		formatLogMessage('error', message, { ...options, context }),
		stack,
	);

	// In a real app, you might also send logs to a service like Sentry, LogRocket, etc.
	// Example: Sentry.captureException(errorObj, { extra: context });
};

/**
 * Log a warning message
 */
export const logWarning = (message: string, options?: LogOptions): void => {
	if (!isLoggingEnabled('warn')) return;
	console.warn(formatLogMessage('warn', message, options));
};

/**
 * Log an informational message
 */
export const logInfo = (message: string, options?: LogOptions): void => {
	if (!isLoggingEnabled('info')) return;
	console.info(formatLogMessage('info', message, options));
};

/**
 * Log a debug message
 */
export const logDebug = (message: string, options?: LogOptions): void => {
	if (!isLoggingEnabled('debug')) return;
	console.debug(formatLogMessage('debug', message, options));
};
