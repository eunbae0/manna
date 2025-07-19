import { Heading } from '@/shared/components/heading';
import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';
import LottieView from 'lottie-react-native';
import { HStack } from '#/components/ui/hstack';
import { Pressable, type PressableProps } from 'react-native';
import { X } from 'lucide-react-native';
import { Icon } from '#/components/ui/icon';
import Animated, {} from 'react-native-reanimated';

type Props = {
	title: string;
	description: string;
	onPress: PressableProps['onPress'];
	onDismiss?: () => void;
};

export default function NotificationBox({
	title,
	description,
	onPress,
	onDismiss,
}: Props) {
	const handleDismiss = () => {
		if (onDismiss) {
			onDismiss();
		}
	};

	return (
		<Animated.View>
			<Pressable onPress={onPress}>
				<HStack className="items-center justify-between bg-primary-50 pl-2 py-2">
					<HStack className="items-center">
						<LottieView
							source={require('../../../../assets/lotties/messages.json')}
							autoPlay
							loop
							style={{
								width: 50,
								height: 50,
							}}
						/>
						<VStack>
							<Text weight="semi-bold" size="md" className="text-primary-500">
								{title}
							</Text>
							<Text size="sm" weight="light" className="text-primary-500">
								{description}
							</Text>
						</VStack>
					</HStack>
					<Pressable className="p-4" onPress={handleDismiss}>
						<Icon as={X} size="lg" className="text-primary-400" />
					</Pressable>
				</HStack>
			</Pressable>
		</Animated.View>
	);
}
