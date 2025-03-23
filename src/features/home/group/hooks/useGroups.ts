import { fetchGroupsByGroupIds } from '@/api/group';
import { useQuery } from '@tanstack/react-query';

export function useGroups(groupIds: string[]) {
	const { data, isLoading, error } = useQuery({
		queryKey: ['groups'],
		queryFn: async () => await fetchGroupsByGroupIds(groupIds),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
	const groups = data ?? [];

	return { groups, isLoading, error };
}
