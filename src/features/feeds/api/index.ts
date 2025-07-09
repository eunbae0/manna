import { handleApiError } from '@/api/errors';
import { withApiLogging } from '@/api/utils/logger';
import { getFeedService } from './service';
import type { RequestData, ResponseData } from './types';

export const fetchUserFeeds = withApiLogging(
	async ({ lastVisible, limit }: RequestData): Promise<ResponseData> => {
		try {
			const feedService = getFeedService();
			const result = await feedService.getUserFeeds({
				lastVisible,
				limit,
			});

			// Pass metadata to the withApiLogging wrapper via context
			const context = {
				feeds: result.data.feeds,
				lastVisible: result.data.lastVisible,
				hasMore: result.data.hasMore,
			};

			// The withApiLogging wrapper will include this context in the success log
			return Object.assign(result.data, { __logContext: context });
		} catch (error) {
			throw handleApiError(error, 'fetchUserFeeds', 'feed');
		}
	},
	'fetchUserFeeds',
	'feed',
);
