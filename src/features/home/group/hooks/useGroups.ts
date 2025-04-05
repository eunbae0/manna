import { fetchGroupsByGroupIds } from '@/api/group';
import { useQuery } from '@tanstack/react-query';

export const GROUPS_QUERY_KEY = 'groups';

export function useGroups(groupIds: string[]) {
	const { data, isLoading, error } = useQuery({
		queryKey: [GROUPS_QUERY_KEY],
		queryFn: async () => await fetchGroupsByGroupIds(groupIds),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
	const groups = data ?? [];

	return { groups, isLoading, error };
}
