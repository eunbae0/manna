import {
	type InfiniteData,
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import {
	fetchGroupPrayerRequests,
	togglePrayerRequestReaction,
} from '@/api/prayer-request';
import type { ClientPrayerRequest, ServerPrayerRequest } from '@/api/prayer-request/types';
import { PRAYER_REQUESTS_QUERY_KEY } from '@/features/group/hooks/usePrayerRequestsByDate';
import * as Haptics from 'expo-haptics';
import { FEEDS_QUERY_KEY } from '@/features/feeds/hooks/useFeeds';
import type { Feed, ResponseData } from '@/features/feeds/api/types';

export const ALL_PRAYER_REQUESTS_QUERY_KEY = 'all-prayer-requests';
/**
 * Custom hook to fetch prayer requests for the current group
 * @returns Prayer requests data and query state
 */
export function usePrayerRequests() {
	const { currentGroup } = useAuthStore();
	const groupId = currentGroup?.groupId || '';

	const {
		data,
		isLoading,
		isError,
		error,
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery<ClientPrayerRequest[]>({
		queryKey: [ALL_PRAYER_REQUESTS_QUERY_KEY, groupId],
		queryFn: async ({ pageParam }) => {
			if (!groupId) {
				return [];
			}

			return fetchGroupPrayerRequests(groupId, pageParam as string);
		},
		initialPageParam: '',
		getNextPageParam: (lastPage) => {
			// 마지막 페이지가 비어있으면 더 이상 데이터가 없음
			if (lastPage.length === 0) return undefined;

			// 마지막 문서의 createdAt 값을 다음 페이지 요청의 키로 사용
			const lastItem = lastPage[lastPage.length - 1];
			return lastItem?.createdAt || undefined;
		},
		enabled: !!groupId,
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
	};
}

export function usePrayerRequestToggleLike({
	userId,
	prayerRequestId,
	groupId,
	performLikeAnimation,
}: {
	userId: string;
	prayerRequestId: string;
	groupId: string;
	performLikeAnimation: () => void;
}) {
	const queryClient = useQueryClient();
	const { currentGroup } = useAuthStore();

	const { mutate: toggleLike } = useMutation({
		mutationFn: async () => {
			return await togglePrayerRequestReaction(groupId, prayerRequestId, {
				type: 'LIKE',
				member: {
					id: userId,
				},
			});
		},
		onSuccess: (updatedReaction) => {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

			performLikeAnimation();

			console.log(updatedReaction);

			Promise.all([
				queryClient.invalidateQueries({
					queryKey: [PRAYER_REQUESTS_QUERY_KEY, currentGroup?.groupId || ''],
				}),
				queryClient.invalidateQueries({
					queryKey: [
						ALL_PRAYER_REQUESTS_QUERY_KEY,
						currentGroup?.groupId || '',
					],
				}),
				queryClient.setQueryData<InfiniteData<ResponseData>>(
					[FEEDS_QUERY_KEY],
					(oldData) => {
						if (!oldData) return;
						return {
							...oldData,
							pages: oldData.pages.map(p => {
								return {
									...p,
									feeds: p.feeds.map((item) =>
										item.identifier.id === prayerRequestId
											? {
													...item,
													data: { ...item.data, reactions: updatedReaction } as ServerPrayerRequest,
												} as Feed
											: item
									)
							}}
						)}	
					}
				)
			]);
		
			// // tracking amplitude
			// trackAmplitudeEvent('기도제목 좋아요', {
			// 	screen: 'Tab_Home',
			// 	eventType,
			// });
		},
	});
	return {
		toggleLike,
	};
}
