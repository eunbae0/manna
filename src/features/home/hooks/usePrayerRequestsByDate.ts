import { useQuery } from '@tanstack/react-query';
import { fetchPrayerRequestsByDateRange } from '@/api/prayer-request';
import {
	getEndOfDayKST,
	getStartOfDayKST,
	parseKSTDate,
} from '@/shared/utils/date';
import type { YYYYMMDD } from '@/shared/types/date';

export const PRAYER_REQUESTS_QUERY_KEY = 'prayer-requests';

/**
 * Custom hook to fetch prayer requests for a specific date
 * @param groupId ID of the group
 * @param date Date in YYYYMMDD format
 * @returns Query result with prayer requests
 */
export function usePrayerRequestsByDate(groupId: string, date: YYYYMMDD) {
	return useQuery({
		queryKey: [PRAYER_REQUESTS_QUERY_KEY, groupId, date],
		queryFn: async () => {
			const dateObj = parseKSTDate(date);
			const startDate = getStartOfDayKST(dateObj);
			const endDate = getEndOfDayKST(dateObj);

			return fetchPrayerRequestsByDateRange(groupId, startDate, endDate);
		},
		enabled: !!groupId,
	});
}
