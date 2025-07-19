import { HStack } from '#/components/ui/hstack';
import { Text } from '@/shared/components/text';
import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Info,
	Search,
	Settings,
	X,
} from 'lucide-react-native';
import AnimatedPressable from '@/components/common/animated-pressable';
import { useBibleStore } from '../store/bible';
import { DEFAULT_BOOK_DATA } from '../constants';
import { Icon } from '#/components/ui/icon';
import { Button, ButtonIcon } from '@/components/common/button';
import { cn } from '@/shared/utils/cn';
import { router } from 'expo-router';
import { useToastStore } from '@/store/toast';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { VStack } from '#/components/ui/vstack';
import Heading from '@/shared/components/heading';
import Divider from '@/shared/components/divider';

interface BibleHomeHeaderProps {
	isScrollDown: boolean;
	handleOpenBibleSelector: () => void;
	handleOpenSetting: () => void;
}

export function BibleHomeHeader({
	isScrollDown,
	handleOpenBibleSelector,
	handleOpenSetting,
}: BibleHomeHeaderProps) {
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

	const handlePressSearch = () => {
		// router.push('/search');
	};

	const handlePressSetting = () => {
		handleOpenSetting();
	};

	const { BottomSheetContainer, handleOpen } = useBottomSheet();

	return (
		<>
			{isScrollDown ? (
				<HStack className="justify-between items-center px-2 pb-2 border-b border-gray-100 dark:border-gray-800">
					<Button
						variant="text"
						size="sm"
						onPress={() => goToPrevChapter(showInfo)}
						disabled={isFirstChapter}
						className="w-10 p-0"
						withHaptic
					>
						<Icon
							as={ChevronLeft}
							size="xl"
							className={cn(
								isFirstChapter ? 'text-gray-400' : 'text-primary-400',
							)}
						/>
					</Button>

					<AnimatedPressable withHaptic onPress={handleOpenBibleSelector}>
						<HStack space="xs" className="items-center">
							<Text size="lg" weight="semi-bold">
								{currentBook?.name_kr} {currentChapter}장
							</Text>
							<Icon
								as={ChevronDown}
								size="md"
								className="text-typography-500"
							/>
						</HStack>
					</AnimatedPressable>

					<Button
						variant="text"
						size="sm"
						onPress={() => goToNextChapter(showInfo)}
						disabled={isLastChapter}
						className="w-10 p-0"
						withHaptic
					>
						<Icon
							as={ChevronRight}
							size="xl"
							className={cn(
								isLastChapter ? 'text-gray-400' : 'text-primary-400',
							)}
						/>
					</Button>
				</HStack>
			) : (
				<HStack className="justify-between items-center pt-1 pb-2 pl-5 pr-3 border-b border-gray-100 dark:border-gray-800">
					<HStack space="md" className="items-center">
						<AnimatedPressable withHaptic onPress={handleOpenBibleSelector}>
							<HStack space="sm" className="items-center">
								<Text size="2xl" weight="semi-bold">
									{currentBook?.name_kr} {currentChapter}장
								</Text>
								<Icon
									as={ChevronDown}
									size="xl"
									className="text-typography-500"
								/>
							</HStack>
						</AnimatedPressable>
						<AnimatedPressable onPress={handleOpen}>
							<Text
								weight="semi-bold"
								className="px-2 py-1 rounded-lg bg-primary-100 border border-primary-200/40 text-primary-800/70"
							>
								개역한글
							</Text>
						</AnimatedPressable>
					</HStack>
					<HStack>
						{/* <Button variant='icon' size="lg" withHaptic onPress={handlePressSearch}>
            <ButtonIcon as={Search} />
          </Button> */}
						<Button
							variant="icon"
							size="lg"
							withHaptic
							onPress={handlePressSetting}
						>
							<ButtonIcon as={Settings} />
						</Button>
					</HStack>
				</HStack>
			)}
			<BottomSheetContainer>
				<VStack className="px-5 pt-5 pb-12">
					<VStack space="2xl">
						<HStack space="sm" className="items-center">
							<Icon as={Info} size="lg" />
							<Heading size="2xl">저작권 안내</Heading>
						</HStack>
						<Text size="xl" className="text-typography-900">
							성경전서 개역한글판(Korean Revised Version - KRV, 1961)에 대한
							저작권은 대한성서공회에 있습니다.
						</Text>
						{/* <TextWithLinks text="https://www.bskorea.or.kr/bbs/board.php?bo_table=copyright_faq&wr_id=5" /> */}
					</VStack>

					<Divider size="sm" className="my-6" />
					<VStack space="md">
						<Text size="xl" weight="semi-bold" className="text-typography-900">
							자주 묻는 질문
						</Text>
						<VStack space="xs">
							<Text size="lg" weight="medium" className="text-typography-900">
								Q. 왜 개역개정 성경이 아닌가요?
							</Text>
							<Text size="lg" className="text-typography-600">
								- 개역개정 성경은 저작권 문제로 아직 제공되지 않고 있어요.
								대한성서공회와 협의하여 빠른 시일 내에 제공할 수 있도록
								노력하겠습니다.
							</Text>
						</VStack>
					</VStack>
				</VStack>
			</BottomSheetContainer>
		</>
	);
}
