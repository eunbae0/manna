import type { AppVersionConfig } from './types';
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
