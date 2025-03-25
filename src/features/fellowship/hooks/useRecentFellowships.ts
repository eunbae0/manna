import { useQuery } from '@tanstack/react-query';
import { fetchFellowshipsByDateRange } from '../api';
import { useAuthStore } from '@/store/auth';
import type { ClientFellowship } from '../api/types';

/**
 * Custom hook to get the most recent fellowship created within the last 6 hours
 * @returns Object containing the most recent fellowship data and query state
 */
export function useRecentFellowships() {
	const { currentGroup } = useAuthStore();

	// Calculate time range (last 6 hours)
	const endDate = new Date();
	const startDate = new Date(endDate.getTime() - 6 * 60 * 60 * 1000); // 6 hours ago

	// 고정된 queryKey를 사용하여 불필요한 리렌더링 방지
	return useQuery({
		queryKey: [
			'fellowships',
			'recent',
			currentGroup?.groupId || '',
			'last6hours',
		],
		queryFn: async () => {
			if (!currentGroup?.groupId) {
				return null;
			}

			// Since we don't have createdAt in the ClientFellowship type,
			// we'll use the date field from the fellowship info as an approximation
			const fellowships = await fetchFellowshipsByDateRange(
				currentGroup.groupId,
				startDate,
				endDate,
			);

			// Filter fellowships created within the time range
			const recentFellowships = fellowships.filter((fellowship) => {
				const fellowshipDate = fellowship.info.date.getTime();
				return (
					fellowshipDate >= startDate.getTime() &&
					fellowshipDate <= endDate.getTime()
				);
			});

			// Sort by date (newest first) and return only the most recent one
			if (recentFellowships.length === 0) {
				return null;
			}

			// Sort by date in descending order (newest first)
			recentFellowships.sort((a, b) => {
				return b.info.date.getTime() - a.info.date.getTime();
			});

			// Return only the most recent fellowship
			return recentFellowships[0];
		},
		enabled: !!currentGroup?.groupId,
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: true,
	});
}
