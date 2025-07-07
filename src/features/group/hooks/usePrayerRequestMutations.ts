import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePrayerRequest, deletePrayerRequest } from '@/api/prayer-request';
import type { UpdatePrayerRequestInput } from '@/api/prayer-request/types';
import { useAuthStore } from '@/store/auth';

/**
 * Custom hook for prayer request mutation operations
 * @returns Object containing mutation functions for updating and deleting prayer requests
 */
export function usePrayerRequestMutations() {
	const queryClient = useQueryClient();
	const { currentGroup } = useAuthStore();
	const groupId = currentGroup?.groupId || '';

	// Update prayer request mutation
	const updatePrayerRequestMutation = useMutation({
		mutationFn: ({
			prayerRequestId,
			data,
		}: { prayerRequestId: string; data: UpdatePrayerRequestInput }) =>
			updatePrayerRequest(groupId, prayerRequestId, data),
	});

	// Delete prayer request mutation
	const deletePrayerRequestMutation = useMutation({
		mutationFn: (prayerRequestId: string) =>
			deletePrayerRequest(groupId, prayerRequestId),
	});

	return {
		updatePrayerRequest: updatePrayerRequestMutation.mutate,
		isUpdating: updatePrayerRequestMutation.isPending,
		updateError: updatePrayerRequestMutation.error,

		deletePrayerRequest: deletePrayerRequestMutation.mutate,
		isDeleting: deletePrayerRequestMutation.isPending,
		deleteError: deletePrayerRequestMutation.error,
	};
}
