import { useCallback } from 'react';
import { Image } from 'react-native';
import { VStack } from '#/components/ui/vstack';
import { Heading } from '@/shared/components/heading';
import { Text } from '#/components/ui/text';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { useOnboardingStore } from '@/store/onboarding';
import { Box } from '#/components/ui/box';
import { ChevronRight } from 'lucide-react-native';

export default function FinishStepScreen() {
	const { completeOnboarding } = useOnboardingStore();

	const handleStart = () => {
		completeOnboarding();
	};

	return (
		<VStack className="flex-1 h-full items-center justify-center px-4 gap-10">
			<Heading size="3xl">만나서 반가워요! 👋</Heading>
			<VStack space="xs">
				<Text className="text-typography-600 text-center">
					설교 기록부터 나눔, 기도제목까지.
				</Text>
				<Text className="text-typography-600 text-center">
					그룹원들의 다양한 활동과 소식을 확인해보세요
				</Text>
			</VStack>
			<Box className="absolute mb-12 mx-4 bottom-0 left-0 w-full">
				<Button size="lg" onPress={handleStart} rounded>
					<ButtonText>시작하기</ButtonText>
					<ButtonIcon as={ChevronRight} />
				</Button>
			</Box>
		</VStack>
	);
}
