import { useInfiniteQuery } from '@tanstack/react-query';
import type { ClientFellowship } from '../api/types';
import { useAuthStore } from '@/store/auth';
import { fetchGroupFellowships } from '../api';
import type { Timestamp } from '@react-native-firebase/firestore';

export const USER_FELLOWSHIPS_QUERY_KEY = 'user-fellowships';

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
			items: ClientFellowship[];
			hasMore: boolean;
			total: number;
		},
		unknown,
		{
			pageParams: (Timestamp | undefined)[];
			pages: {
				items: ClientFellowship[];
				hasMore: boolean;
				total: number;
			}[];
		},
		[string, string, string],
		Timestamp | undefined
	>({
		queryKey: [USER_FELLOWSHIPS_QUERY_KEY, groupId, userId],
		queryFn: async ({ pageParam }) => {
			if (!groupId || !userId) {
				return {
					items: [],
					hasMore: false,
					total: 0,
				};
			}

			// 그룹의 모든 나눔을 가져온 후 필터링
			const result = await fetchGroupFellowships({
				groupId,
				startAfter: pageParam,
				limitCount: 10,
			});

			// 특정 유저가 참여한 나눔만 필터링
			const filteredItems = result.items.filter((fellowship) =>
				fellowship.info.members.some((member) => member.id === userId),
			);

			return {
				items: filteredItems,
				hasMore: filteredItems.length > 0 ? result.hasMore : false,
				total: filteredItems.length,
			};
		},
		initialPageParam: undefined,
		getNextPageParam: (lastPage, pages) => {
			// 더 이상 데이터가 없으면 undefined 반환
			if (!lastPage.hasMore || lastPage.items.length === 0) {
				return undefined;
			}

			// 마지막 아이템의 생성 시간을 다음 페이지 파라미터로 사용
			const lastItem = lastPage.items[lastPage.items.length - 1];
			// fellowship에 date 필드가 있는지 확인
			if (lastItem && 'date' in lastItem) {
				return lastItem.date as unknown as Timestamp;
			}
			return undefined;
		},
		enabled: !!groupId && !!userId,
	});
}
