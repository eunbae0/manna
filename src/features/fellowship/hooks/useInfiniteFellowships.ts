import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { fetchGroupFellowships } from '../api';
import type { ClientFellowship } from '../api/types';

/**
 * 무한 스크롤을 위한 나눔 기록 조회 훅
 * @param limit 페이지당 가져올 항목 수
 * @returns 무한 스크롤 쿼리 결과
 */
export function useInfiniteFellowships(limit = 8) {
	const { currentGroup } = useAuthStore();

	return useInfiniteQuery({
		queryKey: [
			'fellowships',
			'infinite',
			currentGroup?.groupId || '',
			{ limit },
		],
		queryFn: async ({ pageParam }) => {
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

			// 마지막 아이템의 createdAt을 다음 페이지 파라미터로 사용
			if (lastPage.items.length > 0) {
				const lastItem = lastPage.items[lastPage.items.length - 1];
				// createdAt은 서버 데이터에 있지만 클라이언트 타입에는 없으므로 any로 접근
				return (lastItem as any).createdAt || undefined;
			}
			return undefined;
		},
		enabled: !!currentGroup?.groupId,
	});
}
