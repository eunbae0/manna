import { Heading } from '@/shared/components/heading';
import { HStack } from '#/components/ui/hstack';
import { Text } from '#/components/ui/text';
import LottieView from 'lottie-react-native';
import { VStack } from '#/components/ui/vstack';
import { router } from 'expo-router';
import AnimatedPressable from '@/components/common/animated-pressable';
import { useFellowshipStore } from '@/store/createFellowship';
import { trackAmplitudeEvent } from '@/shared/utils/amplitude';
import { Icon } from '#/components/ui/icon';
import {
	Calendar,
	Megaphone,
	NotebookPen,
	Presentation,
} from 'lucide-react-native';
import { usePinnedPost } from '@/features/board/hooks/useBoardPosts';
import { useAuthStore } from '@/store/auth';
import { useDelayedValue } from '@/hooks/useDelayedValue';

export default function ServiceGroups() {
	const { setType } = useFellowshipStore();
	const { currentGroup } = useAuthStore();

	// 고정된 게시글 가져오기
	const { data: pinnedPost, isLoading: isPinnedPostLoading } = usePinnedPost(
		currentGroup?.groupId,
	);

	// 로딩 상태 지연 처리
	const isLoading = useDelayedValue(isPinnedPostLoading);

	const handlePressCreateFellowship = () => {
		trackAmplitudeEvent('나눔 만들기 클릭', { screen: 'Tab_Home' });
		setType('CREATE');
		router.push('/(app)/(fellowship)/create');
	};

	const handlePressFellowships = () => {
		trackAmplitudeEvent('나눔 기록 클릭', { screen: 'Tab_Home' });
		router.push('/(app)/(fellowship)/list');
	};

	// 일정 화면으로 이동하는 핸들러
	const handlePressSchedule = () => {
		trackAmplitudeEvent('일정 클릭', { screen: 'Tab_Home' });
		router.push('/(app)/(tabs)/note');
	};

	// 게시판 화면으로 이동하는 핸들러
	const handlePressBoard = () => {
		trackAmplitudeEvent('게시판 클릭', { screen: 'Tab_Home' });
		router.push('/(app)/(board)/board-index');
	};

	// 고정된 게시글로 이동하는 핸들러
	const handlePressPinnedPost = () => {
		if (!pinnedPost) return;

		trackAmplitudeEvent('고정 게시글 클릭', { screen: 'Tab_Home' });
		router.push(`/(app)/(board)/${pinnedPost.id}`);
	};

	return (
		<VStack space="lg" className="px-4">
			<AnimatedPressable
				className="flex-1"
				onPress={handlePressCreateFellowship}
			>
				<HStack className="bg-primary-500 rounded-2xl justify-between px-6 py-5">
					<VStack space="xs">
						<Heading size="lg" className="text-white">
							나눔 만들기
						</Heading>
						<Text size="sm" className="text-typography-200">
							나눔을 만들고 그룹원들과 소통해보세요
						</Text>
					</VStack>
					<LottieView
						source={require('../../../../assets/lotties/write.json')}
						autoPlay
						loop
						style={{
							width: 50,
							height: 50,
							marginTop: 4,
						}}
					/>
				</HStack>
			</AnimatedPressable>
			<HStack space="sm" className="h-20">
				<AnimatedPressable className="flex-1" onPress={handlePressFellowships}>
					<HStack className="bg-gray-100 pl-6 rounded-2xl items-start justify-between py-2 h-full">
						<Heading size="lg" className="pt-2 font-pretendard-semi-bold">
							나눔 기록
						</Heading>
						<LottieView
							source={require('../../../../assets/lotties/fellowships.json')}
							autoPlay
							loop
							style={{
								width: 60,
								height: 60,
							}}
						/>
					</HStack>
				</AnimatedPressable>
				<HStack space="sm" className="h-full flex-1">
					<AnimatedPressable className="flex-1" onPress={handlePressBoard}>
						<VStack
							space="xs"
							className="items-center justify-center bg-gray-100 rounded-2xl h-full"
						>
							<Icon as={Presentation} size="xl" />
							<Text>게시판</Text>
						</VStack>
					</AnimatedPressable>
					<AnimatedPressable className="flex-1" onPress={handlePressSchedule}>
						<VStack
							space="xs"
							className="items-center justify-center bg-gray-100 rounded-2xl h-full"
						>
							<Icon as={NotebookPen} size="xl" />
							<Text>설교 노트</Text>
						</VStack>
					</AnimatedPressable>
				</HStack>
			</HStack>
			{/* 고정된 게시글이 있을 때만 표시 */}
			{!isLoading && pinnedPost && (
				<AnimatedPressable className="flex-1" onPress={handlePressPinnedPost}>
					<HStack
						space="md"
						className="items-center justify-center rounded-2xl py-3 px-2"
					>
						<Icon as={Megaphone} size="xl" className="stroke-primary-400" />
						<Text
							size="lg"
							className="flex-1 text-typography-800 font-pretendard-medium"
							numberOfLines={1}
							ellipsizeMode="tail"
						>
							{pinnedPost.title}
						</Text>
					</HStack>
				</AnimatedPressable>
			)}
		</VStack>
	);
}
