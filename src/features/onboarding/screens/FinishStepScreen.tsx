import { useCallback } from 'react';
import { Image } from 'react-native';
import { VStack } from '#/components/ui/vstack';
import { Heading } from '@/shared/components/heading';
import { Text } from '@/shared/components/text';
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
			<Heading size="4xl">만나서 반가워요! 👋</Heading>
			<VStack className="pb-40">
				<Text size="xl" weight="medium" className="text-typography-600 text-center">
					설교 나눔부터 개인 묵상까지.
				</Text>
				<Text size="xl" weight="medium" className="text-typography-600 text-center">
					만나와 함께 그룹원들과 다양한 활동을 해보세요!
				</Text>
			</VStack>
			<Box className="absolute mb-12 mx-4 bottom-0 left-0 w-full">
				<Button size="lg" onPress={handleStart} withHaptic>
					<ButtonText>시작하기</ButtonText>
					<ButtonIcon as={ChevronRight} />
				</Button>
			</Box>
		</VStack>
	);
}
