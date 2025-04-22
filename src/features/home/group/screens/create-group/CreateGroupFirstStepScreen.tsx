import { type Dispatch, type SetStateAction, useState } from 'react';
import { VStack } from '#/components/ui/vstack';
import Header from '@/components/common/Header';
import { Heading } from '@/shared/components/heading';
import { Input, InputField } from '#/components/ui/input';
import { Button, ButtonText } from '@/components/common/button';
import { useRef, useEffect } from 'react';
import { Keyboard, type TextInput } from 'react-native';
import { createGroup } from '@/api/group';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import type { CreateGroupStep } from './CreateGroupContainerScreen';
import type { ClientGroup } from '@/api/group/types';
import { useOnboardingStore } from '@/store/onboarding';
import { GROUPS_QUERY_KEY } from '../../hooks/useGroups';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { HStack } from '#/components/ui/hstack';
import { AlertCircle } from 'lucide-react-native';
import { Icon } from '#/components/ui/icon';
import { Text } from '#/components/ui/text';

type Props = {
	setStep: Dispatch<SetStateAction<CreateGroupStep>>;
	setGroup: Dispatch<SetStateAction<ClientGroup | null>>;
};

export default function CreateGroupFirstStepScreen({
	setStep,
	setGroup,
}: Props) {
	const [groupName, setGroupName] = useState('');
	const ref = useRef<TextInput>(null);
	const { user, updateUserGroupProfile } = useAuthStore();
	const queryClient = useQueryClient();

	// Onboarding
	const {
		currentStep,
		userData,
		setStep: setOnboardingStep,
	} = useOnboardingStore();
	const isOnboarding = currentStep === 'GROUP_CREATE';

	const { mutate: submitPrayerRequest } = useMutation({
		mutationFn: async () => {
			if (!groupName.trim()) {
				return;
			}

			return await createGroup({
				member: {
					id: user?.id ?? '',
					displayName: isOnboarding
						? userData.displayName
						: (user?.displayName ?? ''),
					photoUrl: user?.photoUrl ?? '',
					role: 'leader',
				},
				groupName: groupName.trim(),
			});
		},
		onSuccess: async (res) => {
			if (!res) {
				return;
			}
			setGroup(res);
			if (!user) return;
			const isMain = user.groups?.findIndex((g) => g.isMain === true) === -1;
			updateUserGroupProfile(user.id, {
				groupId: res.id,
				notificationPreferences: { fellowship: true, prayerRequest: true },
				isMain,
			});
			queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEY] });
			setStep('CODE');
		},
	});

	const handlePressNext = () => {
		Keyboard.dismiss();
		handleOpen();
	};

	useEffect(() => {
		setTimeout(() => {
			ref.current?.focus();
		}, 100);
	}, []);

	const { handleOpen, handleClose, BottomSheetContainer } = useBottomSheet({
		variant: 'modal',
	});

	return (
		<>
			<VStack className="flex-1">
				<Header
					onPressBackButton={
						isOnboarding ? () => setOnboardingStep('GROUP_LANDING') : undefined
					}
				/>
				<VStack className="px-5 py-6">
					<VStack space="4xl">
						<Heading className="text-[24px]">
							소그룹 이름을 입력해주세요
						</Heading>
						<Input size="xl">
							<InputField
								//@ts-ignore
								ref={ref}
								value={groupName}
								onChangeText={setGroupName}
								placeholder="ex. OO 순, OO 사랑방"
							/>
						</Input>
					</VStack>
				</VStack>
			</VStack>
			<Button
				size="lg"
				className="rounded-full mx-5 mb-6"
				onPress={handlePressNext}
				disabled={!groupName.trim()}
				rounded
			>
				<ButtonText>다음</ButtonText>
			</Button>
			<BottomSheetContainer>
				<VStack className="items-center justify-center pt-6 pb-5 px-4 gap-10">
					<VStack className="items-center justify-center" space="lg">
						<Icon as={AlertCircle} size="xl" className="stroke-yellow-500" />
						<VStack className="items-start" space="sm">
							<Heading size="xl" className="text-start font-pretendard-bold">
								아래 정보로 소그룹을 생성할게요
							</Heading>
							<Text size="lg" className="text-start text-typography-500">
								소그룹 이름: {groupName}
							</Text>
						</VStack>
					</VStack>
					<HStack className="w-full" space="sm">
						<Button
							variant="outline"
							onPress={handleClose}
							fullWidth
							animation
							size="lg"
							className="flex-1"
						>
							<ButtonText>다시 입력하기</ButtonText>
						</Button>
						<Button
							onPress={() => submitPrayerRequest()}
							fullWidth
							animation
							size="lg"
							className="flex-1"
						>
							<ButtonText>생성하기</ButtonText>
						</Button>
					</HStack>
				</VStack>
			</BottomSheetContainer>
		</>
	);
}
