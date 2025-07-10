import { useInfiniteQuery } from '@tanstack/react-query';
import type { RequestData } from '../api/types';
import type { ResponseData } from '../api/types';
import { fetchUserFeeds } from '../api';
import { useAuthStore } from '@/store/auth';

const LIMIT_COUNT = 10;
export const FEEDS_QUERY_KEY = 'user_feeds';

export function useInfiniteUserFeeds(
	limit: RequestData['limit'] = LIMIT_COUNT,
) {
	const { user } = useAuthStore();
	const groupIds = user?.groups?.map((group) => group.groupId);

	return useInfiniteQuery<ResponseData>({
		queryKey: [FEEDS_QUERY_KEY],
		queryFn: async ({ pageParam }) => {
			const result = await fetchUserFeeds({
				limit,
				lastVisible: pageParam as ResponseData['lastVisible'],
				groupIds,
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
