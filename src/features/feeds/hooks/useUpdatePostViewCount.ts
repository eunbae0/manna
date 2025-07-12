import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { FEEDS_QUERY_KEY } from '../hooks/useFeeds';
import type { ResponseData } from '../api/types';
import type { Feed } from '../api/types';
import type { BoardPost } from '@/features/board/types';

export function useUpdatePostViewCount() {
	const queryClient = useQueryClient();
	const updatePostViewCount = (postId: string) => {
		queryClient.setQueryData<InfiniteData<ResponseData>>(
			[FEEDS_QUERY_KEY],
			(oldData) => {
				if (!oldData) return;
				return {
					...oldData,
					pages: oldData.pages.map((p) => {
						return {
							...p,
							feeds: p.feeds.map((item) =>
								item.identifier.id === postId
									? ({
											...item,
											data: {
												...item.data,
												viewCount: (item.data as BoardPost).viewCount + 1,
											} as BoardPost,
										} as Feed)
									: item,
							),
						};
					}),
				};
			},
		);
	};
	return { updatePostViewCount };
}
