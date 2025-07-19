import { useMemo, useState } from 'react';

import { ChevronRight, Crown, Plus, Users } from 'lucide-react-native';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import { Heading } from '@/shared/components/heading';
import { cn } from '@/shared/utils/cn';
import { Text } from '@/shared/components/text';
import { Icon } from '#/components/ui/icon';
import { useOnboardingStore } from '@/store/onboarding';
import Header from '@/components/common/Header';
import AnimatedPressable from '@/components/common/animated-pressable';
import { useAuthStore } from '@/store/auth';

export type GroupLandingOption = 'create' | 'join';

type Props = {
	handlePressOption: (option: GroupLandingOption) => void;
};

export default function GroupLandingScreen({ handlePressOption }: Props) {
	const [selectedOption, setSelectedOption] =
		useState<GroupLandingOption>('create');

	const { currentStep, setStep, submitOnboardingData } = useOnboardingStore();
	const { user } = useAuthStore();

	const isOnboarding = currentStep === 'GROUP_LANDING';

	const handlePressLater = () => {
		if (!user) return;
		submitOnboardingData(user.id);
	};

	const buttonText = useMemo(() => {
		switch (selectedOption) {
			case 'create':
				return '소그룹 만들기';
			case 'join':
				return '소그룹 참여하기';
		}
	}, [selectedOption]);

	return (
		<VStack className="h-full flex-1">
			{isOnboarding && <Header onPressBackButton={() => setStep('IMAGE')} />}
			<VStack className="px-4 mt-12 flex-1">
				<VStack space="md" className="flex-1">
					<Heading size="3xl">
						{isOnboarding
							? '소그룹을 만들 수 있어요'
							: '참여 중인 소그룹이 없어요!'}
					</Heading>
					<Text size="lg" weight="medium" className="text-typography-600">
						소그룹을 만들거나 참여해서 그룹원들과 소통해보세요!
					</Text>
				</VStack>

				<VStack className="gap-8">
					<HStack space="md" className="w-full">
						<AnimatedPressable
							className="flex-1 h-40"
							onPress={() => setSelectedOption('create')}
						>
							<VStack
								className={cn(
									'border-2 rounded-3xl p-5 h-full',
									selectedOption === 'create'
										? 'border-primary-500 bg-primary-50'
										: 'border-gray-200',
								)}
							>
								<VStack space="lg">
									<HStack space="sm" className="items-center">
										<VStack className="bg-primary-200/80 rounded-full p-2">
											<Icon
												as={Crown}
												size={'sm'}
												className="text-primary-400/80"
											/>
										</VStack>
										<Heading size="lg">소그룹장</Heading>
									</HStack>
									<VStack>
										<Text
											size="lg"
											weight="medium"
											className="text-typography-600"
										>
											그룹장으로
										</Text>
										<Text
											size="lg"
											weight="medium"
											className="text-typography-600"
										>
											그룹을 만들고 싶어요
										</Text>
									</VStack>
								</VStack>
							</VStack>
						</AnimatedPressable>

						<AnimatedPressable
							className="flex-1 h-40"
							onPress={() => setSelectedOption('join')}
						>
							<VStack
								className={cn(
									'border-2 rounded-3xl p-5 h-full',
									selectedOption === 'join'
										? 'border-primary-500 bg-primary-50'
										: 'border-gray-200',
								)}
							>
								<VStack space="lg">
									<HStack space="md" className="items-center">
										<VStack className="bg-background-200 rounded-full p-2">
											<Icon
												as={Users}
												size={'sm'}
												className="text-primary-900"
											/>
										</VStack>
										<Heading size="lg">소그룹원</Heading>
									</HStack>
									<VStack>
										<Text
											size="lg"
											weight="medium"
											className="text-typography-600"
										>
											이미 그룹이 있어요
										</Text>
									</VStack>
								</VStack>
							</VStack>
						</AnimatedPressable>
					</HStack>

					<VStack space="sm" className="mb-4">
						<Button
							size="lg"
							disabled={!selectedOption}
							onPress={() => handlePressOption(selectedOption)}
						>
							<ButtonText>{buttonText}</ButtonText>
							<ButtonIcon as={ChevronRight} />
						</Button>
						{isOnboarding && (
							<Button size="lg" variant="link" onPress={handlePressLater}>
								<ButtonText>다음에 할래요</ButtonText>
							</Button>
						)}
					</VStack>
				</VStack>
			</VStack>
		</VStack>
	);
}
