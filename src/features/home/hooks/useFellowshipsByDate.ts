import { useQuery } from '@tanstack/react-query';
import { fetchFellowshipsByDateRange } from '@/features/fellowship/api';
import {
	getEndOfDayKST,
	getStartOfDayKST,
	parseKSTDate,
} from '@/shared/utils/date';
import type { YYYYMMDD } from '@/shared/types/date';

/**
 * Custom hook to fetch fellowships for a specific date
 * @param date Date in YYYYMMDD format
 * @returns Query result with fellowships
 */
export function useFellowshipsByDate(date: YYYYMMDD) {
	const dateObj = parseKSTDate(date);
	const startDate = getStartOfDayKST(dateObj);
	const endDate = getEndOfDayKST(dateObj);

	// Hardcoded group ID for now - in a real app, you would get this from user context or props
	const groupId = 'oVgiDT2gRRuFUWuUV0Ya';

	return useQuery({
		queryKey: ['fellowships', groupId, date],
		queryFn: () => fetchFellowshipsByDateRange(groupId, startDate, endDate),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
