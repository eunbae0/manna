import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPrayerRequest } from '@/api/prayer-request';
import { useAuthStore } from '@/store/auth';
import type { Member } from '@/api/prayer-request/types';
import type { YYYYMMDD } from '@/shared/types/date';
import { getKSTDate } from '@/shared/utils/date';

interface CreatePrayerRequestParams {
	onSuccess?: () => void;
	onError?: (error: Error) => void;
}

/**
 * Custom hook for creating a prayer request
 * @param params Optional callbacks for success and error handling
 * @returns Object containing mutation function and state
 */
export function useCreatePrayerRequest({
	onSuccess,
	onError,
}: CreatePrayerRequestParams = {}) {
	const { currentGroup, user } = useAuthStore();
	const queryClient = useQueryClient();
	const groupId = currentGroup?.groupId || '';

	const { mutate, isPending, error, isSuccess } = useMutation({
		mutationFn: async ({
			value,
			date,
			isAnonymous = false,
		}: {
			value: string;
			date: Date;
			isAnonymous?: boolean;
		}) => {
			if (!value.trim()) {
				throw new Error('Prayer request text is required');
			}

			const member: Member = {
				id: user?.id || '',
				displayName: isAnonymous ? '익명' : user?.displayName || '',
				photoUrl: isAnonymous ? '' : user?.photoUrl || '',
			};

			return createPrayerRequest(groupId, {
				value: value.trim(),
				date,
				member,
			});
		},
		onSuccess: () => {
			// Get today's date in YYYYMMDD format for the query key
			const todayDate = getKSTDate(new Date());

			// Invalidate both the daily prayer requests and all prayer requests
			Promise.all([
				queryClient.invalidateQueries({
					queryKey: ['prayer-requests', groupId, todayDate],
				}),
				queryClient.invalidateQueries({
					queryKey: ['all-prayer-requests', groupId],
				}),
			]);

			onSuccess?.();
		},
		onError: (error: Error) => {
			console.error('Failed to create prayer request:', error);
			onError?.(error);
		},
	});

	return {
		createPrayerRequest: mutate,
		isLoading: isPending,
		error,
		isSuccess,
	};
}
