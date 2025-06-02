import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { fetchFellowshipDates, fetchFellowshipsByDate } from '../api';
import {
	CALENDAR_FELLOWSHIPS_QUERY_KEY,
	SELECTED_DATE_FELLOWSHIPS_QUERY_KEY,
} from '../constants/queyKeys';

export function useCalendarFellowshipDates(year: number, month: number) {
	const { currentGroup } = useAuthStore();

	return useQuery({
		queryKey: [
			CALENDAR_FELLOWSHIPS_QUERY_KEY,
			currentGroup?.groupId || '',
			year,
			month,
		],
		queryFn: async () => {
			if (!currentGroup?.groupId) return [];

			// 해당 월의 나눔 날짜 정보만 가져오는 API 호출
			return await fetchFellowshipDates({
				groupId: currentGroup.groupId,
				year,
				month,
			});
		},
		enabled: !!currentGroup?.groupId,
	});
}

export function useSelectedDateFellowships(date: Date | null) {
	const { currentGroup } = useAuthStore();

	return useQuery({
		queryKey: [
			SELECTED_DATE_FELLOWSHIPS_QUERY_KEY,
			currentGroup?.groupId || '',
			date?.toISOString(),
		],
		queryFn: async () => {
			if (!currentGroup?.groupId || !date) return [];

			// 선택된 날짜의 나눔 상세 정보 가져오기
			return await fetchFellowshipsByDate({
				groupId: currentGroup.groupId,
				date,
			});
		},
		enabled: !!currentGroup?.groupId && !!date,
	});
}
