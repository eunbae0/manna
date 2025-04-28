import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addReaction, getReactions, removeReaction } from '../api';
import type { ReactionMetadata, ReactionType } from '../types';
import { boardKeys } from './useBoardPosts';
import { commentKeys } from './useComments';

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

/**
 * 반응 추가 훅
 * @returns 반응 추가 뮤테이션
 */
export function useAddReaction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			metadata,
			userId,
			reactionType,
		}: {
			metadata: ReactionMetadata;
			userId: string;
			reactionType: ReactionType;
		}) => addReaction(metadata, userId, reactionType),
		onSuccess: (_, { metadata }) => {
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
		},
	});
}

/**
 * 반응 제거 훅
 * @returns 반응 제거 뮤테이션
 */
export function useRemoveReaction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			metadata,
			userId,
			reactionType,
		}: {
			metadata: ReactionMetadata;
			userId: string;
			reactionType: ReactionType;
		}) => removeReaction(metadata, userId, reactionType),
		onSuccess: (_, { metadata }) => {
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
		},
	});
}
