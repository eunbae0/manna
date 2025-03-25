import { fetchUserNotes, fetchUserNotesByWorshipType } from '@/api/notes';
import type { ClientWorshipType } from '@/api/worship-types/types';
import { useQuery } from '@tanstack/react-query';

/**
 * Custom hook to fetch notes with optional worship type filtering
 * @param selectedWorshipType Optional worship type to filter notes by
 * @returns Object containing notes data, loading state, and refetch function
 */
export function useNotes(selectedWorshipType: ClientWorshipType | null) {
	const { data, isLoading, isRefetching, refetch, error } = useQuery({
		queryKey: ['notes', selectedWorshipType?.name],
		queryFn: async () => {
			if (!selectedWorshipType) {
				const { notes, notesByMonth } = await fetchUserNotes();
				return { notes, notesByMonth };
			}

			const { notes, notesByMonth } = await fetchUserNotesByWorshipType(
				selectedWorshipType.name,
			);
			return { notes, notesByMonth };
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	const { notes = [], notesByMonth = {} } = data || {};

	return {
		notes,
		notesByMonth,
		isLoading,
		isRefetching,
		refetch,
		error,
	};
}
