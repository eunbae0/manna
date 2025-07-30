import { HStack } from '#/components/ui/hstack';
import { Text } from '@/shared/components/text';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import Heading from '@/shared/components/heading';
import { ChevronRight, PenLine } from 'lucide-react-native';
import { useCallback } from 'react';
import { router } from 'expo-router';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useGroups } from '@/features/group/hooks/useGroups';
import { Avatar } from '@/components/common/avatar';
import { useAuthStore } from '@/store/auth';
import AnimatedPressable from '@/components/common/animated-pressable';
import { Icon } from '#/components/ui/icon';
import { VStack } from '#/components/ui/vstack';
import { View } from 'react-native';

export function FeedHomeHeader() {
	const { user, updateCurrentGroup } = useAuthStore();
	const { groups } = useGroups(user?.groups || []);

	const hasGroup = user.groups ? user.groups.length > 0 : false;

	const { BottomSheetContainer, handleOpen, handleClose } = useBottomSheet();

	const handlePressGroupItem = useCallback(
		(groupId: string) => {
			updateCurrentGroup({ groupId });
			handleClose();
			setTimeout(() => {
				router.push('/(app)/(board)/create');
			}, 100);
		},
		[handleClose, updateCurrentGroup],
	);

	const handlePressWriteButton = () => {
		handleOpen();
	};

	return (
		<>
			<HStack className="w-full pl-5 pr-3 pt-3 pb-2 items-center justify-between">
				<Heading size="2xl" className="">
					최근 피드
				</Heading>
				{hasGroup ? (
					<Button variant="text" size="md" onPress={handlePressWriteButton}>
						<ButtonText>글쓰기</ButtonText>
						<ButtonIcon as={PenLine} />
					</Button>
				) : (
					<View className="h-9" />
				)}
			</HStack>
			<BottomSheetContainer>
				<VStack space="md" className="pt-4 pb-12">
					<Heading size="2xl" className="px-5">
						그룹 선택
					</Heading>
					{groups?.map((group) => (
						<AnimatedPressable
							key={group.id}
							onPress={() => handlePressGroupItem(group.id)}
						>
							<HStack
								key={group.id}
								className="items-center justify-between py-4 px-5"
							>
								<HStack space="md" className="items-center">
									<Avatar
										size="md"
										photoUrl={group?.coverImages?.[0]?.uri || undefined}
									/>
									<Text
										size="lg"
										weight="medium"
										className="text-typography-700"
									>
										{group.groupName}
									</Text>
								</HStack>
								<Icon
									as={ChevronRight}
									size="lg"
									className="text-typography-600"
								/>
							</HStack>
						</AnimatedPressable>
					))}
				</VStack>
			</BottomSheetContainer>
		</>
	);
}
