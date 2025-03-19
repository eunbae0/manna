import { useQuery } from '@tanstack/react-query';
import { fetchPrayerRequestsByDateRange } from '@/api/prayer-request';
import { getEndOfDayKST, getStartOfDayKST, parseKSTDate } from '@/utils/date';
import type { YYYYMMDD } from '@/types/date';

/**
 * Custom hook to fetch prayer requests for a specific date
 * @param groupId ID of the group
 * @param date Date in YYYYMMDD format
 * @returns Query result with prayer requests
 */
export function usePrayerRequestsByDate(groupId: string, date: YYYYMMDD) {
	return useQuery({
		queryKey: ['prayer-requests', groupId, date],
		queryFn: async () => {
			const dateObj = parseKSTDate(date);
			const startDate = getStartOfDayKST(dateObj);
			const endDate = getEndOfDayKST(dateObj);

			return fetchPrayerRequestsByDateRange(groupId, startDate, endDate);
		},
	});
}
