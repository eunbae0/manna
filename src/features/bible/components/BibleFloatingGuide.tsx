import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { Text } from '@/shared/components/text'
import { cn } from '@/shared/utils/cn';
import { BookMarked, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { DEFAULT_BOOK_DATA } from '../constants';
import { useBibleStore } from '../store/bible';
import AnimatedPressable from '@/components/common/animated-pressable';

type Props = {
  isScrollDown: boolean;
  handleOpenBibleSelector: () => void;
}

export function BibleFloatingGuide({ isScrollDown, handleOpenBibleSelector }: Props) {
  const { currentBookId, bookIndex, currentChapter, goToPrevChapter, goToNextChapter } = useBibleStore();
  const currentBook = bookIndex.find(book => book.id === currentBookId) || DEFAULT_BOOK_DATA;

  const isFirstChapter = currentChapter === 1;
  const isLastChapter = currentBook ? currentChapter === currentBook.chapters_count : false;

  return (
    <HStack space="sm" className="z-20 absolute bottom-4 right-4">
      <AnimatedPressable
        onPress={handleOpenBibleSelector}
        className="py-3 px-4 rounded-full bg-primary-500 border border-primary-400"
        withHaptic
      >
        <HStack space="xs" className="items-center">
          <Icon as={BookMarked} size="md" className="text-primary-50" />
          {!isScrollDown ? <Text size="lg" weight="medium" className="text-primary-50">바로가기</Text> : null}
        </HStack>
      </AnimatedPressable>
      <AnimatedPressable
        onPress={goToPrevChapter}
        disabled={isFirstChapter}
        className="p-3 rounded-full bg-primary-500 border border-primary-400"
        withHaptic
      >
        <Icon as={ChevronLeft} size="xl" className={cn(isFirstChapter ? 'text-gray-400' : 'text-primary-50')} />
      </AnimatedPressable>
      <AnimatedPressable
        onPress={goToNextChapter}
        disabled={isLastChapter}
        className="p-3 rounded-full bg-primary-500 border border-primary-400"
        withHaptic
      >
        <Icon as={ChevronRight} size="xl" className={cn(isLastChapter ? 'text-gray-400' : 'text-primary-50')} />
      </AnimatedPressable>
    </HStack>
  )
}