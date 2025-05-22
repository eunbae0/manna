import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Box } from '#/components/ui/box';
import { Divider } from '#/components/ui/divider';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
	Easing,
} from 'react-native-reanimated';

/**
 * 기도제목 로딩 상태를 표시하는 스켈레톤 컴포넌트
 * PrayerRequestCard와 유사한 디자인의 스켈레톤 카드 3개를 세로로 배치
 */
export function PrayerRequestSkeleton() {
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
	const SkeletonItem = ({ className }: { className: string }) => (
		<Animated.View style={animatedStyle}>
			<Box className={className} />
		</Animated.View>
	);

	// 기도제목 카드 스켈레톤 컴포넌트
	const PrayerRequestCardSkeleton = () => (
		<VStack space="sm" className="p-4">
			<HStack space="sm" className="items-center">
				<SkeletonItem className="h-10 w-10 rounded-full bg-background-200" />
				<SkeletonItem className="h-5 w-32 bg-background-200 rounded-md" />
			</HStack>
			<SkeletonItem className="h-4 w-full bg-background-200 rounded-md" />
			<SkeletonItem className="h-4 w-3/4 bg-background-200 rounded-md" />
		</VStack>
	);

	return (
		<VStack className="w-full">
			<PrayerRequestCardSkeleton />
			<Divider className="bg-background-100 h-[1px]" />
			<PrayerRequestCardSkeleton />
			<Divider className="bg-background-100 h-[1px]" />
			<PrayerRequestCardSkeleton />
		</VStack>
	);
}
