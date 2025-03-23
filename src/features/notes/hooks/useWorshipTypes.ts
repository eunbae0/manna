import { fetchUserWorshipTypes } from '@/api/worship-types';
import { useQuery } from '@tanstack/react-query';

/**
 * Custom hook to fetch worship types for the current user
 * @returns Object containing worship types data, loading state, error, and refetch function
 */
export function useWorshipTypes() {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['worshipTypes'],
		queryFn: async () => await fetchUserWorshipTypes(),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	const worshipTypes = data ?? [];

	return {
		worshipTypes,
		isLoading,
		error,
		worshipTypeNames: worshipTypes.map((type) => type.name),
		defaultWorshipType: worshipTypes.length > 0 ? worshipTypes[0].name : '',
		refetch,
	};
}
