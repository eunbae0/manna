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
import { getUser, updateUser } from '@/api';

export default function JoinGroupScreen() {
	const { user, updateProfile, updateCurrentGroup } = useAuthStore();
	const { setStep, currentStep, updateUserData, completeOnboarding } =
		useOnboardingStore();
	const [code, setCode] = useState('');

	const isOnboarding = currentStep === 'GROUP_JOIN';

	// TODO: add join group feature
	const handlePressJoin = async () => {
		if (!user) return;

		// update firestore group member
		const groupId = await joinGroup({
			user: {
				id: user.id,
				displayName: user.displayName,
				photoUrl: user.photoUrl,
			},
			inviteCode: code,
		});
		if (!isOnboarding) {
			// update firestore user groups
			await updateUser(user.id, {
				groups: [{ groupId }],
			});
			// get user from firestore
			const updatedUser = await getUser(user.id);
			if (!updatedUser) return;
			// local user store update
			updateProfile(user.id, {
				groups: updatedUser.groups,
			});
			updateCurrentGroup({
				groupId,
			});
			router.back();
			return;
		}
		updateUserData({
			group: { groupId },
		});
		await completeOnboarding();
	};

	const handlePressLater = async () => {
		await completeOnboarding();
	};

	const onPressBackButton = () => {
		if (!isOnboarding) {
			router.back();
			return;
		}
		setStep('GROUP_LANDING');
	};

	return (
		<VStack>
			<Header onPressBackButton={onPressBackButton} />
			<VStack space="4xl" className="px-4 mt-8">
				<VStack space="3xl">
					<VStack space="sm">
						<Heading size="2xl">소그룹 초대코드를 입력해주세요</Heading>
						<Text>초대된 그룹이 없다면 넘어갈 수 있어요.</Text>
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
				<VStack space="lg" className={cn(isOnboarding ? 'mb-4' : 'mb-8')}>
					<Button
						className="rounded-full"
						size="lg"
						isDisabled={!code}
						onPress={handlePressJoin}
					>
						<ButtonText>그룹 참여하기</ButtonText>
					</Button>
					{isOnboarding && (
						<Button size="lg" variant="link" onPress={handlePressLater}>
							<ButtonText>다음에 할래요</ButtonText>
						</Button>
					)}
				</VStack>
			</VStack>
		</VStack>
	);
}
