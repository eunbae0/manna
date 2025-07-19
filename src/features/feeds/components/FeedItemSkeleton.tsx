import React from 'react';
import { View } from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
	Easing,
} from 'react-native-reanimated';
import { VStack } from '#/components/ui/vstack';
import { Divider } from '@/shared/components/divider';

export function FeedItemSkeleton() {
	const opacity = useSharedValue(0.5);

	opacity.value = withRepeat(
		withTiming(1, {
			duration: 1000,
			easing: Easing.bezier(0.25, 0.1, 0.25, 1),
		}),
		-1,
		true,
	);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
	}));

	return (
		<Animated.View style={[animatedStyle]} className="py-4 px-4 w-full">
			<VStack space="md">
				<VStack space="xs">
					<View className="w-2/3 h-6 rounded-lg bg-background-200" />
					<View className="w-1/2 h-4 rounded-lg bg-background-200" />
				</VStack>
				<View className="w-full h-24 rounded-lg bg-background-200" />
			</VStack>
		</Animated.View>
	);
}

export function FeedItemListSkeleton() {
	return (
		<VStack space="sm">
			{[1, 2, 3].map((i) => (
				<React.Fragment key={`skeleton-item-${i}`}>
					<FeedItemSkeleton />
					<Divider size="lg" className="my-2" />
				</React.Fragment>
			))}
		</VStack>
	);
}
export function HomeFeedItemListSkeleton() {
	return (
		<VStack space="xs">
			{[1, 2, 3].map((i) => (
				<React.Fragment key={`skeleton-item-${i}`}>
					<FeedItemSkeleton />
					<Divider className="my-2" />
				</React.Fragment>
			))}
		</VStack>
	);
}
