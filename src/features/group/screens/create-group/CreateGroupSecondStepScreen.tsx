import { VStack } from '#/components/ui/vstack';
import Header from '@/components/common/Header';
import { Heading } from '@/shared/components/heading';
import { Text } from '@/shared/components/text';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { Box } from '#/components/ui/box';
import { useOnboardingStore } from '@/store/onboarding';
import type { ClientGroup } from '@/api/group/types';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { useCopyInviteCode } from '@/shared/hooks/useCopyInviteCode';
import { Copy, QrCode } from 'lucide-react-native';
import { HStack } from '#/components/ui/hstack';

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

	const { copyInviteCode } = useCopyInviteCode(group?.inviteCode || '');

	return (
		<>
			<VStack className="flex-1">
				<Header disableBackButton={isOnboarding} />
				<VStack className="px-5 py-6">
					<VStack className="gap-20">
						<VStack space="md">
							<Heading size="3xl">소그룹 코드를 발급했어요</Heading>
							<Text size="lg" weight="medium" className="text-typography-600">
								초대 코드를 공유해 친구를 초대해보세요
							</Text>
						</VStack>
						<VStack space="xl">
							<Box className="w-full rounded-2xl bg-background-50 border-background-300 border-2 p-4">
								<Text
									size="3xl"
									weight="medium"
									className="text-typography-800 text-center"
								>
									{group?.inviteCode ?? ''}
								</Text>
							</Box>
							<HStack space="sm">
								<Button onPress={copyInviteCode} className="flex-1">
									<ButtonText>코드 복사하기</ButtonText>
									<ButtonIcon as={Copy} />
								</Button>
								<Button
									variant="outline"
									onPress={() =>
										router.push({
											pathname: '/(app)/inviteQrCodeModal',
											params: {
												inviteCode: group?.inviteCode,
											},
										})
									}
									className="flex-1"
								>
									<ButtonText>QR코드 보기</ButtonText>
									<ButtonIcon as={QrCode} />
								</Button>
							</HStack>
						</VStack>
					</VStack>
				</VStack>
			</VStack>
			<Button size="lg" className="mx-5 mb-5" onPress={handlePressNext}>
				<ButtonText>완료</ButtonText>
			</Button>
		</>
	);
}
