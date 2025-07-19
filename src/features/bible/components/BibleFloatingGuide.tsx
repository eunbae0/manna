import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { Text } from '@/shared/components/text';
import { cn } from '@/shared/utils/cn';
import { BookMarked, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { DEFAULT_BOOK_DATA } from '../constants';
import { useBibleStore } from '../store/bible';
import AnimatedPressable from '@/components/common/animated-pressable';
import Animated, {
	useAnimatedStyle,
	withSpring,
	withTiming,
} from 'react-native-reanimated';
import { useToastStore } from '@/store/toast';

type Props = {
	isScrollDown: boolean;
	handleOpenBibleSelector: () => void;
};

export function BibleFloatingGuide({
	isScrollDown,
	handleOpenBibleSelector,
}: Props) {
	const { showInfo } = useToastStore();

	const {
		currentBookId,
		bookIndex,
		currentChapter,
		goToPrevChapter,
		goToNextChapter,
	} = useBibleStore();
	const currentBook =
		bookIndex.find((book) => book.id === currentBookId) || DEFAULT_BOOK_DATA;

	const isFirstChapter = currentBookId === 'GEN' && currentChapter === 1;
	const isLastChapter =
		currentBookId === 'REV' && currentChapter === currentBook?.chapters_count;

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: isScrollDown
			? withTiming(0, { duration: 200 })
			: withTiming(1, { duration: 200 }),
		maxWidth: isScrollDown
			? withTiming(0, { duration: 200 })
			: withTiming(200, { duration: 200 }),
		height: 22,
	}));

	return (
		<HStack
			space="xs"
			className="z-20 absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-2 items-center"
		>
			<AnimatedPressable
				onPress={() => goToPrevChapter(showInfo)}
				disabled={isFirstChapter}
				className="rounded-full"
				scale="lg"
				withHaptic
				pressableClassName="p-4"
			>
				<Icon
					as={ChevronLeft}
					size="xl"
					className={cn(
						isFirstChapter ? 'text-gray-400' : 'text-typography-200',
					)}
				/>
			</AnimatedPressable>
			<AnimatedPressable
				onPress={handleOpenBibleSelector}
				className="rounded-full bg-primary-500"
				withHaptic
				scale="lg"
				pressableClassName="p-4"
			>
				<HStack space="xs" className="items-center">
					<Icon as={BookMarked} size="md" className="text-typography-200" />
					<Animated.View style={animatedStyle}>
						<Text size="lg" weight="medium" className="text-typography-200">
							바로가기
						</Text>
					</Animated.View>
				</HStack>
			</AnimatedPressable>
			<AnimatedPressable
				onPress={() => goToNextChapter(showInfo)}
				disabled={isLastChapter}
				className="rounded-full"
				scale="lg"
				withHaptic
				pressableClassName="p-4"
			>
				<Icon
					as={ChevronRight}
					size="xl"
					className={cn(
						isLastChapter ? 'text-gray-400' : 'text-typography-200',
					)}
				/>
			</AnimatedPressable>
		</HStack>
	);
}
