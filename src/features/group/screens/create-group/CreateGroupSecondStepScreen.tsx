import { Dimensions, View } from 'react-native';
import QRCode from 'react-qr-code';
import { VStack } from '#/components/ui/vstack';
import Header from '@/components/common/Header';
import { Text } from '@/shared/components/text';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { useOnboardingStore } from '@/store/onboarding';
import type { ClientGroup } from '@/api/group/types';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { Copy, Share } from 'lucide-react-native';
import { HStack } from '#/components/ui/hstack';
import AnimatedPressable from '@/components/common/animated-pressable';
import { Icon } from '#/components/ui/icon';
import { useCopyText } from '@/shared/hooks/useCopyText';
import { useGenerateAFInviteLink } from '@/shared/hooks/useGenerateAFInviteLink';
import Heading from '@/shared/components/heading';

const { width } = Dimensions.get('window');
const QR_SIZE = width * 0.5;

type Props = {
	group: ClientGroup | null;
};

export default function CreateGroupSecondStepScreen({ group }: Props) {
	const { currentStep, submitOnboardingData } = useOnboardingStore();
	const isOnboarding = currentStep === 'GROUP_CREATE';
	const { user } = useAuthStore();

	const handlePressNext = () => {
		if (!isOnboarding) {
			router.push('/(app)/(tabs)');
			return;
		}
		if (!user) return;
		submitOnboardingData(user.id);
	};

	const inviteCode = group?.inviteCode || '';

	const { generateInviteLink } = useGenerateAFInviteLink();

	const { copyText } = useCopyText({
		success: '초대 코드가 클립보드에 복사되었어요.',
		error: '초대 코드 복사에 실패했어요.',
	});

	return (
		<>
			<VStack className="flex-1">
				<Header disableBackButton={isOnboarding} />
				<VStack className="gap-14 px-6 py-4">
					<VStack space="md">
						<Heading size="3xl">초대 코드를 발급했어요</Heading>
						<Text size="lg" weight="medium" className="text-typography-600">
							코드를 공유해 새로운 그룹원을 초대해보세요.
						</Text>
					</VStack>
					<VStack space="2xl" className="items-center justify-center">
						{inviteCode ? (
							<View
								style={{ elevation: 5 }}
								className="items-center justify-center rounded-xl bg-white p-6 shadow-md"
							>
								<QRCode
									value={inviteCode}
									size={QR_SIZE}
									color="rgba(0,0,0,0.7)"
								/>
							</View>
						) : (
							<View className="items-center justify-center rounded-xl bg-gray-100 p-6">
								<Text className="text-gray-500">
									초대코드를 불러오는 중이에요...
								</Text>
							</View>
						)}
						<HStack className="gap-8 items-center justify-between bg-gray-100 rounded-xl py-3 pl-8 pr-4">
							<Text
								size="2xl"
								weight="semi-bold"
								className="text-typography-700"
							>
								{inviteCode}
							</Text>
							<AnimatedPressable
								className="p-3 bg-background-200/60 rounded-2xl"
								onPress={() => copyText(inviteCode)}
							>
								<Icon as={Copy} size="xl" className="text-primary-500/80" />
							</AnimatedPressable>
						</HStack>
					</VStack>
				</VStack>
			</VStack>
			<VStack space="sm" className="mx-5 mb-2">
				<Button
					size="lg"
					variant="solid"
					onPress={() => generateInviteLink(inviteCode)}
				>
					<ButtonText>링크로 바로 초대하기</ButtonText>
					<ButtonIcon as={Share} />
				</Button>
				<Button size="lg" variant="text" onPress={handlePressNext}>
					<ButtonText>다음에 할래요</ButtonText>
				</Button>
			</VStack>
		</>
	);
}
