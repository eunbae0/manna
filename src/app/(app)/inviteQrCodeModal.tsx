import { View, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import QRCode from 'react-qr-code';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { Text } from '#/components/ui/text';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { useShareInviteCode } from '@/shared/hooks/useShareInviteCode';
import { useCopyInviteCode } from '@/shared/hooks/useCopyInviteCode';
import { Copy, Share, XIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isAndroid } from '@/shared/utils/platform';

const { width } = Dimensions.get('window');
const QR_SIZE = width * 0.6;

export default function InviteQrCodeModal() {
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const { inviteCode } = useLocalSearchParams<{ inviteCode: string }>();
	const { copyInviteCode } = useCopyInviteCode(inviteCode);
	const { shareInviteCode } = useShareInviteCode(inviteCode);

	const handleClose = () => {
		router.back();
	};

	if (!inviteCode) {
		handleClose();
		return;
	}

	return (
		<View className="flex-1 bg-background p-4">
			<VStack className="flex-1 items-center justify-between">
				<HStack className="w-full items-center justify-end" style={{ paddingTop: isAndroid ? insets.top : 0 }}>
					<Button variant="icon" onPress={handleClose} animation={true}>
						<ButtonIcon as={XIcon} />
					</Button>
				</HStack>

				<VStack space="4xl" className="items-center justify-center">
					{inviteCode ? (
						<View className="items-center justify-center rounded-xl bg-white p-6 shadow-md">
							<QRCode value={inviteCode} size={QR_SIZE} color="#000" />
						</View>
					) : (
						<View className="items-center justify-center rounded-xl bg-gray-100 p-6">
							<Text className="text-gray-500">
								초대코드를 불러오는 중이에요...
							</Text>
						</View>
					)}

					<HStack space="sm" className="items-center">
						<Text className="text-center text-lg font-semibold">초대코드</Text>
						<Text className="text-center text-2xl font-bold">{inviteCode}</Text>
					</HStack>
				</VStack>

				<HStack space="md" style={{ paddingBottom: insets.bottom + 12 }}>
					<Button variant="outline" onPress={copyInviteCode} className="flex-1">
						<ButtonText>코드 복사하기</ButtonText>
						<ButtonIcon as={Copy} />
					</Button>
					<Button onPress={shareInviteCode} className="flex-1">
						<ButtonText>공유하기</ButtonText>
						<ButtonIcon as={Share} />
					</Button>
				</HStack>
			</VStack>
		</View>
	);
}
