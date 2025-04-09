import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeGroupMember } from '@/api/group';
import { getUserService } from '@/api/user/service';
import { useToastStore } from '@/store/toast';
import { useAuthStore } from '@/store/auth';
import type { ClientGroup } from '@/api/group/types';
import { GROUP_QUERY_KEY } from './useGroup';
import { GROUPS_QUERY_KEY } from './useGroups';
import { router } from 'expo-router';

/**
 * Hook for leaving a group
 */
export function useLeaveGroup() {
	const { showToast } = useToastStore();
	const queryClient = useQueryClient();
	const { user, updateUser, updateCurrentGroup } = useAuthStore();
	const userService = getUserService();

	const leaveGroupMutation = useMutation({
		mutationFn: async ({ group }: { group: ClientGroup }) => {
			if (!user) throw new Error('User not logged in');

			// Remove user from group members
			await removeGroupMember(group.id, user.id);

			// Remove group from user's groups
			await userService.removeUserGroup(user.id, group.id);

			return group;
		},
		onSuccess: (group) => {
			showToast({
				type: 'success',
				message: '그룹을 나갔어요',
			});

			if (!user) return;

			// Update local user state
			const updatedGroups =
				user.groups?.filter((g) => g.groupId !== group.id) || [];
			updateUser({
				...user,
				groups: updatedGroups,
			});

			// If the current group is the one being left, switch to another group
			const currentGroup = user.groups?.find((g) => g.groupId === group.id);
			if (currentGroup) {
				updateCurrentGroup(updatedGroups.length > 0 ? updatedGroups[0] : null);
			}

			// Invalidate queries
			queryClient.invalidateQueries({ queryKey: [GROUP_QUERY_KEY] });
			queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEY] });

			router.replace('/(app)/(tabs)');
		},
		onError: () => {
			showToast({
				type: 'error',
				message: '그룹 나가기에 실패했어요',
			});
		},
	});

	return {
		leaveGroup: (group: ClientGroup) => leaveGroupMutation.mutate({ group }),
		isLeaving: leaveGroupMutation.isPending,
	};
}
