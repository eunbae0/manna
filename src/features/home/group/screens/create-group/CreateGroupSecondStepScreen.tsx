import { VStack } from '#/components/ui/vstack';
import Header from '@/components/common/Header';
import { Heading } from '#/components/ui/heading';
import { Text } from '#/components/ui/text';
import { Button, ButtonText } from '#/components/ui/button';
import { Box } from '#/components/ui/box';
import { useOnboardingStore } from '@/store/onboarding';
import type { ClientGroup } from '@/api/group/types';
import { router } from 'expo-router';

type Props = {
	group: ClientGroup | null;
};

export default function CreateGroupSecondStepScreen({ group }: Props) {
	const { currentStep, completeOnboarding } = useOnboardingStore();
	const isOnboarding = currentStep === 'GROUP_CREATE';

	const handlePressNext = () => {
		if (!isOnboarding) {
			router.back();
			return;
		}
		completeOnboarding();
	};

	return (
		<>
			<VStack className="flex-1">
				<Header disableBackButton={isOnboarding} />
				<VStack className="px-5 py-6">
					<VStack className="gap-20">
						<VStack space="md">
							<Heading className="text-[24px]">
								소그룹 코드를 발급했어요.
							</Heading>
							<Text size="lg" className="text-typography-600">
								코드를 공유해 친구를 초대해보세요
							</Text>
						</VStack>
						<VStack space="sm">
							<Box className="w-full rounded-2xl bg-background-0 border-primary-600 border-2 p-4">
								<Text className="text-3xl font-pretendard-semi-bold text-primary-900  text-center">
									{group?.inviteCode ?? ''}
								</Text>
							</Box>
							<Button variant="link">
								<ButtonText>코드 복사하기</ButtonText>
							</Button>
						</VStack>
					</VStack>
				</VStack>
			</VStack>
			<Button
				size="lg"
				className="rounded-full mx-5 mb-6"
				onPress={handlePressNext}
			>
				<ButtonText>완료</ButtonText>
			</Button>
		</>
	);
}
