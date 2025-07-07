import { useState, useEffect } from 'react';
import { Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { useGroup } from '@/features/group/hooks/useGroup';
import type { UpdateGroupInput } from '@/api/group/types';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import Header from '@/components/common/Header';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Text } from '@/shared/components/text';
import { Edit3Icon, Trash2 } from 'lucide-react-native';
import { KeyboardDismissView } from '@/components/common/keyboard-view/KeyboardDismissView';
import {
	BottomSheetListLayout,
	BottomSheetListHeader,
} from '@/components/common/bottom-sheet';
import { TEXT_INPUT_STYLE } from '@/components/common/text-input';

export default function SettingGroupScreen() {
	const { groupId } = useLocalSearchParams<{ groupId: string }>();
	const { currentGroup } = useAuthStore();
	const { group, isLoading, updateGroup, isUpdating, deleteGroup, isDeleting } =
		useGroup(groupId || currentGroup?.groupId);

	// Bottom sheet for editing group name
	const {
		handleOpen: openEditSheet,
		handleClose: closeEditSheet,
		BottomSheetContainer,
	} = useBottomSheet();

	const [editGroupName, setEditGroupName] = useState<string>('');
	const [hasChanges, setHasChanges] = useState<boolean>(false);

	useEffect(() => {
		if (group) {
			setEditGroupName(group.groupName);
		}
	}, [group]);

	const handleGroupNameChange = (text: string) => {
		setEditGroupName(text);
		setHasChanges(text !== group?.groupName);
	};

	const handleSave = () => {
		if (!editGroupName.trim()) return;

		const updateData: UpdateGroupInput = {
			groupName: editGroupName.trim(),
		};

		updateGroup(updateData);
		closeEditSheet();
		setHasChanges(false);
	};

	const handleDeleteGroup = () => {
		Alert.alert(
			'그룹 삭제',
			'정말 그룹을 삭제할까요? 이 작업은 되돌릴 수 없어요.',
			[
				{ text: '취소', style: 'cancel' },
				{
					text: '삭제',
					style: 'destructive',
					onPress: () => deleteGroup(),
				},
			],
			{ cancelable: true },
		);
	};

	return (
		<SafeAreaView className="h-full">
			<KeyboardDismissView>
				<Header label="그룹 설정" />
				<VStack space="4xl" className="py-5 px-6 flex-1">
					<VStack space="sm">
						<HStack className="w-full justify-between items-center">
							<Text className="text-base font-medium">그룹명</Text>
							<Button size="md" variant="icon" onPress={openEditSheet}>
								<ButtonIcon as={Edit3Icon} />
							</Button>
						</HStack>
						<Text className="text-lg font-semibold">
							{group?.groupName || ''}
						</Text>
					</VStack>

					<VStack space="xl" className="mt-6">
						<VStack space="sm">
							<Text className="text-base font-medium text-error-500">
								그룹 삭제
							</Text>
							<Text className="text-sm text-typography-600">
								그룹을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수
								없어요.
							</Text>
						</VStack>
						<Button
							onPress={handleDeleteGroup}
							action="negative"
							variant="outline"
							disabled={isDeleting}
							className="mt-2"
							rounded
						>
							<ButtonIcon as={Trash2} />
							<ButtonText>
								{isDeleting ? '삭제 중...' : '그룹 삭제하기'}
							</ButtonText>
						</Button>
					</VStack>
				</VStack>
			</KeyboardDismissView>

			{/* Bottom sheet for editing group name */}
			<BottomSheetContainer>
				<BottomSheetListLayout>
					<BottomSheetListHeader label="그룹명 수정" onPress={closeEditSheet} />

					<VStack className="gap-12">
						<VStack space="sm">
							<Text size="md" className="text-typography-600">
								그룹명
							</Text>
							<BottomSheetTextInput
								defaultValue={editGroupName}
								onChangeText={handleGroupNameChange}
								placeholder="그룹명을 입력해주세요"
								editable={!isLoading && !isUpdating}
								className={TEXT_INPUT_STYLE}
							/>
						</VStack>

						<Button
							onPress={handleSave}
							action="primary"
							disabled={!hasChanges || isLoading || isUpdating}
							rounded
							size="lg"
						>
							<ButtonText>{isUpdating ? '저장 중...' : '완료'}</ButtonText>
						</Button>
					</VStack>
				</BottomSheetListLayout>
			</BottomSheetContainer>
		</SafeAreaView>
	);
}
