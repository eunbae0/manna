import { Heading } from '@/shared/components/heading';
import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';
import LottieView from 'lottie-react-native';
import { HStack } from '#/components/ui/hstack';
import { Pressable, type PressableProps } from 'react-native';
import { X } from 'lucide-react-native';
import { Icon } from '#/components/ui/icon';
import Animated, { } from 'react-native-reanimated';

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
				<HStack className="items-center justify-between mx-4 px-2 py-5 border-[1px] border-background-400 rounded-2xl">
					<HStack space="xs" className="items-center">
						<LottieView
							source={require('../../../../assets/lotties/messages.json')}
							autoPlay
							loop
							style={{
								width: 64,
								height: 64,
							}}
						/>
						<VStack className="gap-[2px]">
							<Heading size="lg">{title}</Heading>
							<Text size="md" className="text-typography-500">
								{description}
							</Text>
						</VStack>
					</HStack>
					<Pressable className="p-4" onPress={handleDismiss}>
						<Icon as={X} size="lg" className="text-typography-600" />
					</Pressable>
				</HStack>
			</Pressable>
		</Animated.View>
	);
}
