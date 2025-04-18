import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { fetchGroupPrayerRequests } from '@/api/prayer-request';
import type { ClientPrayerRequest } from '@/api/prayer-request/types';

export const ALL_PRAYER_REQUESTS_QUERY_KEY = 'all-prayer-requests';
/**
 * Custom hook to fetch prayer requests for the current group
 * @returns Prayer requests data and query state
 */
export function usePrayerRequests() {
	const { currentGroup } = useAuthStore();
	const groupId = currentGroup?.groupId || '';

	const {
		data: prayerRequests,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: [ALL_PRAYER_REQUESTS_QUERY_KEY, groupId],
		queryFn: async (): Promise<ClientPrayerRequest[]> => {
			if (!groupId) {
				return [];
			}

			return fetchGroupPrayerRequests(groupId);
		},
		enabled: !!groupId,
	});

	return {
		prayerRequests: prayerRequests || [],
		isLoading,
		isError,
		error,
		refetch,
	};
}
