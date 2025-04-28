import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
	Easing,
} from 'react-native-reanimated';

import { Box } from '#/components/ui/box';
import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';

/**
 * Skeleton UI component for the FellowshipListScreen
 * Displays loading placeholders with animation while data is being fetched
 */
export function FellowshipSkeleton() {
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

	// Create skeleton item with animation
	const SkeletonItem = ({ className }: { className: string }) => (
		<Animated.View style={animatedStyle}>
			<Box className={className} />
		</Animated.View>
	);

	return (
		<VStack className="px-5 gap-8">
			<SkeletonItem className="h-8 w-48 bg-background-200 rounded-md" />
			<VStack space="md">
				{/* Fellowship item skeletons */}
				{['item1', 'item2', 'item3', 'item4', 'item5'].map((itemId) => (
					<HStack
						key={`fellowship-skeleton-${itemId}`}
						className="bg-background-100 rounded-2xl justify-between items-center px-4 py-5"
					>
						<VStack>
							<SkeletonItem className="h-4 w-24 bg-background-200 rounded-md mb-2" />
							<SkeletonItem className="h-6 w-48 bg-background-200 rounded-md" />
						</VStack>
						<SkeletonItem className="h-6 w-6 bg-background-200 rounded-md" />
					</HStack>
				))}
			</VStack>
		</VStack>
	);
}
