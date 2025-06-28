import { HStack } from '#/components/ui/hstack';
import { Text } from '@/shared/components/text';
import { ChevronDown, ChevronLeft, ChevronRight, Search, Settings, X } from 'lucide-react-native';
import AnimatedPressable from '@/components/common/animated-pressable';
import { useBibleStore } from '../store/bible';
import { DEFAULT_BOOK_DATA } from '../constants';
import { Icon } from '#/components/ui/icon';
import { Button, ButtonIcon } from '@/components/common/button';
import { cn } from '@/shared/utils/cn';
import { router } from 'expo-router';
import { useToastStore } from '@/store/toast';

interface BibleHomeHeaderProps {
  isScrollDown: boolean;
  handleOpenBibleSelector: () => void;
  handleOpenSetting: () => void;
}

export function BibleHomeHeader({ isScrollDown, handleOpenBibleSelector, handleOpenSetting }: BibleHomeHeaderProps) {
  const { showInfo } = useToastStore()

  const { currentBookId, bookIndex, currentChapter, goToPrevChapter, goToNextChapter } = useBibleStore();
  const currentBook = bookIndex.find(book => book.id === currentBookId) || DEFAULT_BOOK_DATA;

  const isFirstChapter = currentBookId === 'GEN' && currentChapter === 1;
  const isLastChapter = currentBookId === 'REV' && currentChapter === currentBook?.chapters_count;

  const handlePressSearch = () => {
    // router.push('/search');
  }

  const handlePressSetting = () => {
    handleOpenSetting()
  }

  return (
    isScrollDown ? (
      <HStack className="justify-between items-center px-2 pb-2 border-b border-gray-100 dark:border-gray-800">
        <Button
          variant="text"
          size="sm"
          onPress={() => goToPrevChapter(showInfo)}
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
          onPress={() => goToNextChapter(showInfo)}
          disabled={isLastChapter}
          className="w-10 p-0"
          withHaptic
        >
          <Icon as={ChevronRight} size="xl" className={cn(isLastChapter ? 'text-gray-400' : 'text-primary-400')} />
        </Button>
      </HStack>
    ) : (
      <HStack className="justify-between items-center pt-1 pb-2 pl-5 pr-3 border-b border-gray-100 dark:border-gray-800">
        <AnimatedPressable withHaptic onPress={handleOpenBibleSelector}>
          <HStack space="sm" className="items-center">
            <Text size="2xl" weight="semi-bold">
              {currentBook?.name_kr} {currentChapter}장
            </Text>
            <Icon as={ChevronDown} size="xl" className="text-typography-500" />
          </HStack>
        </AnimatedPressable>
        <HStack>
          <Button variant='icon' size="lg" withHaptic onPress={handlePressSearch}>
            <ButtonIcon as={Search} />
          </Button>
          <Button variant='icon' size="lg" withHaptic onPress={handlePressSetting}>
            <ButtonIcon as={Settings} />
          </Button>
        </HStack>
      </HStack>
    )
  );
}