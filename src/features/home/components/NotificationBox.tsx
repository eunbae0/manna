import { Heading } from '#/components/ui/heading';
import { VStack } from '#/components/ui/vstack';
import { Text } from '#/components/ui/text';
import LottieView from 'lottie-react-native';
import { HStack } from '#/components/ui/hstack';
import { Pressable, type PressableProps, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { Icon } from '#/components/ui/icon';
import { useState, useEffect } from 'react';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
	withSequence,
	runOnJS,
	Easing,
} from 'react-native-reanimated';

type Props = {
	title: string;
	description: string;
	onPress: PressableProps['onPress'];
	onDismiss?: () => void;
	visible?: boolean;
};

const styles = StyleSheet.create({
	container: {
		marginVertical: 8,
	},
});

export default function NotificationBox({
	title,
	description,
	onPress,
	onDismiss,
	visible,
}: Props) {
	// State to track if component should be rendered
	const [isRendered, setIsRendered] = useState(visible);
	const opacity = useSharedValue(1);
	const translateY = useSharedValue(0);
	const scale = useSharedValue(1);
	const isVisible = useSharedValue(true);

	const animatedStyles = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ translateY: translateY.value }, { scale: scale.value }],
	}));

	const handleDismiss = () => {
		if (!isVisible.value) return;

		isVisible.value = false;

		// First slide slightly up and then down while fading out
		translateY.value = withSequence(
			withTiming(-10, { duration: 150, easing: Easing.out(Easing.quad) }),
			withTiming(100, { duration: 300, easing: Easing.in(Easing.quad) }),
		);

		// Fade out and scale down slightly
		opacity.value = withTiming(0, { duration: 300 });
		scale.value = withTiming(0.95, { duration: 300 });

		// After animation completes, unmount the component
		setTimeout(() => {
			// Remove from DOM by setting isRendered to false
			setIsRendered(false);

			// Call the onDismiss callback
			if (onDismiss) {
				onDismiss();
			}
		}, 350);
	};

	// Effect to handle visibility changes from props
	useEffect(() => {
		if (visible) {
			// 컴포넌트가 표시되어야 할 때
			setIsRendered(true);

			// 초기 상태 설정
			opacity.value = 0;
			translateY.value = 20;
			scale.value = 0.95;
			isVisible.value = true;

			// 애니메이션 시작
			opacity.value = withTiming(1, {
				duration: 400,
				easing: Easing.out(Easing.quad),
			});
			translateY.value = withTiming(0, {
				duration: 400,
				easing: Easing.out(Easing.quad),
			});
			scale.value = withTiming(1, {
				duration: 400,
				easing: Easing.out(Easing.quad),
			});
		}
	}, [visible, opacity, translateY, scale, isVisible]); // 모든 의존성 추가

	// Don't render anything if component should be hidden
	if (!isRendered) {
		return null;
	}

	return (
		<Animated.View style={[styles.container, animatedStyles]}>
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
						<Icon as={X} size="lg" className="stroke-typography-600" />
					</Pressable>
				</HStack>
			</Pressable>
		</Animated.View>
	);
}
