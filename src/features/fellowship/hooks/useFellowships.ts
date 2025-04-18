import { useQuery } from '@tanstack/react-query';
import type { ClientFellowship } from '../api/types';
import { useAuthStore } from '@/store/auth';
import { fetchGroupFellowships } from '../api';

/**
 * Custom hook to fetch all fellowships for the current group
 * @returns Query result with fellowships data, loading state, and refetch function
 */
export function useFellowships() {
	const { currentGroup } = useAuthStore();

	return useQuery({
		queryKey: ['fellowships', 'list', currentGroup?.groupId || ''],
		queryFn: async () => {
			if (!currentGroup?.groupId) {
				return [];
			}

			return await fetchGroupFellowships({
				groupId: currentGroup.groupId,
			});
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: !!currentGroup?.groupId,
	});
}
