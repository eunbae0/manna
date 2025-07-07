import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPrayerRequest } from '@/api/prayer-request';
import { useAuthStore } from '@/store/auth';
import { getKSTDate } from '@/shared/utils/date';
import { router } from 'expo-router';
import { PRAYER_REQUESTS_QUERY_KEY } from '@/features/group/hooks/usePrayerRequestsByDate';
import { ALL_PRAYER_REQUESTS_QUERY_KEY } from './usePrayerRequests';
import { useToastStore } from '@/store/toast';

/**
 * Custom hook for creating a prayer request
 * @param params Optional callbacks for success and error handling
 * @returns Object containing mutation function and state
 */
export function useCreatePrayerRequest() {
	const { currentGroup, user } = useAuthStore();
	const queryClient = useQueryClient();
	const groupId = currentGroup?.groupId || '';

	const { showError } = useToastStore();

	const { mutate, isPending, error, isSuccess } = useMutation({
		mutationFn: async ({
			value,
			isAnonymous,
		}: {
			value: string;
			isAnonymous: boolean;
		}) => {
			if (!value.trim()) {
				throw new Error('Prayer request text is required');
			}

			return createPrayerRequest(groupId, {
				value: value.trim(),
				member: { id: user?.id || '' },
				isAnonymous,
			});
		},
		onSuccess: () => {
			const todayDate = getKSTDate(new Date());

			Promise.all([
				queryClient.invalidateQueries({
					queryKey: [PRAYER_REQUESTS_QUERY_KEY, groupId, todayDate],
				}),
				queryClient.invalidateQueries({
					queryKey: [ALL_PRAYER_REQUESTS_QUERY_KEY, groupId],
				}),
			]);
			router.back();
		},
		onError: (error: Error) => {
			showError('기도 제목을 생성하는데 실패했어요.');
		},
	});

	return {
		createPrayerRequest: mutate,
		isLoading: isPending,
		error,
		isSuccess,
	};
}
