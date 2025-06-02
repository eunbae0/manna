import { HStack } from '#/components/ui/hstack';
import { Text } from '@/shared/components/text';
import { VStack } from '#/components/ui/vstack';
import { router } from 'expo-router';
import AnimatedPressable from '@/components/common/animated-pressable';
import { useFellowshipStore } from '@/store/createFellowship';
import { trackAmplitudeEvent } from '@/shared/utils/amplitude';
import { Icon } from '#/components/ui/icon';
import {
	MessageSquare,
	NotebookPen,
	Presentation,
	History,
	Megaphone,
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
		<VStack space="xs" className="mt-1">
			<HStack className="h-24 px-4">
				<AnimatedPressable
					withBackground
					className="flex-1 rounded-2xl"
					onPress={handlePressCreateFellowship}
				>
					<VStack
						space="sm"
						className="items-center justify-center px-2 py-3 h-full"
					>
						<Icon as={MessageSquare} size="2xl" className="text-primary-400" />
						<Text size="sm" weight="medium" className="text-primary-500">나눔 만들기</Text>
					</VStack >
				</AnimatedPressable>
				<AnimatedPressable
					withBackground
					className="flex-1 rounded-2xl"
					onPress={handlePressFellowships}
				>
					<VStack
						space="sm"
						className="items-center justify-center px-2 py-3 h-full"
					>
						<Icon as={History} size="2xl" className="text-primary-400" />
						<Text size="sm" weight="medium" className="text-primary-500">나눔 기록</Text>
					</VStack>
				</AnimatedPressable >

				<AnimatedPressable
					withBackground
					className="flex-1 rounded-2xl"
					onPress={handlePressBoard}
				>
					<VStack
						space="sm"
						className="items-center justify-center px-2 py-3 h-full"
					>
						<Icon as={Presentation} size="2xl" className="text-primary-400" />
						<Text size="sm" weight="medium" className="text-primary-500">게시판</Text>
					</VStack>
				</AnimatedPressable >

				<AnimatedPressable
					withBackground
					className="flex-1 rounded-2xl"
					onPress={handlePressSchedule}
				>
					<VStack
						space="sm"
						className="items-center justify-center px-2 py-3 h-full"
					>
						<Icon as={NotebookPen} size="2xl" className="text-primary-400" />
						<Text size="sm" weight="medium" className="text-primary-500">설교 노트</Text>
					</VStack>
				</AnimatedPressable>
			</HStack>
			{/* 고정된 게시글이 있을 때만 표시 */}
			{!isLoading && pinnedPost && (
				<AnimatedPressable scale="sm" withBackground className="flex-1 rounded-2xl" onPress={handlePressPinnedPost}>
					<HStack
						space="sm"
						className="my-1 items-center justify-center py-3 pl-5 pr-4"
					>
						<Icon as={Megaphone} size="xl" className="text-primary-400" />
						<HStack space="sm" className="items-center flex-1">
							<Text size="sm" className="text-typography-500">
								공지
							</Text>
							<Text size="md" weight="medium" className="text-primary-500">
								{pinnedPost.title}
							</Text>
						</HStack>
						{/* <Icon as={ChevronRight} size="lg" className="text-typography-400" /> */}
					</HStack>
				</AnimatedPressable>
			)}
		</VStack>
	);
}

