import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';
import LottieView from 'lottie-react-native';
import { HStack } from '#/components/ui/hstack';
import { Pressable, type PressableProps } from 'react-native';
import { X } from 'lucide-react-native';
import { Icon } from '#/components/ui/icon';
import Animated, {} from 'react-native-reanimated';

type Props = {
	content: string;
	onPress: PressableProps['onPress'];
	onDismiss?: () => void;
};

export default function NoticeBox({ content, onPress, onDismiss }: Props) {
	const handleDismiss = () => {
		if (onDismiss) {
			onDismiss();
		}
	};

	return (
		<Animated.View>
			<Pressable onPress={onPress}>
				<HStack className="items-center justify-between bg-blue-50 pl-3">
					<HStack space="sm" className="items-center">
						<Text size="md" weight="bold" className="text-blue-900">
							알림
						</Text>
						<Text size="md" className="text-blue-900">
							{content}
						</Text>
					</HStack>
					<Pressable className="p-3 pr-4" onPress={handleDismiss}>
						<Icon as={X} size="lg" className="text-blue-600" />
					</Pressable>
				</HStack>
			</Pressable>
		</Animated.View>
	);
}
