import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { QrCode } from 'lucide-react-native';
import { HStack } from '#/components/ui/hstack';
import { useShareText } from '@/shared/hooks/useShareText';

export function ShareInviteCode({
	inviteCode,
	handlePressQrCode,
}: {
	inviteCode: string;
	handlePressQrCode: () => void;
}) {
	const { shareText } = useShareText();

	return (
		<VStack space="md" className="py-2">
			<Text size="md" weight="medium" className="text-typography-700">
				아래 코드를 공유하여 새로운 그룹원을 초대해보세요
			</Text>
			<HStack className="items-center justify-between bg-gray-100 rounded-lg p-4">
				<Text size="lg" className="font-pretendard-semi-bold">
					{inviteCode}
				</Text>
				<Button size="sm" variant="outline" onPress={handlePressQrCode}>
					<ButtonIcon as={QrCode} size="md" className="text-primary-500" />
					<ButtonText>QR코드 보기</ButtonText>
				</Button>
			</HStack>
			<HStack space="sm" className="w-full py-2">
				<Button
					size="lg"
					variant="solid"
					className="flex-1"
					onPress={() => shareText(inviteCode)}
				>
					<ButtonText>초대코드 공유하기</ButtonText>
				</Button>
			</HStack>
		</VStack>
	);
}
