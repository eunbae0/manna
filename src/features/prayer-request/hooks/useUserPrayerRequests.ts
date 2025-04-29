import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { fetchGroupPrayerRequests } from '@/api/prayer-request';
import type { ClientPrayerRequest } from '@/api/prayer-request/types';

export const USER_PRAYER_REQUESTS_QUERY_KEY = 'user-prayer-requests';

/**
 * Custom hook to fetch prayer requests for a specific user
 * @param userId ID of the user to fetch prayer requests for
 * @returns Prayer requests data and query state
 */
export function useUserPrayerRequests(userId: string) {
	const { currentGroup } = useAuthStore();
	const groupId = currentGroup?.groupId || '';
	const targetUserId = userId;

	const {
		data,
		isLoading,
		isError,
		error,
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isRefetching,
	} = useInfiniteQuery<ClientPrayerRequest[]>({
		queryKey: [USER_PRAYER_REQUESTS_QUERY_KEY, groupId, targetUserId],
		queryFn: async ({ pageParam }) => {
			if (!groupId || !targetUserId) {
				return [];
			}

			// 그룹의 모든 기도제목을 가져온 후 필터링
			const allPrayerRequests = await fetchGroupPrayerRequests(
				groupId,
				pageParam as string,
			);

			// 특정 유저의 기도제목만 필터링
			return allPrayerRequests.filter(
				(prayerRequest) => prayerRequest.member.id === targetUserId,
			);
		},
		initialPageParam: '',
		getNextPageParam: (lastPage) => {
			// 마지막 페이지가 비어있으면 더 이상 데이터가 없음
			if (lastPage.length === 0) return undefined;

			// 마지막 문서의 createdAt 값을 다음 페이지 요청의 키로 사용
			const lastItem = lastPage[lastPage.length - 1];
			return lastItem?.createdAt || undefined;
		},
		enabled: !!groupId && !!targetUserId,
	});

	// 모든 페이지의 기도제목을 하나의 배열로 병합
	const prayerRequests = data?.pages.flat() || [];

	return {
		prayerRequests,
		isLoading,
		isError,
		error,
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isRefetching,
	};
}
