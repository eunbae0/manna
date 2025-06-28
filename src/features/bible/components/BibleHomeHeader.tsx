import { HStack } from '#/components/ui/hstack';
import { Text } from '@/shared/components/text';
import { ChevronDown, ChevronLeft, ChevronRight, Search, Settings, X } from 'lucide-react-native';
import AnimatedPressable from '@/components/common/animated-pressable';
import { useBibleStore } from '../store/bible';
import { DEFAULT_BOOK_DATA } from '../constants';
import { Icon } from '#/components/ui/icon';
import { Button } from '@/components/common/button';
import { cn } from '@/shared/utils/cn';
import { router } from 'expo-router';

interface BibleHomeHeaderProps {
  isScrollDown: boolean;
  handleOpenBibleSelector: () => void;
}

export function BibleHomeHeader({ isScrollDown, handleOpenBibleSelector }: BibleHomeHeaderProps) {
  const { currentBookId, bookIndex, currentChapter, goToPrevChapter, goToNextChapter } = useBibleStore();
  const currentBook = bookIndex.find(book => book.id === currentBookId) || DEFAULT_BOOK_DATA;

  // TODO: 창세기, 요한계시록인 경우에만 구분
  const isFirstChapter = currentChapter === 1;
  const isLastChapter = currentBook ? currentChapter === currentBook.chapters_count : false;

  const handlePressSearch = () => {
    router.push('/search');
  }

  return (
    isScrollDown ? (
      <HStack className="justify-between items-center p-2 border-b border-gray-100 dark:border-gray-800">
        <Button
          variant="text"
          size="sm"
          onPress={goToPrevChapter}
          disabled={isFirstChapter}
          className="w-10 p-0"
          withHaptic
        >
          <Icon as={ChevronLeft} size="xl" className={cn(isFirstChapter ? 'text-gray-400' : 'text-primary-400')} />
        </Button>

        <AnimatedPressable withHaptic onPress={handleOpenBibleSelector}>
          <HStack space="xs" className="items-center">
            <Text size="lg" weight="semi-bold">
              {currentBook?.name_kr} {currentChapter}장
            </Text>
            <Icon as={ChevronDown} size="md" className="text-typography-500" />
          </HStack>
        </AnimatedPressable>

        <Button
          variant="text"
          size="sm"
          onPress={goToNextChapter}
          disabled={isLastChapter}
          className="w-10 p-0"
          withHaptic
        >
          <Icon as={ChevronRight} size="xl" className={cn(isLastChapter ? 'text-gray-400' : 'text-primary-400')} />
        </Button>
      </HStack>
    ) : (
      <HStack className="justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
        <AnimatedPressable withHaptic onPress={handleOpenBibleSelector}>
          <HStack space="sm" className="items-center">
            <Text size="2xl" weight="semi-bold">
              {currentBook?.name_kr} {currentChapter}장
            </Text>
            <Icon as={ChevronDown} size="xl" className="text-typography-500" />
          </HStack>
        </AnimatedPressable>
        <HStack space="md">
          <AnimatedPressable withHaptic onPress={handlePressSearch}>
            <Search size={24} className="text-primary-400" />
          </AnimatedPressable>
        </HStack>
      </HStack>
    )
  );
}