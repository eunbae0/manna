import { HStack } from '#/components/ui/hstack';
import { Text } from '@/shared/components/text';
import { ChevronDown, ChevronLeft, ChevronRight, Search, Settings, X } from 'lucide-react-native';
import AnimatedPressable from '@/components/common/animated-pressable';
import { useBibleStore } from '../store/bible';
import { DEFAULT_BOOK_DATA } from '../constants';
import { Icon } from '#/components/ui/icon';
import { Button } from '@/components/common/button';
import { useScrolling } from '@/hooks/use-scrolling';
import { cn } from '@/shared/utils/cn';

interface BibleHomeHeaderProps {
  showSearch: boolean;
  onToggleSearch: () => void;
}

export function BibleHomeHeader({ showSearch, onToggleSearch }: BibleHomeHeaderProps) {
  const { currentBookId, bookIndex, currentChapter, goToPrevChapter, goToNextChapter } = useBibleStore();
  const currentBook = bookIndex.find(book => book.id === currentBookId) || DEFAULT_BOOK_DATA;

  const isFirstChapter = currentChapter === 1;
  const isLastChapter = currentBook ? currentChapter === currentBook.chapters_count : false;

  const isScrolling = true

  return (
    isScrolling ? (
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

        <AnimatedPressable withHaptic onPress={() => { }}>
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
        >
          <Icon as={ChevronRight} size="xl" className={cn(isLastChapter ? 'text-gray-400' : 'text-primary-400')} />
        </Button>
      </HStack>
    ) : (
      <HStack className="justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
        {showSearch ? (
          <Text size="2xl" weight="semi-bold">
            성경 검색
          </Text>
        ) : (
          <AnimatedPressable withHaptic onPress={() => { }}>
            <HStack space="sm" className="items-center">
              <Text size="2xl" weight="semi-bold">
                {currentBook?.name_kr} {currentChapter}장
              </Text>
              <Icon as={ChevronDown} size="xl" className="text-typography-500" />
            </HStack>
          </AnimatedPressable>
        )}
        <HStack space="md">
          <AnimatedPressable withHaptic onPress={onToggleSearch}>
            {showSearch ? (
              <X size={24} className="text-primary-400" />
            ) : (
              <Search size={24} className="text-primary-400" />
            )}
          </AnimatedPressable>
          {!showSearch && (
            <AnimatedPressable withHaptic onPress={() => { }}>
              <Settings size={24} className="text-primary-400" />
            </AnimatedPressable>
          )}
        </HStack>
      </HStack>
    )
  );
}