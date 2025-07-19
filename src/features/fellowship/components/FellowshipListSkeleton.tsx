import { Box } from '#/components/ui/box';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { shadowStyle } from '@/shared/styles/shadow';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
	Easing,
} from 'react-native-reanimated';

/**
 * 나눔 목록 아이템 스켈레톤 UI 컴포넌트
 * 데이터 로딩 중에 표시되는 스켈레톤 UI
 */
export function FellowshipListSkeleton() {
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
		<Box className="mb-4 mx-4">
			<Box
				style={shadowStyle.shadow}
				className="border bg-gray-100 border-gray-200 rounded-2xl px-4 py-3"
			>
				{/* 상단 영역: 제목과 정보 스켈레톤 */}
				<HStack className="justify-between items-center">
					<VStack space="sm">
						{/* 제목 스켈레톤 */}
						<SkeletonItem className="h-6 w-48 bg-background-200 rounded-md" />

						{/* 날짜와 참여자 정보 스켈레톤 */}
						<HStack space="md" className="items-center">
							{/* 날짜 스켈레톤 */}
							<SkeletonItem className="h-5 w-24 bg-background-200 rounded-md" />

							{/* 참여자 아바타 스켈레톤 */}
							<HStack className="items-center gap-[1px]">
								<SkeletonItem className="h-6 w-6 bg-background-200 rounded-full" />
								<SkeletonItem className="h-6 w-6 bg-background-200 rounded-full ml-1" />
								<SkeletonItem className="h-6 w-6 bg-background-200 rounded-full ml-1" />
							</HStack>
						</HStack>
					</VStack>

					{/* 화살표 아이콘 스켈레톤 */}
					<SkeletonItem className="h-5 w-5 bg-background-200 rounded-md" />
				</HStack>
			</Box>
		</Box>
	);
}

/**
 * 나눔 목록 스켈레톤 UI 컴포넌트 (여러 개)
 * 데이터 로딩 중에 표시되는 스켈레톤 UI 목록
 */
export function FellowshipListSkeletonGroup() {
	return (
		<VStack>
			<FellowshipListSkeleton />
			<FellowshipListSkeleton />
			<FellowshipListSkeleton />
		</VStack>
	);
}
