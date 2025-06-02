import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { fetchGroupFellowships } from '../api';
import type { ClientFellowshipV2 } from '../api/types';
import type { Timestamp } from '@react-native-firebase/firestore';
import type {
	InfiniteData,
	DefinedUseInfiniteQueryResult,
} from '@tanstack/react-query';
import { INFINITE_FELLOWSHIPS_QUERY_KEY } from '../constants/queyKeys';

/**
 * 무한 스크롤을 위한 나눔 기록 조회 훅
 * @param limit 페이지당 가져올 항목 수
 * @returns 무한 스크롤 쿼리 결과
 */
export function useInfiniteFellowships(
	limit = 8,
): DefinedUseInfiniteQueryResult<
	InfiniteData<
		{ items: ClientFellowshipV2[]; hasMore: boolean; total: number },
		unknown
	>,
	Error
> {
	const { currentGroup } = useAuthStore();

	return useInfiniteQuery<{
		items: ClientFellowshipV2[];
		hasMore: boolean;
		total: number;
	}>({
		queryKey: [
			...INFINITE_FELLOWSHIPS_QUERY_KEY,
			currentGroup?.groupId || '',
			{ limit },
		],
		queryFn: async ({ pageParam }: { pageParam: Timestamp | undefined }) => {
			if (!currentGroup?.groupId) {
				return {
					items: [],
					hasMore: false,
					total: 0,
				};
			}

			return await fetchGroupFellowships({
				groupId: currentGroup.groupId,
				limitCount: limit,
				startAfter: pageParam,
			});
		},
		initialPageParam: undefined,
		getNextPageParam: (lastPage) => {
			// 더 이상 데이터가 없으면 undefined 반환
			if (!lastPage.hasMore || lastPage.items.length === 0) {
				return undefined;
			}

			if (lastPage.items.length > 0) {
				const lastItem = lastPage.items[lastPage.items.length - 1];
				return lastItem.info.date || undefined;
			}
			return undefined;
		},
		enabled: !!currentGroup?.groupId,
	});
}
