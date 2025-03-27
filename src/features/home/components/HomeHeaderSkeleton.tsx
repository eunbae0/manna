import { HStack } from '#/components/ui/hstack';
import { Box } from '#/components/ui/box';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
	Easing,
} from 'react-native-reanimated';

/**
 * Skeleton UI component for the HomeHeader
 * Displays loading placeholders with animation while data is being fetched
 */
export function HomeHeaderSkeleton() {
	// Animation setup
	const opacity = useSharedValue(0.5);

	// Start the animation when component mounts
	opacity.value = withRepeat(
		withTiming(1, {
			duration: 1000,
			easing: Easing.bezier(0.25, 0.1, 0.25, 1),
		}),
		-1, // Repeat infinitely
		true, // Reverse the animation
	);

	// Create animated style
	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
	}));

	return (
		<HStack className="items-center justify-between py-3 px-4">
			{/* Group name skeleton */}
			<Animated.View style={animatedStyle}>
				<Box className="h-8 w-40 bg-background-200 rounded-md" />
			</Animated.View>

			{/* Avatar group and menu button skeleton */}
			<HStack space="xl" className="px-1 items-center">
				<Animated.View style={animatedStyle}>
					<HStack>
						<Box className="h-8 w-8 rounded-full bg-background-200 -mr-1" />
						<Box className="h-8 w-8 rounded-full bg-background-200 -mr-1" />
						<Box className="h-8 w-8 rounded-full bg-background-200" />
					</HStack>
				</Animated.View>

				<Animated.View style={animatedStyle}>
					<Box className="h-8 w-8 bg-background-200 rounded-md" />
				</Animated.View>
			</HStack>
		</HStack>
	);
}
