import { HStack } from '#/components/ui/hstack';
import { Text } from '@/shared/components/text';
import { VStack } from '#/components/ui/vstack';
import { router } from 'expo-router';
import AnimatedPressable from '@/components/common/animated-pressable';
import { useFellowshipStore } from '@/store/createFellowship';
import { trackAmplitudeEvent } from '@/shared/utils/amplitude';
import { Icon } from '#/components/ui/icon';
import {
	Megaphone,
	NotebookPen,
	Presentation,
	History,
	ChevronRight,
} from 'lucide-react-native';
import { usePinnedPost } from '@/features/board/hooks/useBoardPosts';
import { useAuthStore } from '@/store/auth';
import { useDelayedValue } from '@/hooks/useDelayedValue';
import LottieView from 'lottie-react-native';
import { shadowStyle } from '@/shared/styles/shadow';

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
		<VStack space="lg" className="px-5">
			<HStack space="md" className="h-40">
				<AnimatedPressable className="flex-1" onPress={handlePressCreateFellowship}>
					<VStack space="md" className="items-center justify-center px-5 bg-primary-500 border border-background-200 rounded-xl h-full">
						<LottieView
							source={require('../../../../assets/lotties/write.json')}
							autoPlay
							loop
							style={{
								width: 48,
								height: 48,
							}}
						/>
						<Text size="md" weight="bold" className="text-typography-0">나눔 만들기</Text>
					</VStack>
				</AnimatedPressable>
				<VStack space="md" className="flex-1">
					<AnimatedPressable className="flex-1" onPress={handlePressFellowships}>
						<HStack style={shadowStyle.shadow} space="md" className="items-center px-5 bg-gray-100 border border-background-200 rounded-xl h-full">
							<Icon as={History} size="xl" className="text-primary-500" />
							<Text size="md" weight="bold">나눔 기록</Text>
						</HStack>
					</AnimatedPressable>
					<AnimatedPressable className="flex-1" onPress={handlePressBoard}>
						<HStack style={shadowStyle.shadow} space="md" className="items-center px-5 bg-gray-100 border border-background-200 rounded-xl h-full">
							<Icon as={Presentation} size="xl" className="text-primary-500" />
							<Text size="md" weight="bold">게시판</Text>
						</HStack>
					</AnimatedPressable>
				</VStack>
			</HStack>
			<HStack space="md" className="h-20">
				<AnimatedPressable className="flex-1" onPress={handlePressSchedule}>
					<HStack style={shadowStyle.shadow} className="items-center justify-between px-6 bg-white border border-background-200 rounded-xl h-full">
						<HStack space="lg" className="items-center">
							<Icon as={NotebookPen} size="2xl" className="text-primary-500" />
							<VStack>
								<Text size="md" weight="bold">설교 노트</Text>
								<Text size="sm" className="text-typography-500">
									설교 말씀을 노트로 남겨보세요.
								</Text>
							</VStack>
						</HStack>
						<Icon as={ChevronRight} className="text-typography-600" />
					</HStack>
				</AnimatedPressable>
			</HStack>
			{/* 고정된 게시글이 있을 때만 표시 */}
			{!isLoading && pinnedPost && (
				<AnimatedPressable className="flex-1" onPress={handlePressPinnedPost}>
					<HStack
						style={shadowStyle.shadow}
						space="md"
						className="items-center justify-center rounded-xl py-3 px-2"
					>
						<Icon as={Megaphone} size="xl" className="text-primary-400" />
						<Text
							size="lg"
							className="flex-1 text-typography-800 font-pretendard-Medium"
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

