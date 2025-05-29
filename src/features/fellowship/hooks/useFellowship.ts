import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import type { ClientFellowshipV2, UpdateFellowshipInputV2 } from '../api/types';
import {
	fetchFellowshipById,
	deleteFellowship,
	updateFellowship,
} from '../api';
import { getFellowshipService } from '../api/service';
import { useToastStore } from '@/store/toast';
import { useAuthStore } from '@/store/auth';
import { router } from 'expo-router';

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
			showSuccess('나눔 노트가 업데이트되었어요');
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

	return {
		fellowship: fellowshipQuery.data,
		isLoading: fellowshipQuery.isLoading,
		isError: fellowshipQuery.isError,
		error: fellowshipQuery.error,
		refetch: fellowshipQuery.refetch,
		isFetching: fellowshipQuery.isFetching,
		updateFellowship: updateFellowshipState,
		isUpdating: updateMutation.isPending,
		updateError: updateMutation.error,
		deleteFellowship: deleteFellowshipState,
		isDeleting: deleteMutation.isPending,
		deleteError: deleteMutation.error,
	};
}
