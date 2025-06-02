import { useInfiniteQuery } from '@tanstack/react-query';
import type { ClientFellowshipV2 } from '../api/types';
import { useAuthStore } from '@/store/auth';
import { fetchUserFellowships } from '../api';
import type { Timestamp } from '@react-native-firebase/firestore';
import { USER_FELLOWSHIPS_QUERY_KEY } from '../constants/queyKeys';

/**
 * 특정 유저가 참여한 나눔(fellowship) 목록을 무한 스크롤로 조회하는 훅
 * @param userId 유저 ID
 * @returns 무한 스크롤 나눔 목록과 로딩 상태
 */
export function useUserFellowships(userId: string) {
	const { currentGroup } = useAuthStore();
	const groupId = currentGroup?.groupId || '';

	return useInfiniteQuery<
		{
			items: ClientFellowshipV2[];
			hasMore: boolean;
			total: number;
		},
		unknown,
		{
			pageParams: (Timestamp | undefined)[];
			pages: {
				items: ClientFellowshipV2[];
				hasMore: boolean;
				total: number;
			}[];
		},
		[string, string, string, string],
		Timestamp | undefined
	>({
		queryKey: [...USER_FELLOWSHIPS_QUERY_KEY, groupId, userId],
		queryFn: async ({ pageParam }) => {
			if (!groupId || !userId) {
				return {
					items: [],
					hasMore: false,
					total: 0,
				};
			}

			// 서버에서 직접 특정 유저가 참여한 나눔만 필터링하여 가져오기
			return await fetchUserFellowships({
				groupId,
				userId,
				startAfter: pageParam,
				limitCount: 8,
			});
		},
		getNextPageParam: (lastPage) => {
			if (!lastPage.hasMore) {
				return undefined;
			}
			const lastItem = lastPage.items[lastPage.items.length - 1];
			return lastItem?.metadata.createdAt;
		},
		getPreviousPageParam: (firstPage) => {
			if (firstPage.items.length === 0) {
				return undefined;
			}
			const firstItem = firstPage.items[0];
			return firstItem?.metadata.createdAt;
		},
		initialPageParam: undefined,
	});
}
