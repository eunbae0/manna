import { useInfiniteQuery } from '@tanstack/react-query';
import type { RequestData } from '../api/types';
import type { ResponseData } from '../api/types';
import { fetchUserFeeds } from '../api';

const LIMIT_COUNT = 10;
export const FEEDS_QUERY_KEY = 'user_feeds';

export function useInfiniteUserFeeds(
	limit: RequestData['limit'] = LIMIT_COUNT,
) {
	return useInfiniteQuery<ResponseData>({
		queryKey: [FEEDS_QUERY_KEY],
		queryFn: async ({ pageParam }) => {
			const result = await fetchUserFeeds({
				limit,
				lastVisible: pageParam as ResponseData['lastVisible'],
			});
			return result;
		},
		initialPageParam: null,
		getNextPageParam: (lastPage) => {
			return lastPage.lastVisible;
		},
		enabled: true,
	});
}
