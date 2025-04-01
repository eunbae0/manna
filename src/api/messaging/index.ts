import { getMessagingService } from './service';
import { handleApiError } from '../errors';
import { withApiLogging } from '../utils/logger';

export const requestUserPermission = withApiLogging(
	async (): Promise<boolean> => {
		try {
			const messagingService = getMessagingService();
			return await messagingService.requestUserPermission();
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'requestUserPermission',
	'messaging',
);

export const getToken = withApiLogging(
	async (): Promise<string> => {
		try {
			const messagingService = getMessagingService();
			return await messagingService.getToken();
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'getToken',
	'messaging',
);
