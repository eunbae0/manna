import { fetchGroupsByGroupIds } from '@/api/group';
import type { UserGroup } from '@/shared/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const GROUPS_QUERY_KEY = 'groups';
export const GROUP_QUERY_KEY = 'group';
export const GROUP_STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useGroups(groupIds: UserGroup[]) {
	const queryClient = useQueryClient();

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: [GROUPS_QUERY_KEY, groupIds.map((g) => g.groupId)],
		queryFn: async () => {
			const groups = await fetchGroupsByGroupIds(
				groupIds.map((g) => g.groupId),
			);

			// 개별 그룹 캐시에도 데이터 저장
			for (const group of groups) {
				queryClient.setQueryData([GROUP_QUERY_KEY, group.id], group);
			}

			return groups;
		},
		staleTime: GROUP_STALE_TIME,
		enabled: !!groupIds.length,
	});
	const groups = data ?? [];

	return { groups, isLoading, error, refetch };
}
