import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Box } from '#/components/ui/box';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { memo } from 'react';

/**
 * 나눔 카드 로딩 상태를 표시하는 스켈레톤 컴포넌트
 * FellowshipCard와 유사한 디자인의 스켈레톤 카드를 표시
 */
export function FellowshipCardSkeleton() {
  // 애니메이션 설정
  const opacity = useSharedValue(0.7);

  // 컴포넌트 마운트 시 애니메이션 시작
  opacity.value = withRepeat(
    withTiming(1, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }),
    -1, // 무한 반복
    true, // 애니메이션 역방향 재생
  );

  // 애니메이션 스타일 생성
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // 스켈레톤 아이템 컴포넌트
  const SkeletonItem = memo(({ className }: { className: string }) => (
    <Animated.View style={animatedStyle}>
      <Box className={className} />
    </Animated.View>
  ));

  // 카테고리 제목 스켈레톤 컴포넌트
  const CategoryTitleSkeleton = memo(() => (
    <HStack space="sm" className="items-center">
      <SkeletonItem className="h-6 w-16 bg-background-200 rounded-md" />
      <SkeletonItem className="h-6 w-16 bg-background-200 rounded-md" />
      <SkeletonItem className="h-6 w-16 bg-background-200 rounded-md" />
    </HStack>
  ));

  // 콘텐츠 아이템 스켈레톤 컴포넌트
  const ContentItemSkeleton = memo(() => (
    <HStack space="sm" className="items-start">
      <SkeletonItem className="h-8 w-8 rounded-full bg-background-200 mt-1" />
      <VStack space="xs" className="flex-1">
        <SkeletonItem className="h-4 w-24 bg-background-200 rounded-md" />
        <SkeletonItem className="h-4 w-full bg-background-200 rounded-md" />
        <SkeletonItem className="h-4 w-3/4 bg-background-200 rounded-md" />
      </VStack>
    </HStack>
  ));

  return (
    <VStack className="bg-gray-50 border border-gray-100 w-96 min-h-72 rounded-2xl p-4">
      <HStack space="xs" className="items-center justify-between">
        <SkeletonItem className="h-8 w-48 bg-background-200 rounded-md" />
        <SkeletonItem className="h-5 w-24 bg-background-200 rounded-md" />
      </HStack>
      <HStack space="xs" className="items-center mt-2">
        <SkeletonItem className="h-6 w-6 rounded-full bg-background-200" />
        <SkeletonItem className="h-4 w-20 bg-background-200 rounded-md" />
      </HStack>
      <VStack space="sm" className="mt-4">
        <CategoryTitleSkeleton />
        <VStack space="md" className="mt-2">
          <ContentItemSkeleton />
          <ContentItemSkeleton />
        </VStack>
      </VStack>
    </VStack>
  );
}

export default FellowshipCardSkeleton;