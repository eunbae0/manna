import { Linking, Platform } from 'react-native';
import { Text } from '#/components/ui/text';
import { Icon } from '#/components/ui/icon';
import { ChevronRight } from 'lucide-react-native';
import { VStack } from '#/components/ui/vstack';
import AnimatedPressable from '@/components/common/animated-pressable';
import { HStack } from '#/components/ui/hstack';

/**
 * 알림 설정이 꺼져있을 때 보여줄 컴포넌트
 */
export function NotificationPermissionBanner() {
	const openNotificationSettings = () => {
		if (Platform.OS === 'ios') {
			Linking.openURL('app-settings:');
		} else {
			Linking.openSettings();
		}
	};

	return (
		<AnimatedPressable
			onPress={openNotificationSettings}
			className="mx-5 mb-4 bg-red-50 rounded-2xl px-5 py-4"
		>
			<HStack className="items-center justify-between">
				<VStack space="xs" className="mr-4">
					<Text className="text-red-800 font-pretendard-bold">
						OS 설정에서 알림을 켜주세요.
					</Text>
					<Text className="text-red-800 font-pretendard-medium">
						알림을 켜면 다양한 소식을 실시간으로 받을 수 있어요.
					</Text>
				</VStack>
				<Icon as={ChevronRight} size="md" className="text-red-800" />
			</HStack>
		</AnimatedPressable>
	);
}
