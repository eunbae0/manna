import { type Dispatch, type SetStateAction, useState } from 'react';
import { VStack } from '#/components/ui/vstack';
import Header from '@/components/common/Header';
import { Heading } from '#/components/ui/heading';
import { Input, InputField } from '#/components/ui/input';
import { Button, ButtonText } from '@/components/common/button';
import { useRef, useEffect } from 'react';
import type { TextInput } from 'react-native';
import { createGroup } from '@/api/group';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import type { CreateGroupStep } from './CreateGroupContainerScreen';
import type { ClientGroup } from '@/api/group/types';
import { useOnboardingStore } from '@/store/onboarding';
import { GROUPS_QUERY_KEY } from '../../hooks/useGroups';

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
			const isMain =
				user.groups?.find((g) => g.groupId === res.id)?.isMain ?? false;
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
		submitPrayerRequest();
	};

	useEffect(() => {
		setTimeout(() => {
			ref.current?.focus();
		}, 100);
	}, []);

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
		</>
	);
}
