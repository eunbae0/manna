import type { AppUpdate, AppVersionConfig } from './types';
import { handleApiError } from '../errors';
import { withApiLogging } from '../utils/logger';
import { getAppConfigService } from './service';

/**
 * Fetches all groups
 * @returns Array of group data
 */
export const fetchAppConfigVersion = withApiLogging(
	async (): Promise<AppVersionConfig | null> => {
		try {
			const appConfigService = getAppConfigService();
			return await appConfigService.getAppConfigVersion();
		} catch (error) {
			throw handleApiError(error, 'fetchAppConfigVersion', 'appConfig');
		}
	},
	'fetchAppConfigVersion',
	'appConfig',
);

export const fetchAllUpdateNotes = withApiLogging(
	async (): Promise<AppUpdate[] | null> => {
		try {
			const appConfigService = getAppConfigService();
			return await appConfigService.getAllUpdateNotes();
		} catch (error) {
			throw handleApiError(error, 'fetchAllUpdateNotes', 'appConfig');
		}
	},
	'fetchAllUpdateNotes',
	'appConfig',
);

export const fetchLatestUpdateNote = withApiLogging(
	async (): Promise<AppUpdate | null> => {
		try {
			const appConfigService = getAppConfigService();
			return await appConfigService.getLatestUpdateNote();
		} catch (error) {
			throw handleApiError(error, 'fetchLatestUpdateNote', 'appConfig');
		}
	},
	'fetchLatestUpdateNote',
	'appConfig',
);
