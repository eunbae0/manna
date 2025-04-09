import { useState } from 'react';
import { VStack } from '#/components/ui/vstack';
import { View, ScrollView, Pressable, Alert } from 'react-native';
import { Avatar } from '@/components/common/avatar';
import { Icon } from '#/components/ui/icon';
import { Divider } from '#/components/ui/divider';
import { Text } from '#/components/ui/text';
import { HStack } from '#/components/ui/hstack';
import { Button, ButtonText, ButtonIcon } from '@/components/common/button';
import { BottomSheetListHeader } from '@/components/common/bottom-sheet';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useGroupMembers } from '@/hooks/useGroupMembers';
import { useRouter } from 'expo-router';
import { UserPlus, Trash2, Copy } from 'lucide-react-native';
import { useToast } from '#/components/ui/toast';
import type { GroupMemberRole, GroupUser } from '@/api/group/types';
import { useAuthStore } from '@/store/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/common/Header';
import { Heading } from '#/components/ui/heading';
import { Box } from '#/components/ui/box';
import { cn } from '@/shared/utils/cn';
import { useToastStore } from '@/store/toast';
import { useCopyInviteCode } from '@/shared/hooks/useCopyInviteCode';

export default function ManageGroupScreen() {
	const router = useRouter();
	const { currentGroup } = useAuthStore();

	if (!currentGroup) {
		router.replace('/(app)/');
		return null;
	}

	return (
		<SafeAreaView className="h-full">
			<Header />
			<GroupMemberList groupId={currentGroup.groupId} />
		</SafeAreaView>
	);
}

interface GroupMemberListProps {
	groupId: string;
}

function GroupMemberList({ groupId }: GroupMemberListProps) {
	const {
		group,
		members,
		isLoading,
		addMember,
		removeMember,
		updateGroupMember,
		isRemovingMember,
		isUpdatingGroupMember,
	} = useGroupMembers(groupId);

	const { showToast } = useToastStore();

	// Bottom sheet for inviting new members
	const {
		handleOpen: handleOpenInvite,
		handleClose: handleCloseInvite,
		BottomSheetContainer: BottomSheetInviteContainer,
	} = useBottomSheet();

	// Bottom sheet for editing member role
	// const {
	// 	handleOpen: handleOpenEditRole,
	// 	handleClose: handleCloseEditRole,
	// 	BottomSheetContainer: BottomSheetEditRoleContainer,
	// } = useBottomSheet();

	const [selectedMember, setSelectedMember] = useState<{
		userId: string;
		displayName: string;
		role: GroupMemberRole;
	} | null>(null);

	// const [newRole, setNewRole] = useState<GroupMemberRole>('member');

	const handleInvite = () => {
		handleOpenInvite();
	};

	const { copyInviteCode } = useCopyInviteCode(group?.inviteCode || '');

	const handleCopyInviteCode = async () => {
		if (group?.inviteCode) {
			copyInviteCode();
		}
	};

	// const handleEditRole = (
	// 	userId: string,
	// 	displayName: string,
	// 	currentRole: GroupMemberRole,
	// ) => {
	// 	setSelectedMember({ userId, displayName, role: currentRole });
	// 	setNewRole(currentRole);
	// 	handleOpenEditRole();
	// };

	// const handleUpdateRole = () => {
	// 	if (selectedMember && newRole) {
	// 		updateRole({ userId: selectedMember.userId, role: newRole });
	// 		handleCloseEditRole();
	// 	}
	// };

	const handleRemoveMember = (userId: string) => {
		Alert.alert('그룹원을 삭제할까요?', '', [
			{
				text: '취소',
				style: 'cancel',
			},
			{
				text: '삭제',
				style: 'destructive',
				onPress: () => removeMember(userId),
			},
		]);
	};

	if (isLoading) {
		return (
			<VStack space="md" className="items-center justify-center py-10">
				<Text>로딩 중...</Text>
			</VStack>
		);
	}

	return (
		<>
			<ScrollView className="flex-1 px-5 py-4">
				<VStack space="md">
					<HStack className="items-center justify-between py-2">
						<Heading className="text-[24px]">그룹원 관리</Heading>
						<Button variant="outline" size="sm" onPress={handleInvite} rounded>
							<ButtonIcon as={UserPlus} />
							<ButtonText>초대하기</ButtonText>
						</Button>
					</HStack>
					<Divider />
					{members.length > 0 ? (
						<VStack space="md">
							{members.map(({ id, photoUrl, displayName, role }) => (
								<View key={id} className="bg-white rounded-xl py-4">
									<HStack className="items-center justify-between">
										<HStack space="md" className="items-center">
											<Avatar size="sm" photoUrl={photoUrl || undefined} />
											<VStack>
												<Text size="lg" className="font-pretendard-semi-bold">
													{displayName || '이름없음'}
												</Text>
											</VStack>
											<Box
												className={cn(
													'px-2 rounded-full py-1',
													role === 'leader' ? 'bg-primary-400' : 'bg-gray-500',
												)}
											>
												<Text size="xs" className="text-typography-50">
													{role === 'leader' ? '리더' : '그룹원'}
												</Text>
											</Box>
										</HStack>
										<HStack space="md">
											<Button
												onPress={() => handleRemoveMember(id)}
												disabled={isRemovingMember}
												variant="icon"
											>
												<ButtonIcon as={Trash2} className="stroke-red-500" />
											</Button>
										</HStack>
									</HStack>
								</View>
							))}
						</VStack>
					) : (
						<VStack space="md" className="items-center justify-center py-10">
							<Text>그룹원이 없습니다. 새로운 그룹원을 초대해보세요.</Text>
						</VStack>
					)}
				</VStack>
			</ScrollView>

			{/* Invite bottom sheet */}
			<BottomSheetInviteContainer>
				<VStack className="px-6 py-2">
					<BottomSheetListHeader
						label="그룹원 초대"
						onPress={handleCloseInvite}
					/>
					<Text size="md">
						아래 초대 코드를 공유하여 새로운 그룹원을 초대할 수 있어요
					</Text>
					<VStack space="4xl" className="py-8">
						<HStack className="items-center justify-between bg-gray-100 rounded-lg p-4">
							<Text size="lg" className="font-pretendard-semi-bold">
								{group?.inviteCode}
							</Text>
							<Button variant="icon" onPress={handleCopyInviteCode}>
								<ButtonIcon as={Copy} />
							</Button>
						</HStack>

						<Button
							size="lg"
							className="rounded-full mt-4"
							onPress={handleCopyInviteCode}
						>
							<ButtonText>초대 코드 복사하기</ButtonText>
						</Button>
					</VStack>
				</VStack>
			</BottomSheetInviteContainer>

			{/* Edit role bottom sheet */}
			{/* <BottomSheetEditRoleContainer>
				<VStack space="sm" className="px-6 py-2">
					<BottomSheetListHeader
						label="역할 수정"
						onPress={handleCloseEditRole}
					/>
					<VStack space="xl" className="py-4">
						{selectedMember && (
							<>
								<Text size="md">
									{selectedMember.displayName}님의 역할을 수정합니다.
								</Text>
								<Button
									size="lg"
									className="rounded-full mt-4"
									onPress={handleUpdateRole}
									disabled={isUpdatingRole}
								>
									<ButtonText>저장하기</ButtonText>
								</Button>
							</>
						)}
					</VStack>
				</VStack>
			</BottomSheetEditRoleContainer> */}
		</>
	);
}
