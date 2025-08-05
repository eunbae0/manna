import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import type {
	ClientFellowshipV2,
	UpdateFellowshipInputV2,
	FellowshipContentType,
} from '../api/types';
import {
	fetchFellowshipById,
	deleteFellowship,
	updateFellowship,
} from '../api';
import { getFellowshipService } from '../api/service';
import { useToastStore } from '@/store/toast';
import { useAuthStore } from '@/store/auth';
import { router } from 'expo-router';
import {
	serverTimestamp,
	Timestamp,
	FieldValue,
} from '@react-native-firebase/firestore';
import { FELLOWSHIPS_QUERY_KEY } from '../constants/queyKeys';
import { FEEDS_QUERY_KEY } from '@/features/feeds/hooks/useFeeds';
import { v4 as uuidv4 } from 'uuid';

export const FELLOWSHIP_QUERY_KEY = 'fellowship';

/**
 * 특정 나눔 노트의 상세 정보를 가져오는 훅
 */
export function useFellowship(id: string | undefined) {
	const queryClient = useQueryClient();
	const { showSuccess, showError } = useToastStore();
	const { currentGroup } = useAuthStore();
	const groupId = currentGroup?.groupId || '';

	// React Query를 사용하여 fellowship 데이터 가져오기
	const fellowshipQuery = useQuery<ClientFellowshipV2 | null>({
		queryKey: [FELLOWSHIP_QUERY_KEY, groupId, id],
		queryFn: async () => {
			return null;
		},
		enabled: !!id && !!groupId,
	});

	// 실시간 업데이트 리스너 설정
	useEffect(() => {
		if (!id || !groupId) {
			return;
		}
		const fellowshipService = getFellowshipService();

		const unsubscribe = fellowshipService.onFellowshipSnapshot(
			{ groupId, fellowshipId: id },
			(data: ClientFellowshipV2 | null) => {
				if (data) {
					queryClient.setQueryData([FELLOWSHIP_QUERY_KEY, groupId, id], data);
				}
			},
			(err: Error) => {
				console.error('Error listening to fellowship:', err);
				queryClient.invalidateQueries({
					queryKey: [FELLOWSHIP_QUERY_KEY, groupId, id],
				});
			},
		);

		return () => {
			unsubscribe();
		};
	}, [id, groupId, queryClient]);

	// 나눔 노트 업데이트를 위한 mutation
	const updateMutation = useMutation({
		mutationFn: async (updatedFellowship: UpdateFellowshipInputV2) => {
			if (!id || !groupId) {
				throw new Error('ID가 없습니다.');
			}

			return updateFellowship(
				{
					groupId,
					fellowshipId: id,
				},
				updatedFellowship,
			);
		},
		onSuccess: () => {
			// showSuccess('나눔 노트가 업데이트되었어요');
		},
		onError: (error) => {
			console.error('Error updating fellowship:', error);
			showError('나눔 노트 업데이트 중 오류가 발생했어요');
		},
	});

	// 나눔 노트 삭제를 위한 mutation
	const deleteMutation = useMutation({
		mutationFn: async () => {
			if (!id || !groupId) {
				throw new Error('ID가 없습니다.');
			}

			return deleteFellowship({
				groupId,
				fellowshipId: id,
			});
		},
		onSuccess: () => {
			showSuccess('나눔 노트가 삭제되었어요');
			// 삭제 후 뒤로 가기
			if (router.canGoBack()) router.back();

			// 관련 쿼리 무효화
			queryClient.invalidateQueries({
				queryKey: [FELLOWSHIP_QUERY_KEY],
			});
			queryClient.invalidateQueries({
				queryKey: [FELLOWSHIPS_QUERY_KEY],
			});

			// 피드 쿼리 무효화
			queryClient.invalidateQueries({
				queryKey: [FEEDS_QUERY_KEY],
			});
		},
		onError: (error) => {
			console.error('Error deleting fellowship:', error);
			showError('나눔 노트 삭제 중 오류가 발생했어요');
		},
	});

	// 편의를 위한 래퍼 함수
	const updateFellowshipState = useCallback(
		(updatedFellowship: UpdateFellowshipInputV2) => {
			updateMutation.mutate(updatedFellowship);
		},
		[updateMutation],
	);

	const deleteFellowshipState = useCallback(() => {
		deleteMutation.mutate();
	}, [deleteMutation]);

	const toggleLike = useCallback(
		(
			contentType: FellowshipContentType,
			answerId: string,
			answerMemberId: string,
			authorId: string,
			isLiked: boolean,
		) => {
			const AnswerContent =
				fellowshipQuery.data?.content?.categories?.[contentType]?.items?.[
					answerId
				]?.answers?.[answerMemberId];

			if (!AnswerContent) return;

			if (typeof AnswerContent === 'string') {
				updateFellowshipState({
					content: {
						categories: {
							[contentType]: {
								items: {
									[answerId]: {
										answers: {
											[answerMemberId]: {
												comments: {},
												commentCount: 0,
												content: AnswerContent,
												reactions: {
													likeCount: 1,
													likes: [authorId],
												},
											},
										},
									},
								},
							},
						},
					},
				});
				return;
			}

			// 현재 좋아요 상태를 기반으로 likeCount와 likes 배열을 업데이트
			const updatedLikes = isLiked
				? AnswerContent.reactions?.likes?.filter((id) => id !== authorId) || []
				: [...(AnswerContent.reactions?.likes || []), authorId];

			const updatedLikeCount = updatedLikes.length;

			updateFellowshipState({
				content: {
					categories: {
						[contentType]: {
							items: {
								[answerId]: {
									answers: {
										[answerMemberId]: {
											reactions: {
												likeCount: updatedLikeCount,
												likes: updatedLikes,
											},
										},
									},
								},
							},
						},
					},
				},
			});
		},
		[fellowshipQuery.data, updateFellowshipState],
	);

	const addComment = useCallback(
		(
			contentType: FellowshipContentType,
			answerId: string,
			answerMemberId: string,
			authorId: string,
			commentText: string,
		) => {
			const AnswerContent =
				fellowshipQuery.data?.content?.categories?.[contentType]?.items?.[
					answerId
				]?.answers?.[answerMemberId];

			const newCommentId = uuidv4();
			const newComment = {
				id: newCommentId,
				authorId: authorId,
				content: commentText,
				createdAt: new Date(),
				updatedAt: new Date(),
				isDeleted: false,
			};

			if (!AnswerContent) return;

			if (typeof AnswerContent === 'string') {
				updateFellowshipState({
					content: {
						categories: {
							[contentType]: {
								items: {
									[answerId]: {
										answers: {
											[answerMemberId]: {
												content: AnswerContent,
												reactions: {
													likeCount: 0,
													likes: [],
												},
												commentCount: 1,
												comments: {
													[newCommentId]: newComment,
												},
											},
										},
									},
								},
							},
						},
					},
				});
				return;
			}

			updateFellowshipState({
				content: {
					categories: {
						[contentType]: {
							items: {
								[answerId]: {
									answers: {
										[answerMemberId]: {
											comments: {
												[newCommentId]: newComment,
											},
											commentCount: AnswerContent.commentCount + 1,
										},
									},
								},
							},
						},
					},
				},
			});
		},
		[fellowshipQuery.data, updateFellowshipState],
	);

	const updateComment = useCallback(
		(
			contentType: FellowshipContentType,
			answerId: string,
			answerMemberId: string,
			commentId: string,
			updatedText: string,
		) => {
			const AnswerContent =
				fellowshipQuery.data?.content?.categories?.[contentType]?.items?.[
					answerId
				]?.answers?.[answerMemberId];

			if (typeof AnswerContent === 'string') {
				return;
			}

			const updatedComment = {
				id: commentId,
				authorId: answerMemberId,
				content: updatedText,
				updatedAt: new Date(),
			};

			updateFellowshipState({
				content: {
					categories: {
						[contentType]: {
							items: {
								[answerId]: {
									answers: {
										[answerMemberId]: {
											comments: {
												[commentId]: updatedComment,
											},
										},
									},
								},
							},
						},
					},
				},
			});
		},
		[fellowshipQuery.data, updateFellowshipState],
	);

	const deleteComment = useCallback(
		(
			contentType: FellowshipContentType,
			answerId: string,
			answerMemberId: string,
			commentId: string,
		) => {
			const AnswerContent =
				fellowshipQuery.data?.content?.categories?.[contentType]?.items?.[
					answerId
				]?.answers?.[answerMemberId];

			if (typeof AnswerContent === 'string' || !AnswerContent) {
				return;
			}

			const newCommentCount = AnswerContent.commentCount - 1;

			updateFellowshipState({
				content: {
					categories: {
						[contentType]: {
							items: {
								[answerId]: {
									answers: {
										[answerMemberId]: {
											comments: {
												[commentId]: {
													isDeleted: true,
													deletedAt: new Date(),
												},
											},
											commentCount: newCommentCount,
										},
									},
								},
							},
						},
					},
				},
			});
		},
		[fellowshipQuery.data, updateFellowshipState],
	);

	return {
		fellowship: fellowshipQuery.data,
		isLoading: fellowshipQuery.isLoading,
		isError: fellowshipQuery.isError,
		error: fellowshipQuery.error,
		isFetching: fellowshipQuery.isFetching,
		updateFellowship: updateFellowshipState,
		isUpdating: updateMutation.isPending,
		updateError: updateMutation.error,
		deleteFellowship: deleteFellowshipState,
		isDeleting: deleteMutation.isPending,
		deleteError: deleteMutation.error,
		toggleLike,
		addComment,
		updateComment,
		deleteComment,
	};
}
