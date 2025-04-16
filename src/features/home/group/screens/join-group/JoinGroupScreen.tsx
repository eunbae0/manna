import { useState } from 'react';

import { Button, ButtonText } from '@/components/common/button';
import Header from '@/components/common/Header';
import { Text } from '#/components/ui/text';

import { useOnboardingStore } from '@/store/onboarding';
import { Heading } from '#/components/ui/heading';
import { Input, InputField } from '#/components/ui/input';
import { VStack } from '#/components/ui/vstack';
import { cn } from '@/shared/utils/cn';
import { router } from 'expo-router';
import { joinGroup } from '@/api/group';
import { useAuthStore } from '@/store/auth';
import { useQueryClient } from '@tanstack/react-query';
import { GROUPS_QUERY_KEY } from '../../hooks/useGroups';

export default function JoinGroupScreen() {
	const { user, addUserGroupProfile } = useAuthStore();
	const { setStep, currentStep, userData, completeOnboarding } =
		useOnboardingStore();
	const [code, setCode] = useState('');
	const queryClient = useQueryClient();

	const isOnboarding = currentStep === 'GROUP_JOIN';

	const handlePressJoin = async () => {
		if (!user) return;

		// update firestore group member
		const groupId = await joinGroup({
			member: {
				id: user.id,
				displayName: isOnboarding ? userData.displayName : user.displayName,
				photoUrl: user.photoUrl,
				role: 'member',
			},
			inviteCode: code,
		});

		// update firestore user groups
		await addUserGroupProfile(user.id, {
			groupId,
			notificationPreferences: { fellowship: true, prayerRequest: true },
		});

		// if onboarding, complete onboarding
		if (isOnboarding) await completeOnboarding(user.id);
		else {
			queryClient.invalidateQueries({
				queryKey: [GROUPS_QUERY_KEY],
				refetchType: 'all',
			});
		}

		router.push('/(app)/(tabs)');
	};

	const handlePressLater = async () => {
		if (!user) return;
		await completeOnboarding(user.id);
	};

	const onPressBackButton = () => {
		if (!isOnboarding) {
			if (router.canGoBack()) router.back();
			return;
		}
		setStep('GROUP_LANDING');
	};

	return (
		<VStack className="h-full">
			<Header onPressBackButton={onPressBackButton} />
			<VStack space="4xl" className="px-4 mt-8 flex-1">
				<VStack space="3xl">
					<VStack space="sm">
						<Heading size="2xl">소그룹 초대코드를 입력해주세요</Heading>
						{isOnboarding && (
							<Text>초대된 그룹이 없다면 넘어갈 수 있어요.</Text>
						)}
					</VStack>
					<Input
						variant="outline"
						size="md"
						isDisabled={false}
						isInvalid={false}
						isReadOnly={false}
						className="rounded-2xl"
					>
						<InputField
							value={code}
							onChangeText={setCode}
							placeholder="초대코드"
						/>
					</Input>
				</VStack>
			</VStack>
			<VStack space="lg" className={cn('mx-4', isOnboarding ? 'mb-4' : 'mb-8')}>
				<Button size="lg" disabled={!code} onPress={handlePressJoin} rounded>
					<ButtonText>그룹 참여하기</ButtonText>
				</Button>
				{isOnboarding && (
					<Button size="lg" variant="link" onPress={handlePressLater}>
						<ButtonText>다음에 할래요</ButtonText>
					</Button>
				)}
			</VStack>
		</VStack>
	);
}
