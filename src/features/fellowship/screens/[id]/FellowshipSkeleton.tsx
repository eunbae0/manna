import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Box } from '#/components/ui/box';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';

/**
 * 나눔 노트 상세 스켈레톤 UI 컴포넌트
 * 데이터 로딩 중에 표시되는 로딩 플레이스홀더
 */
export function FellowshipSkeleton() {
  // 애니메이션 설정
  const opacity = useSharedValue(0.5);

  // 컴포넌트 마운트 시 애니메이션 시작
  opacity.value = withRepeat(
    withTiming(1, {
      duration: 1000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }),
    -1, // 무한 반복
    true, // 애니메이션 역방향 실행
  );

  // 애니메이션 스타일 생성
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // 스켈레톤 아이템 컴포넌트
  const SkeletonItem = ({ className }: { className: string }) => (
    <Animated.View style={animatedStyle}>
      <Box className={className} />
    </Animated.View>
  );

  return (
    <VStack space="md" className="px-5 pt-2">
      {/* 제목 및 정보 스켈레톤 */}
      <VStack space="sm">
        <SkeletonItem className="h-8 w-3/4 bg-background-200 rounded-md" />
        <HStack space="xs" className="items-center">
          <SkeletonItem className="h-4 w-24 bg-background-200 rounded-md" />
          <SkeletonItem className="h-4 w-2 bg-background-200 rounded-md" />
          <SkeletonItem className="h-4 w-32 bg-background-200 rounded-md" />
        </HStack>
      </VStack>

      {/* 참여자 스켈레톤 */}
      <VStack space="sm" className="mt-4">
        <SkeletonItem className="h-4 w-16 bg-background-200 rounded-md" />
        <HStack space="sm">
          <SkeletonItem className="h-10 w-10 bg-background-200 rounded-full" />
          <SkeletonItem className="h-10 w-10 bg-background-200 rounded-full" />
          <SkeletonItem className="h-10 w-10 bg-background-200 rounded-full" />
          <SkeletonItem className="h-10 w-10 bg-background-200 rounded-full" />
        </HStack>
      </VStack>

      {/* 구분선 */}
      <SkeletonItem className="h-px w-full bg-background-200 my-4" />

      {/* 말씀 내용 스켈레톤 */}
      <VStack space="sm">
        <SkeletonItem className="h-5 w-24 bg-background-200 rounded-md" />
        <SkeletonItem className="h-6 w-full bg-background-200 rounded-md" />
        <SkeletonItem className="h-6 w-3/4 bg-background-200 rounded-md" />
        <SkeletonItem className="h-32 w-full bg-background-200 rounded-md mt-2" />
      </VStack>

      {/* 구분선 */}
      <SkeletonItem className="h-px w-full bg-background-200 my-4" />

      {/* 아이스브레이킹 스켈레톤 */}
      <VStack space="sm">
        <SkeletonItem className="h-5 w-32 bg-background-200 rounded-md" />
        <SkeletonItem className="h-20 w-full bg-background-200 rounded-md" />
      </VStack>

      {/* 구분선 */}
      <SkeletonItem className="h-px w-full bg-background-200 my-4" />

      {/* 기도제목 스켈레톤 */}
      <VStack space="sm">
        <SkeletonItem className="h-5 w-20 bg-background-200 rounded-md" />
        <VStack space="md" className="mt-2">
          <SkeletonItem className="h-16 w-full bg-background-200 rounded-md" />
          <SkeletonItem className="h-16 w-full bg-background-200 rounded-md" />
          <SkeletonItem className="h-16 w-full bg-background-200 rounded-md" />
        </VStack>
      </VStack>
    </VStack>
  );
}
