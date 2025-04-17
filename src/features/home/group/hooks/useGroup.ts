import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchGroupById, updateGroup, deleteGroup } from '@/api/group';
import type { ClientGroup, UpdateGroupInput } from '@/api/group/types';
import { useToastStore } from '@/store/toast';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { GROUPS_QUERY_KEY, GROUP_QUERY_KEY, GROUP_STALE_TIME } from './useGroups';

/**
 * Hook for fetching and managing a single group
 * @param groupId The ID of the group to fetch
 */
export function useGroup(groupId: string | undefined) {
	const { showToast } = useToastStore();
	const queryClient = useQueryClient();
	const { user, updateUser, updateCurrentGroup } = useAuthStore();

	// 캐시 업데이트 함수
	const updateCacheData = (updatedGroup: ClientGroup | null) => {
		// 개별 그룹 캐시 업데이트
		if (updatedGroup) {
			queryClient.setQueryData([GROUP_QUERY_KEY, updatedGroup.id], updatedGroup);

			// 그룹 목록 캐시 업데이트
			const groupsCache = queryClient.getQueryData<ClientGroup[]>([GROUPS_QUERY_KEY]);
			if (groupsCache) {
				const updatedGroups = groupsCache.map(g => 
					g.id === updatedGroup.id ? updatedGroup : g
				);
				queryClient.setQueryData([GROUPS_QUERY_KEY], updatedGroups);
			}
		}
	};

	const {
		data: group,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: [GROUP_QUERY_KEY, groupId],
		queryFn: async () => {
			if (!groupId) return null;
			
			// 먼저 groups 캐시에서 확인
			const groupsCache = queryClient.getQueryData<ClientGroup[]>([GROUPS_QUERY_KEY]);
			const cachedGroup = groupsCache?.find(g => g.id === groupId);
			
			if (cachedGroup) return cachedGroup;
			
			// 캐시에 없으면 API 호출
			const fetchedGroup = await fetchGroupById(groupId);
			
			// groups 캐시 업데이트
			if (fetchedGroup && groupsCache) {
				const updatedGroups = [...groupsCache];
				const existingIndex = updatedGroups.findIndex(g => g.id === fetchedGroup.id);
				
				if (existingIndex >= 0) {
					updatedGroups[existingIndex] = fetchedGroup;
				} else {
					updatedGroups.push(fetchedGroup);
				}
				
				queryClient.setQueryData([GROUPS_QUERY_KEY], updatedGroups);
			}
			
			return fetchedGroup;
		},
		enabled: !!groupId,
		staleTime: GROUP_STALE_TIME,
	});

	const updateGroupMutation = useMutation({
		mutationFn: async ({
			groupId,
			data,
		}: { groupId: string; data: UpdateGroupInput }): Promise<void> => {
			await updateGroup(groupId, data);
		},
		onSuccess: (_, variables) => {
			showToast({
				type: 'success',
				message: '그룹명이 변경되었어요',
			});
			
			// 그룹 데이터 다시 가져오기
			fetchGroupById(variables.groupId).then(updatedGroup => {
				if (updatedGroup) {
					// 캐시 업데이트
					updateCacheData(updatedGroup);
				}
			});
		},
		onError: () => {
			showToast({
				type: 'error',
				message: '그룹명 변경에 실패했어요',
			});
		},
	});

	const deleteGroupMutation = useMutation({
		mutationFn: async (group: ClientGroup) => {
			const memberIds = group.members.map((m) => m.id);
			return await deleteGroup(memberIds, group.id);
		},
		onSuccess: () => {
			showToast({
				type: 'success',
				message: '그룹이 삭제되었어요',
			});

			if (!user || !group) return;
			
			// 사용자 상태 업데이트
			updateUser({
				...user,
				groups: user?.groups?.filter((g) => g.groupId !== group.id) ?? [],
			});
			
			updateCurrentGroup(
				user?.groups?.find((g) => g.groupId !== group.id) ?? null,
			);

			// 캐시에서 삭제된 그룹 제거
			queryClient.removeQueries({ queryKey: [GROUP_QUERY_KEY, group.id] });
			
			// 그룹 목록 캐시 업데이트
			const groupsCache = queryClient.getQueryData<ClientGroup[]>([GROUPS_QUERY_KEY]);
			if (groupsCache) {
				const updatedGroups = groupsCache.filter(g => g.id !== group.id);
				queryClient.setQueryData([GROUPS_QUERY_KEY], updatedGroups);
			}

			router.replace('/(app)/(tabs)');
		},
		onError: () => {
			showToast({
				type: 'error',
				message: '그룹 삭제에 실패했어요',
			});
		},
	});

	return {
		group,
		isLoading,
		error,
		refetch,
		updateGroup: (data: UpdateGroupInput) => {
			if (!groupId) {
				showToast({
					type: 'error',
					message: '그룹 ID가 없어요',
				});
				return;
			}
			return updateGroupMutation.mutate({ groupId, data });
		},
		deleteGroup: () => {
			if (!group) {
				showToast({
					type: 'error',
					message: '그룹이 없어요',
				});
				return;
			}
			return deleteGroupMutation.mutate(group);
		},
		isUpdating: updateGroupMutation.isPending,
		isDeleting: deleteGroupMutation.isPending,
	};
}
