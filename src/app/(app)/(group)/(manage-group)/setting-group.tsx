import { useState, useEffect } from 'react';
import { TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { useGroup } from '@/features/home/group/hooks/useGroup';
import type { UpdateGroupInput } from '@/api/group/types';
import Header from '@/components/common/Header';
import { Button, ButtonText } from '@/components/common/button';
import { VStack } from '#/components/ui/vstack';
import { Text } from '#/components/ui/text';
import { KeyboardDismissView } from '@/components/common/keyboard-view/KeyboardDismissView';

export default function SettingGroupScreen() {
	const router = useRouter();
	const { currentGroup } = useAuthStore();
	const { group, isLoading, updateGroup, isUpdating } = useGroup(
		currentGroup?.groupId,
	);

	const [groupName, setGroupName] = useState<string>('');
	const [hasChanges, setHasChanges] = useState<boolean>(false);

	useEffect(() => {
		if (group) {
			setGroupName(group.groupName);
		}
	}, [group]);

	const handleGroupNameChange = (text: string) => {
		setGroupName(text);
		setHasChanges(text !== group?.groupName);
	};

	const handleSave = () => {
		if (!groupName.trim()) return;

		const updateData: UpdateGroupInput = {
			groupName: groupName.trim(),
		};

		updateGroup(updateData);
		setHasChanges(false);
	};

	return (
		<SafeAreaView className="h-full">
			<KeyboardDismissView>
				<Header label="그룹 설정" />
				<VStack space="xl" className="py-5 px-6 flex-1">
					<VStack space="sm">
						<Text className="text-base font-medium">그룹명</Text>
						<TextInput
							value={groupName}
							onChangeText={handleGroupNameChange}
							placeholder="그룹명을 입력해주세요"
							editable={!isLoading && !isUpdating}
							className="border border-gray-300 rounded-md p-3"
						/>
					</VStack>
				</VStack>
				<Button
					onPress={handleSave}
					disabled={!hasChanges || isLoading || isUpdating}
					className="my-5 mx-6"
					rounded
				>
					<ButtonText>{isUpdating ? '저장 중...' : '완료'}</ButtonText>
				</Button>
			</KeyboardDismissView>
		</SafeAreaView>
	);
}
