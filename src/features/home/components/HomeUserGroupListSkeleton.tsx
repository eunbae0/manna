import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { HStack } from '#/components/ui/hstack';

export default function HomeUserGroupListSkeleton() {
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

  const SkeletonItem = () => (
    <Animated.View style={[animatedStyle]} className="gap-2 items-center">
      <View style={{ width: 120, height: 80, borderRadius: 14 }} className="bg-background-200" />
      <View style={{ width: 64, height: 14, borderRadius: 10 }} className="bg-background-200" />
    </Animated.View>
  );

  return (
    <HStack className="gap-4">
      {[1, 2, 3].map((i) => (
        <SkeletonItem key={`skeleton-item-${i}`} />
      ))}
    </HStack>
  );
}