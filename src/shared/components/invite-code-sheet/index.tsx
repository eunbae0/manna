import { Dimensions, View } from 'react-native';
import QRCode from 'react-qr-code';
import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { Copy, Share } from 'lucide-react-native';
import { HStack } from '#/components/ui/hstack';
import AnimatedPressable from '@/components/common/animated-pressable';
import { Icon } from '#/components/ui/icon';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { type Ref, useImperativeHandle } from 'react';
import { useCopyText } from '../../hooks/useCopyText';
import { useGenerateAFInviteLink } from '@/shared/hooks/useGenerateAFInviteLink';

const { width } = Dimensions.get('window');
const QR_SIZE = width * 0.3;

export function ShareInviteCodeSheet({
	inviteCode,
	ref,
}: {
	inviteCode: string;
	ref: Ref<{ handleOpenInviteCodeSheet: () => void }>;
}) {
	const { BottomSheetContainer, handleOpen: handleOpenSheet } =
		useBottomSheet();

	useImperativeHandle(ref, () => ({
		handleOpenInviteCodeSheet: handleOpenSheet,
	}));

	const { generateInviteLink } = useGenerateAFInviteLink();

	const { copyText } = useCopyText({
		success: '초대 코드가 클립보드에 복사되었어요.',
		error: '초대 코드 복사에 실패했어요.',
	});

	return (
		<BottomSheetContainer>
			<VStack space="lg" className="px-6 py-4">
				<Text
					size="lg"
					weight="medium"
					className="text-typography-700 text-center"
				>
					초대 코드를 공유하여 새로운 그룹원을 초대해보세요.
				</Text>
				<HStack space="2xl" className="items-center justify-center">
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
					<HStack
						space="2xl"
						className="items-center justify-between bg-gray-100 rounded-lg py-3 pl-6 pr-3"
					>
						<Text size="2xl" weight="semi-bold" className="text-typography-700">
							{inviteCode}
						</Text>
						<AnimatedPressable
							className="p-3 bg-background-200/60 rounded-xl"
							onPress={() => copyText(inviteCode)}
						>
							<Icon as={Copy} size="xl" className="text-primary-500/80" />
						</AnimatedPressable>
					</HStack>
				</HStack>
				<HStack space="sm" className="w-full mt-4">
					<Button
						size="lg"
						variant="solid"
						className="flex-1"
						onPress={() => generateInviteLink(inviteCode)}
					>
						<ButtonText>링크로 바로 초대하기</ButtonText>
						<ButtonIcon as={Share} />
					</Button>
				</HStack>
			</VStack>
		</BottomSheetContainer>
	);
}
