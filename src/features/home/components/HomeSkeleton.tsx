import { Box } from '#/components/ui/box';
import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
	Easing,
} from 'react-native-reanimated';

/**
 * Skeleton UI component for the HomeList
 * Displays loading placeholders with animation while data is being fetched
 */
export function HomeSkeleton() {
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
		<VStack space="2xl" className="py-4">
			{/* Service Groups Skeleton */}
			<VStack space="lg" className="px-4">
				<SkeletonItem className="h-6 w-40 bg-background-200 rounded-md" />
				<HStack space="md" className="flex-wrap">
					<SkeletonItem className="h-24 w-[48%] bg-background-200 rounded-lg mb-2" />
					<SkeletonItem className="h-24 w-[48%] bg-background-200 rounded-lg mb-2" />
					<SkeletonItem className="h-24 w-[48%] bg-background-200 rounded-lg mb-2" />
					<SkeletonItem className="h-24 w-[48%] bg-background-200 rounded-lg mb-2" />
				</HStack>
			</VStack>

			{/* Divider Skeleton */}
			<SkeletonItem className="h-2 bg-background-100" />

			{/* Prayer Requests Skeleton */}
			<VStack className="gap-6 px-4 py-1">
				<SkeletonItem className="h-7 w-48 bg-background-200 rounded-md" />
				<VStack space="md">
					<VStack space="sm">
						<HStack space="sm" className="items-center">
							<SkeletonItem className="h-10 w-10 rounded-full bg-background-200" />
							<SkeletonItem className="h-5 w-32 bg-background-200 rounded-md" />
						</HStack>
						<SkeletonItem className="h-4 w-full bg-background-200 rounded-md" />
						<SkeletonItem className="h-4 w-3/4 bg-background-200 rounded-md" />
						<HStack className="justify-between mt-2">
							<SkeletonItem className="h-4 w-20 bg-background-200 rounded-md" />
							<SkeletonItem className="h-4 w-16 bg-background-200 rounded-md" />
						</HStack>
					</VStack>

					<VStack space="sm">
						<HStack space="sm" className="items-center">
							<SkeletonItem className="h-10 w-10 rounded-full bg-background-200" />
							<SkeletonItem className="h-5 w-32 bg-background-200 rounded-md" />
						</HStack>
						<SkeletonItem className="h-4 w-full bg-background-200 rounded-md" />
						<SkeletonItem className="h-4 w-3/4 bg-background-200 rounded-md" />
						<HStack className="justify-between mt-2">
							<SkeletonItem className="h-4 w-20 bg-background-200 rounded-md" />
							<SkeletonItem className="h-4 w-16 bg-background-200 rounded-md" />
						</HStack>
					</VStack>

					<VStack space="sm">
						<HStack space="sm" className="items-center">
							<SkeletonItem className="h-10 w-10 rounded-full bg-background-200" />
							<SkeletonItem className="h-5 w-32 bg-background-200 rounded-md" />
						</HStack>
						<SkeletonItem className="h-4 w-full bg-background-200 rounded-md" />
						<SkeletonItem className="h-4 w-3/4 bg-background-200 rounded-md" />
						<HStack className="justify-between mt-2">
							<SkeletonItem className="h-4 w-20 bg-background-200 rounded-md" />
							<SkeletonItem className="h-4 w-16 bg-background-200 rounded-md" />
						</HStack>
					</VStack>
				</VStack>
			</VStack>
		</VStack>
	);
}
