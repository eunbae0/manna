import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  fetchGroupById, 
  addGroupMember, 
  removeGroupMember, 
  updateMemberRole 
} from '@/api/group';
import type { AddGroupMemberInput, GroupMemberRole } from '@/api/group/types';
import { Alert } from 'react-native';

export function useGroupMembers(groupId: string) {
  const queryClient = useQueryClient();

  // Query to fetch group data with members
  const { 
    data: group, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => fetchGroupById(groupId),
    enabled: !!groupId,
  });

  // Invalidate group data after mutations
  const invalidateGroupData = () => {
    queryClient.invalidateQueries({ queryKey: ['group', groupId] });
  };

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: (memberData: AddGroupMemberInput) => 
      addGroupMember(groupId, memberData),
    onSuccess: () => {
      invalidateGroupData();
      Alert.alert('성공', '그룹원이 추가되었습니다.');
    },
    onError: (error) => {
      Alert.alert('오류', `그룹원 추가 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => 
      removeGroupMember(groupId, userId),
    onSuccess: () => {
      invalidateGroupData();
      Alert.alert('성공', '그룹원이 삭제되었습니다.');
    },
    onError: (error) => {
      Alert.alert('오류', `그룹원 삭제 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    },
  });

  // Update member role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: GroupMemberRole }) => 
      updateMemberRole(groupId, userId, role),
    onSuccess: () => {
      invalidateGroupData();
      Alert.alert('성공', '역할이 업데이트 되었습니다.');
    },
    onError: (error) => {
      Alert.alert('오류', `역할 업데이트 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
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
    updateRole: updateRoleMutation.mutate,
    isUpdatingRole: updateRoleMutation.isPending,
  };
}
