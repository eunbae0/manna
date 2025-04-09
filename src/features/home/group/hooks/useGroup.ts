import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchGroupById, updateGroup, deleteGroup } from '@/api/group';
import type { ClientGroup, UpdateGroupInput } from '@/api/group/types';
import { useToastStore } from '@/store/toast';
import { router, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { GROUPS_QUERY_KEY } from './useGroups';

export const GROUP_QUERY_KEY = 'group';

/**
 * Hook for fetching and managing a single group
 * @param groupId The ID of the group to fetch
 */
export function useGroup(groupId: string | undefined) {
	const { showToast } = useToastStore();
	const queryClient = useQueryClient();
	const { user, updateUser, updateCurrentGroup } = useAuthStore();

	const invalidateGroupData = () => {
		queryClient.invalidateQueries({ queryKey: [GROUP_QUERY_KEY, groupId] });
		queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEY] });
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
			return await fetchGroupById(groupId);
		},
		enabled: !!groupId,
	});

	const updateGroupMutation = useMutation({
		mutationFn: async ({
			groupId,
			data,
		}: { groupId: string; data: UpdateGroupInput }) => {
			return await updateGroup(groupId, data);
		},
		onSuccess: () => {
			showToast({
				type: 'success',
				message: '그룹명이 변경되었어요',
			});
			invalidateGroupData();
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
			updateUser({
				...user,
				groups: user?.groups?.filter((g) => g.groupId !== group.id) ?? [],
			});
			updateCurrentGroup(
				user?.groups?.find((g) => g.groupId !== group.id) ?? null,
			);

			invalidateGroupData();

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
