import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPrayerRequest } from '@/api/prayer-request';
import { useAuthStore } from '@/store/auth';
import type { Member } from '@/api/prayer-request/types';
import { getKSTDate } from '@/shared/utils/date';
import { router } from 'expo-router';

/**
 * Custom hook for creating a prayer request
 * @param params Optional callbacks for success and error handling
 * @returns Object containing mutation function and state
 */
export function useCreatePrayerRequest() {
	const { currentGroup, user } = useAuthStore();
	const queryClient = useQueryClient();
	const groupId = currentGroup?.groupId || '';

	const { mutate, isPending, error, isSuccess } = useMutation({
		mutationFn: async ({
			value,
			date,
			isAnonymous,
		}: {
			value: string;
			date: Date;
			isAnonymous: boolean;
		}) => {
			if (!value.trim()) {
				throw new Error('Prayer request text is required');
			}

			const member: Member = {
				id: user?.id || '',
				displayName: user?.displayName || '',
				photoUrl: user?.photoUrl || '',
			};

			return createPrayerRequest(groupId, {
				value: value.trim(),
				date,
				member,
				isAnonymous,
			});
		},
		onSuccess: () => {
			const todayDate = getKSTDate(new Date());

			Promise.all([
				queryClient.invalidateQueries({
					queryKey: ['prayer-requests', groupId, todayDate],
				}),
				queryClient.invalidateQueries({
					queryKey: ['all-prayer-requests', groupId],
				}),
			]);
			router.back();
		},
		onError: (error: Error) => {
			console.error('Failed to create prayer request:', error);
		},
	});

	return {
		createPrayerRequest: mutate,
		isLoading: isPending,
		error,
		isSuccess,
	};
}
