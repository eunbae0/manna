import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ClientFellowship, UpdateFellowshipInput } from '../api/types';
import {
	deleteFellowship,
	fetchFellowshipById,
	updateFellowship,
} from '../api';
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

	// 나눔 노트 조회 쿼리
	const {
		data: fellowship,
		isLoading,
		isError,
		error,
		refetch,
		isFetching,
	} = useQuery<ClientFellowship, Error>({
		queryKey: [FELLOWSHIP_QUERY_KEY, id],
		queryFn: async () => {
			if (!id) throw new Error('ID가 없습니다.');
			const data = await fetchFellowshipById({
				groupId: currentGroup?.groupId || '',
				fellowshipId: id,
			});
			if (!data) {
				throw new Error('나눔 노트를 찾을 수 없습니다.');
			}
			return data;
		},
		enabled: !!id && !!currentGroup?.groupId,
		staleTime: 5 * 60 * 1000, // 5분 동안 데이터를 신선한 상태로 유지
		retry: 2,
	});

	// 나눔 노트 업데이트 뮤테이션
	const updateFellowshipMutation = useMutation({
		mutationFn: async (updatedFellowship: UpdateFellowshipInput) => {
			if (!id) throw new Error('ID가 없습니다.');
			await updateFellowship(
				{
					groupId: currentGroup?.groupId || '',
					fellowshipId: id,
				},
				updatedFellowship,
			);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [FELLOWSHIP_QUERY_KEY, id],
			});
			showSuccess('나눔 노트가 업데이트되었어요');
		},
		onError: (error) => {
			console.error('Error updating fellowship:', error);
			showError('나눔 노트 업데이트 중 오류가 발생했어요');
		},
	});

	const deleteFellowshipMutation = useMutation({
		mutationFn: async () => {
			if (!id) throw new Error('ID가 없습니다');
			await deleteFellowship({
				groupId: currentGroup?.groupId || '',
				fellowshipId: id,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [FELLOWSHIP_QUERY_KEY, id],
			});
			showSuccess('나눔 노트가 삭제되었어요');
			if (router.canGoBack()) router.back();
		},
		onError: (error) => {
			console.error('Error deleting fellowship:', error);
			showError('나눔 노트 삭제 중 오류가 발생했어요');
		},
	});

	const updateFellowshipState = (updatedFellowship: UpdateFellowshipInput) => {
		if (!fellowship) return;

		updateFellowshipMutation.mutate(updatedFellowship);
	};

	return {
		fellowship,
		isLoading,
		isError,
		error,
		refetch,
		isFetching,
		updateFellowship: updateFellowshipState,
		isUpdating: updateFellowshipMutation.isPending,
		deleteFellowship: deleteFellowshipMutation.mutate,
	};
}
