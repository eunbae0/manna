import { useQuery } from '@tanstack/react-query';
import { fetchFellowshipsByDateRange } from '@/features/fellowship/api';
import {
	getEndOfDayKST,
	getStartOfDayKST,
	parseKSTDate,
} from '@/shared/utils/date';
import type { YYYYMMDD } from '@/shared/types/date';
import { useAuthStore } from '@/store/auth';

/**
 * Custom hook to fetch fellowships for a specific date
 * @param date Date in YYYYMMDD format
 * @returns Query result with fellowships
 */
export function useFellowshipsByDate(date: YYYYMMDD) {
	const dateObj = parseKSTDate(date);
	const startDate = getStartOfDayKST(dateObj);
	const endDate = getEndOfDayKST(dateObj);

	const { currentGroup } = useAuthStore();

	return useQuery({
		queryKey: ['fellowships', currentGroup?.groupId || '', date],
		queryFn: () =>
			fetchFellowshipsByDateRange(
				currentGroup?.groupId || '',
				startDate,
				endDate,
			),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
