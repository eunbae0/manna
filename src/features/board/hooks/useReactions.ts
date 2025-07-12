import {
	type InfiniteData,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';
import { addReaction, getReactions, removeReaction } from '../api';
import type { BoardPost, ReactionMetadata, ReactionType } from '../types';
import { boardKeys } from './useBoardPosts';
import { commentKeys } from './useComments';
import type { ResponseData, Feed } from '#/functions/src/caller/types';
import { FEEDS_QUERY_KEY } from '@/features/feeds/hooks/useFeeds';

// Query keys
export const reactionKeys = {
	all: ['reactions'] as const,
	reactions: () => [...reactionKeys.all] as const,
	reactionsByTarget: (metadata: ReactionMetadata) =>
		[
			...reactionKeys.reactions(),
			metadata.targetType,
			metadata.groupId,
			metadata.postId,
			metadata.targetType === 'comment' ? metadata.commentId : null,
		].filter(Boolean) as const,
};

/**
 * 게시글이나 댓글의 반응 조회 훅
 * @param metadata 대상 메타데이터
 * @returns 반응 정보와 로딩 상태
 */
export function useReactions(metadata: ReactionMetadata) {
	return useQuery({
		queryKey: reactionKeys.reactionsByTarget(metadata),
		queryFn: () => getReactions(metadata),
	});
}

export function useReactionToggle() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			metadata,
			userId,
			reactionType,
			currentLikeState,
		}: {
			metadata: ReactionMetadata;
			userId: string;
			reactionType: ReactionType;
			currentLikeState: boolean;
		}) => {
			if (currentLikeState) {
				return removeReaction(metadata, userId, reactionType);
			}
			return addReaction(metadata, userId, reactionType);
		},
		onSuccess: (_, { metadata, currentLikeState }) => {
			// 해당 대상의 반응 캐시 무효화
			queryClient.invalidateQueries({
				queryKey: reactionKeys.reactionsByTarget(metadata),
			});

			// 대상 타입에 따라 관련 캐시 무효화
			if (metadata.targetType === 'post') {
				queryClient.invalidateQueries({
					queryKey: boardKeys.post(metadata.groupId, metadata.postId),
				});
				queryClient.invalidateQueries({
					queryKey: boardKeys.infinitePosts(metadata.groupId),
				});
			} else if (metadata.targetType === 'comment') {
				queryClient.invalidateQueries({
					queryKey: commentKeys.comment(
						metadata.groupId,
						metadata.postId,
						metadata.commentId,
					),
				});
			}

			queryClient.setQueryData<InfiniteData<ResponseData>>(
				[FEEDS_QUERY_KEY],
				(oldData) =>
					updateFeedsFunction(oldData, metadata.postId, currentLikeState),
			);
		},
	});
}

function updateFeedsFunction(
	oldData: InfiniteData<ResponseData> | undefined,
	postId: string,
	currentLikeState: boolean,
) {
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
									reactionSummary: {
										...(item.data as BoardPost).reactionSummary,
										like:
											((item.data as BoardPost).reactionSummary?.like || 0) +
											(currentLikeState ? -1 : 1),
									},
								} as BoardPost,
							} as Feed)
						: item,
				),
			};
		}),
	};
}
