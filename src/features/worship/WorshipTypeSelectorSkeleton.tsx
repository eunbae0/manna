import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
	Easing,
} from 'react-native-reanimated';

import { Box } from '#/components/ui/box';
import { HStack } from '#/components/ui/hstack';
import { ScrollView } from 'react-native';

/**
 * Skeleton UI component for the WorshipTypeSelector
 * Displays loading placeholders with animation while worship types are being fetched
 */
export function WorshipTypeSelectorSkeleton() {
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
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={{ paddingRight: 20 }}
			className="flex-grow"
		>
			<HStack space="sm" className="py-1 items-center">
				{['type1', 'type2', 'type3', 'type4'].map((id) => (
					<SkeletonItem
						key={`worship-type-skeleton-${id}`}
						className="h-8 w-16 bg-background-200 rounded-full mr-1"
					/>
				))}
				<SkeletonItem className="h-8 w-8 bg-background-200 rounded-full mr-1" />
			</HStack>
		</ScrollView>
	);
}
