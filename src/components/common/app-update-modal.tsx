import { VStack } from '#/components/ui/vstack';
import { Text } from '#/components/ui/text';
import { Heading } from '@/shared/components/heading';
import { Icon } from '#/components/ui/icon';
import { Box } from '#/components/ui/box';
import { Button, ButtonText } from '@/components/common/button';
import { AlertCircle } from 'lucide-react-native';
import { Linking } from 'react-native';
import { logEvent, AnalyticsEvents } from '@/utils/analytics';
import { useCallback } from 'react';
import { cn } from '@/shared/utils/cn';
import { APP_STORE_URL, PLAY_STORE_URL } from '@/shared/constants/app';
import { isIOS } from '@/shared/utils/platform';

interface AppUpdateModalProps {
	isVisible: boolean;
	onClose?: () => void;
	forceUpdate: boolean;
	updateMessage?: string;
	latestVersion: string;
}

export function AppUpdateModal({
	isVisible,
	onClose,
	forceUpdate,
	updateMessage,
	latestVersion,
}: AppUpdateModalProps) {
	const handleUpdatePress = useCallback(async () => {
		try {
			await logEvent(AnalyticsEvents.APP_UPDATE_CLICKED, {
				latest_version: latestVersion,
			});

			const url = isIOS ? APP_STORE_URL : PLAY_STORE_URL;
			await Linking.openURL(url);
		} catch (error) {
			console.error('스토어 열기 실패:', error);
		}
	}, [latestVersion]);

	const handleLaterPress = useCallback(() => {
		if (onClose) {
			onClose();
		}

		// 분석 이벤트 기록
		logEvent(AnalyticsEvents.APP_UPDATE_LATER, {
			latest_version: latestVersion,
		});
	}, [onClose, latestVersion]);

	if (!isVisible) return null;

	return (
		<Box className="absolute inset-0 bg-black/50 flex justify-center items-center z-[9999]">
			<Box className="border rounded-2xl bg-white w-4/5">
				<VStack className="items-center justify-center pt-9 pb-4 px-4 gap-10">
					<VStack className="items-center" space="3xl">
						<Icon as={AlertCircle} size="xl" className="stroke-primary-500" />

						<VStack className="items-center" space="xs">
							<Heading size="xl" className="text-center">
								새 버전이 출시되었어요
							</Heading>
							<Text size="lg" className="text-center text-typography-500">
								{updateMessage || '더 나은 경험을 위해 앱을 업데이트해 주세요.'}
							</Text>
						</VStack>
					</VStack>
					<VStack
						space="xs"
						className={cn(
							'w-full items-center justify-center px-4',
							forceUpdate && 'pb-4',
						)}
					>
						<Button onPress={handleUpdatePress} fullWidth rounded size="lg">
							<ButtonText>지금 업데이트하기</ButtonText>
						</Button>

						{!forceUpdate && (
							<Button variant="link" onPress={handleLaterPress} fullWidth>
								<ButtonText>나중에 하기</ButtonText>
							</Button>
						)}
					</VStack>
				</VStack>
			</Box>
		</Box>
	);
}
