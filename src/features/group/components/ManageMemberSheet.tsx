import { Divider } from '#/components/ui/divider';
import { VStack } from '#/components/ui/vstack';
import {
	BottomSheetListLayout,
	BottomSheetListHeader,
	BottomSheetListItem,
} from '@/components/common/bottom-sheet';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useToastStore } from '@/store/toast';
import { UserCog, LogOut } from 'lucide-react-native';
import { Alert } from 'react-native';
import { useGroupMembers } from '../hooks/useGroupMembers';
import type { GroupMemberRole } from '@/api/group/types';
import { useAuthStore } from '@/store/auth';
import { type Ref, useImperativeHandle } from 'react';

type Props = {
	groupId: string;
	selectedMember: {
		userId: string;
		displayName: string;
		role: GroupMemberRole;
	} | null;
	ref: Ref<{ handleOpenMemberManage: () => void }>;
};

export function ManageMemberSheet({ groupId, selectedMember, ref }: Props) {
	const { showToast } = useToastStore();
	const { user } = useAuthStore();

	const {
		removeMember,
		updateGroupMember,
		isRemovingMember,
		isUpdatingGroupMember,
	} = useGroupMembers(groupId);

	const {
		handleOpen: handleOpenMemberManage,
		handleClose: handleCloseMemberManage,
		BottomSheetContainer: BottomSheetMemberManageContainer,
	} = useBottomSheet();

	useImperativeHandle(ref, () => ({
		handleOpenMemberManage,
	}));

	const handleChangeRole = () => {
		if (selectedMember) {
			const newRole = selectedMember.role === 'leader' ? 'member' : 'leader';
			updateGroupMember({ userId: selectedMember.userId, role: newRole });
			handleCloseMemberManage();
			showToast({
				message: `${selectedMember.displayName}님이 ${newRole === 'leader' ? '리더' : '그룹원'}로 변경되었어요.`,
				type: 'success',
			});
		}
	};

	const handleRemoveMember = () => {
		if (!selectedMember) return;

		Alert.alert('그룹원을 내보낼까요?', '', [
			{
				text: '취소',
				style: 'cancel',
			},
			{
				text: '내보내기',
				style: 'destructive',
				onPress: () => {
					removeMember(selectedMember.userId);
					handleCloseMemberManage();
					showToast({
						message: `${selectedMember.displayName}님이 그룹에서 내보내졌어요.`,
						type: 'success',
					});
				},
			},
		]);
	};
	return (
		<BottomSheetMemberManageContainer>
			<BottomSheetListLayout>
				<BottomSheetListHeader
					label={selectedMember?.displayName || ''}
					onPress={handleCloseMemberManage}
				/>
				{selectedMember && (
					<VStack space="md" className="py-2">
						{selectedMember.role === 'leader' ? (
							<BottomSheetListItem
								label="그룹원으로 변경하기"
								icon={UserCog}
								onPress={handleChangeRole}
								disabled={isUpdatingGroupMember}
							/>
						) : (
							<BottomSheetListItem
								label="리더로 변경하기"
								icon={UserCog}
								onPress={handleChangeRole}
								disabled={isUpdatingGroupMember}
							/>
						)}
						{selectedMember.userId !== user?.id && (
							<>
								<Divider />
								<BottomSheetListItem
									label="그룹원 내보내기"
									icon={LogOut}
									onPress={handleRemoveMember}
									disabled={isRemovingMember}
									variant="destructive"
								/>
							</>
						)}
					</VStack>
				)}
			</BottomSheetListLayout>
		</BottomSheetMemberManageContainer>
	);
}
