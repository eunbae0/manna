/**
 * Centralized API module that exports all API functions with logging
 *
 * This module re-exports all API functions from various modules
 * and ensures that they all have consistent logging behavior.
 */

// Re-export all API functions from the auth module
export * from './auth';

// Re-export all API functions from the notes module
export * from '../features/note/api';

// Export error handling utilities
export { handleApiError } from './errors';

// Export API logging utilities for direct use in components if needed
export { logApiStart, logApiSuccess, logApiError } from './utils/logger';
