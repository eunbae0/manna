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
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';

/**
 * 나눔 노트 상세 스켈레톤 UI 컴포넌트
 * 데이터 로딩 중에 표시되는 스켈레톤 UI
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
		<SafeAreaView className="h-full pt-7">
			<VStack space="xl" className="h-full">
				{/* 헤더 스켈레톤 */}
				<HStack className="justify-between px-5 pt-2">
					<SkeletonItem className="h-6 w-6 bg-background-200 rounded-md" />
					<SkeletonItem className="h-6 w-6 bg-background-200 rounded-md" />
				</HStack>

				<ScrollView showsVerticalScrollIndicator={false}>
					<VStack space="2xl" className="px-5 flex-1 pb-8">
						{/* 나눔 노트 제목 및 정보 스켈레톤 */}
						<VStack space="md">
							<SkeletonItem className="h-10 w-3/4 bg-background-200 rounded-md" />
							<SkeletonItem className="h-5 w-48 bg-background-200 rounded-md" />
						</VStack>

						{/* 추가 정보 스켈레톤 */}
						<VStack className="bg-zinc-50 border border-background-200 rounded-2xl px-4 py-5">
							{/* 접기/펼치기 버튼 스켈레톤 */}
							<HStack className="absolute top-5 right-4 items-center">
								<SkeletonItem className="h-4 w-12 bg-background-200 rounded-md" />
								<SkeletonItem className="h-4 w-4 bg-background-200 rounded-md ml-1" />
							</HStack>

							{/* 설교 제목 스켈레톤 */}
							<VStack space="xs">
								<HStack space="sm" className="items-center">
									<SkeletonItem className="h-4 w-4 bg-background-200 rounded-md" />
									<SkeletonItem className="h-4 w-16 bg-background-200 rounded-md" />
								</HStack>
								<SkeletonItem className="h-6 w-48 bg-background-200 rounded-md ml-6" />
							</VStack>

							{/* 설교 본문 스켈레톤 */}
							<VStack space="xs" className="mt-4">
								<HStack space="sm" className="items-center">
									<SkeletonItem className="h-4 w-4 bg-background-200 rounded-md" />
									<SkeletonItem className="h-4 w-16 bg-background-200 rounded-md" />
								</HStack>
								<SkeletonItem className="h-6 w-40 bg-background-200 rounded-md ml-6" />
							</VStack>

							{/* 설교자 스켈레톤 */}
							<VStack space="xs" className="mt-4">
								<HStack space="sm" className="items-center">
									<SkeletonItem className="h-4 w-4 bg-background-200 rounded-md" />
									<SkeletonItem className="h-4 w-16 bg-background-200 rounded-md" />
								</HStack>
								<SkeletonItem className="h-6 w-32 bg-background-200 rounded-md ml-6" />
							</VStack>

							{/* 참여자 스켈레톤 */}
							<VStack space="xs" className="mt-4">
								<HStack space="sm" className="items-center">
									<SkeletonItem className="h-4 w-4 bg-background-200 rounded-md" />
									<SkeletonItem className="h-4 w-16 bg-background-200 rounded-md" />
								</HStack>
								<HStack space="md" className="ml-6">
									<SkeletonItem className="h-8 w-8 bg-background-200 rounded-full" />
									<SkeletonItem className="h-8 w-8 bg-background-200 rounded-full" />
									<SkeletonItem className="h-8 w-8 bg-background-200 rounded-full" />
									<SkeletonItem className="h-8 w-8 bg-background-200 rounded-full" />
								</HStack>
							</VStack>
						</VStack>

						{/* 나눔 컨텐츠 영역 스켈레톤 */}
						<VStack className="gap-8 pb-10">
							{/* 아이스 브레이킹 스켈레톤 */}
							<VStack space="md">
								<HStack className="justify-between items-center">
									<SkeletonItem className="h-6 w-32 bg-background-200 rounded-md" />
									<SkeletonItem className="h-5 w-5 bg-background-200 rounded-md" />
								</HStack>
								<VStack space="md">
									<VStack className="bg-white rounded-xl p-4 border border-background-200">
										<HStack space="sm" className="items-center mb-2">
											<SkeletonItem className="h-8 w-8 bg-background-200 rounded-full" />
											<SkeletonItem className="h-4 w-20 bg-background-200 rounded-md" />
										</HStack>
										<SkeletonItem className="h-4 w-full bg-background-200 rounded-md" />
										<SkeletonItem className="h-4 w-3/4 bg-background-200 rounded-md mt-1" />
									</VStack>
									<VStack className="bg-white rounded-xl p-4 border border-background-200">
										<HStack space="sm" className="items-center mb-2">
											<SkeletonItem className="h-8 w-8 bg-background-200 rounded-full" />
											<SkeletonItem className="h-4 w-20 bg-background-200 rounded-md" />
										</HStack>
										<SkeletonItem className="h-4 w-full bg-background-200 rounded-md" />
										<SkeletonItem className="h-4 w-1/2 bg-background-200 rounded-md mt-1" />
									</VStack>
								</VStack>
							</VStack>

							{/* 설교 나눔 스켈레톤 */}
							<VStack space="md">
								<HStack className="justify-between items-center">
									<SkeletonItem className="h-6 w-24 bg-background-200 rounded-md" />
									<SkeletonItem className="h-5 w-5 bg-background-200 rounded-md" />
								</HStack>
								<VStack space="md">
									<VStack className="bg-white rounded-xl p-4 border border-background-200">
										<HStack space="sm" className="items-center mb-2">
											<SkeletonItem className="h-8 w-8 bg-background-200 rounded-full" />
											<SkeletonItem className="h-4 w-20 bg-background-200 rounded-md" />
										</HStack>
										<SkeletonItem className="h-4 w-full bg-background-200 rounded-md" />
										<SkeletonItem className="h-4 w-3/4 bg-background-200 rounded-md mt-1" />
										<SkeletonItem className="h-4 w-1/2 bg-background-200 rounded-md mt-1" />
									</VStack>
								</VStack>
							</VStack>

							{/* 기도 제목 스켈레톤 */}
							<VStack space="md">
								<HStack className="justify-between items-center">
									<SkeletonItem className="h-6 w-20 bg-background-200 rounded-md" />
									<SkeletonItem className="h-5 w-5 bg-background-200 rounded-md" />
								</HStack>
								<VStack space="md">
									<VStack className="bg-white rounded-xl p-4 border border-background-200">
										<HStack space="sm" className="items-center mb-2">
											<SkeletonItem className="h-8 w-8 bg-background-200 rounded-full" />
											<SkeletonItem className="h-4 w-20 bg-background-200 rounded-md" />
										</HStack>
										<SkeletonItem className="h-4 w-full bg-background-200 rounded-md" />
										<SkeletonItem className="h-4 w-2/3 bg-background-200 rounded-md mt-1" />
									</VStack>
									<VStack className="bg-white rounded-xl p-4 border border-background-200">
										<HStack space="sm" className="items-center mb-2">
											<SkeletonItem className="h-8 w-8 bg-background-200 rounded-full" />
											<SkeletonItem className="h-4 w-20 bg-background-200 rounded-md" />
										</HStack>
										<SkeletonItem className="h-4 w-full bg-background-200 rounded-md" />
										<SkeletonItem className="h-4 w-3/4 bg-background-200 rounded-md mt-1" />
									</VStack>
								</VStack>
							</VStack>
						</VStack>
					</VStack>
				</ScrollView>
			</VStack>
		</SafeAreaView>
	);
}
