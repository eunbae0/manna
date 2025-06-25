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
 * Skeleton UI component for the Note screen
 * Displays loading placeholders with animation while data is being fetched
 */
export function NoteSkeleton() {
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

	// Generate month sections with notes
	const renderMonthSection = (id: string) => (
		<VStack key={id} space="md" className="mb-4">
			<SkeletonItem className="h-8 w-32 bg-background-200 rounded-md" />
			<VStack space="md">
				{['note1', 'note2', 'note3'].map((noteId) => (
					<HStack
						key={`note-skeleton-${id}-${noteId}`}
						className="bg-background-0 rounded-xl p-4 border border-background-200"
					>
						<VStack space="sm" className="w-full">
							<SkeletonItem className="h-5 w-32 bg-background-200 rounded-md" />
							<SkeletonItem className="h-4 w-24 bg-background-200 rounded-md" />
							<SkeletonItem className="h-3 w-full bg-background-200 rounded-md mt-2" />
							<SkeletonItem className="h-3 w-3/4 bg-background-200 rounded-md" />
						</VStack>
					</HStack>
				))}
			</VStack>
		</VStack>
	);

	return (
		<VStack space="lg" className="py-4">
			{['month1', 'month2'].map((id) => renderMonthSection(id))}
		</VStack>
	);
}
