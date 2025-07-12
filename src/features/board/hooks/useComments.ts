import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	createComment,
	deleteComment,
	fetchCommentsByPostId,
	updateComment,
} from '../api';
import type { CreateCommentInput } from '../api/types';
import type { Comment, UpdateCommentRequest } from '../types';
import { boardKeys } from './useBoardPosts';
import { FEEDS_QUERY_KEY } from '@/features/feeds/hooks/useFeeds';

// Query keys
export const commentKeys = {
	all: ['comments'] as const,
	comments: () => [...commentKeys.all] as const,
	commentsByPost: (groupId: string, postId: string) =>
		[...commentKeys.comments(), groupId, postId] as const,
	comment: (groupId: string, postId: string, commentId: string) =>
		[...commentKeys.commentsByPost(groupId, postId), commentId] as const,
};

/**
 * 게시글의 댓글 목록 조회 훅
 * @param groupId 그룹 ID
 * @param postId 게시글 ID
 * @returns 댓글 목록과 로딩 상태
 */
export function useComments(
	groupId: string,
	postId: string,
	enabled?: boolean,
) {
	return useQuery({
		queryKey: commentKeys.commentsByPost(groupId, postId),
		queryFn: () => fetchCommentsByPostId({ groupId, postId }),
		enabled,
	});
}

/**
 * 댓글 생성 훅
 * @returns 댓글 생성 뮤테이션
 */
export function useCreateComment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			metadata,
			commentData,
		}: {
			metadata: { groupId: string };
			commentData: CreateCommentInput;
		}) => createComment(metadata, commentData),
		onSuccess: (newComment: Comment, { metadata, commentData }) => {
			// 해당 게시글의 댓글 목록 캐시 무효화
			queryClient.invalidateQueries({
				queryKey: commentKeys.commentsByPost(
					metadata.groupId,
					commentData.postId,
				),
			});

			// 게시글 상세 정보 캐시 무효화 (댓글 수 업데이트를 위해)
			queryClient.invalidateQueries({
				queryKey: boardKeys.post(metadata.groupId, commentData.postId),
			});

			// 피드 캐시 무효화
			queryClient.invalidateQueries({
				queryKey: [FEEDS_QUERY_KEY],
			});
		},
	});
}

/**
 * 댓글 업데이트 훅
 * @returns 댓글 업데이트 뮤테이션
 */
export function useUpdateComment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			metadata,
			commentData,
		}: {
			metadata: { postId: string; groupId: string; commentId: string };
			commentData: UpdateCommentRequest;
		}) => updateComment(metadata, commentData),
		onSuccess: (_, { metadata }) => {
			// 해당 게시글의 댓글 목록 캐시 무효화
			queryClient.invalidateQueries({
				queryKey: commentKeys.commentsByPost(metadata.groupId, metadata.postId),
			});

			// 게시글 상세 정보 캐시 무효화 (댓글 수 업데이트를 위해)
			queryClient.invalidateQueries({
				queryKey: boardKeys.post(metadata.groupId, metadata.postId),
			});

			// 피드 캐시 무효화
			queryClient.invalidateQueries({
				queryKey: [FEEDS_QUERY_KEY],
			});
		},
	});
}

/**
 * 댓글 삭제 훅
 * @returns 댓글 삭제 뮤테이션
 */
export function useDeleteComment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (metadata: {
			postId: string;
			groupId: string;
			commentId: string;
		}) => deleteComment(metadata),
		onSuccess: (_, metadata) => {
			// 해당 게시글의 댓글 목록 캐시 무효화
			queryClient.invalidateQueries({
				queryKey: commentKeys.commentsByPost(metadata.groupId, metadata.postId),
			});

			// 게시글 상세 정보 캐시 무효화 (댓글 수 업데이트를 위해)
			queryClient.invalidateQueries({
				queryKey: boardKeys.post(metadata.groupId, metadata.postId),
			});

			// 피드 캐시 무효화
			queryClient.invalidateQueries({
				queryKey: [FEEDS_QUERY_KEY],
			});
		},
	});
}
