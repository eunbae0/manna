import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	fetchGroupById,
	addGroupMember,
	removeGroupMember,
	updateGroupMember,
} from '@/api/group';
import type { AddGroupMemberInput, GroupMemberRole } from '@/api/group/types';
import { GROUPS_QUERY_KEY } from './useGroups';

export const GROUP_MEMBER_QUERY_KEY = 'group_member';

export function useGroupMembers(groupId: string) {
	const queryClient = useQueryClient();

	// Query to fetch group data with members
	const {
		data: group,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: [GROUP_MEMBER_QUERY_KEY, groupId],
		queryFn: () => fetchGroupById(groupId),
		enabled: !!groupId,
	});

	// Invalidate group data after mutations
	const invalidateGroupData = () => {
		queryClient.invalidateQueries({
			queryKey: [GROUP_MEMBER_QUERY_KEY, groupId],
		});
		queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEY] });
	};

	// Add member mutation
	const addMemberMutation = useMutation({
		mutationFn: (memberData: AddGroupMemberInput) =>
			addGroupMember(groupId, memberData),
		onSuccess: () => {
			invalidateGroupData();
		},
		onError: (error) => {
			throw error;
		},
	});

	// Remove member mutation
	const removeMemberMutation = useMutation({
		mutationFn: (userId: string) => removeGroupMember(groupId, userId),
		onSuccess: () => {
			invalidateGroupData();
		},
		onError: (error) => {
			throw error;
		},
	});

	// Update member role mutation
	const updateGroupMemberMutation = useMutation({
		mutationFn: ({ userId, role }: { userId: string; role: GroupMemberRole }) =>
			updateGroupMember(groupId, { id: userId, role }),
		onSuccess: () => {
			invalidateGroupData();
		},
		onError: (error) => {
			throw error;
		},
	});

	return {
		group,
		members: group?.members || [],
		isLoading,
		isError,
		error,
		addMember: addMemberMutation.mutate,
		isAddingMember: addMemberMutation.isPending,
		removeMember: removeMemberMutation.mutate,
		isRemovingMember: removeMemberMutation.isPending,
		updateGroupMember: updateGroupMemberMutation.mutate,
		isUpdatingGroupMember: updateGroupMemberMutation.isPending,
	};
}
