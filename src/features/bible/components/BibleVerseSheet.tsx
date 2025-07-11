import { useMemo } from 'react';
import { BottomSheetListLayout } from '@/components/common/bottom-sheet';
import type { useBottomSheet } from '@/hooks/useBottomSheet';
import { HStack } from '#/components/ui/hstack';
import AnimatedPressable from '@/components/common/animated-pressable';
import { Icon } from '#/components/ui/icon';
import {
  Check,
  Copy,
  MessageSquare,
  NotebookPen,
  Pen,
  Share2,
} from 'lucide-react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';
import { useBibleStore } from '../store/bible';
import { formatCopyedText, formatSelectedVerses } from '../utils';
import { useCopyText } from '@/shared/hooks/useCopyText';
import { useShareText } from '@/shared/hooks/useShareText';
import { Box } from '#/components/ui/box';
import { cn } from '@/shared/utils/cn';
import { isIOS } from '@/shared/utils/platform';
import type { VerseHighlight, VerseHighlightColor, VerseHighlightType } from '../types/highlight';
import { HIGHLIGHT_COLOR_MAP } from '../constants/highlight';
import { router } from 'expo-router';
import { formatToSelectedBible } from '../utils/selectedBible';
import { useToastStore } from '@/store/toast';

type Props = {
  BottomSheetContainer: ReturnType<
    typeof useBottomSheet
  >['BottomSheetContainer'];
  handleCloseSheet: () => void;
};

export default function BibleVerseSheet({
  BottomSheetContainer,
  handleCloseSheet,
}: Props) {
  const {
    bookIndex,
    currentChapter,
    currentBookId,
    selectedVerses,
    verses,
    currentHighlights,
    addHighlights,
  } = useBibleStore();

  const currentBook = bookIndex.find((book) => book.id === currentBookId);

  const selectedVerseText = useMemo(
    () => formatSelectedVerses(selectedVerses),
    [selectedVerses],
  );

  const { copyText } = useCopyText({
    success: `${currentBook?.name_kr} ${currentChapter}장 ${selectedVerseText}이 복사되었어요.`,
    error: '복사에 실패했어요.',
  });
  const { shareText } = useShareText();

  const { showError } = useToastStore();

  const handleCopyText = async () => {
    const text = formatCopyedText({
      verses,
      bookName: currentBook?.name_kr || null,
      chapter: currentChapter,
      selectedVerses,
    });
    await copyText(text);
    handleCloseSheet();
  };

  const handleShareText = async () => {
    const text = formatCopyedText({
      verses,
      bookName: currentBook?.name_kr || null,
      chapter: currentChapter,
      selectedVerses,
    });
    await shareText(text);
    handleCloseSheet();
  };

  const handleAddToNote = () => {
    if (!currentBook || !currentChapter) {
      showError('책 정보를 찾을 수 없어요.')
      handleCloseSheet();
      return;
    }
    const selectedBible = formatToSelectedBible({
      verses,
      bookId: currentBook.id,
      bookName: currentBook.name_kr,
      chapter: currentChapter,
      selectedVerses,
    });
    router.push(`/(app)/(note)/create?sermon=${JSON.stringify(selectedBible)}`);
    handleCloseSheet();
  };

  const handleAddToFellowship = () => {
    // TODO: 설교 나눔에 추가 기능 추가
  };

  const handlePressHighlightButton = (
    type: VerseHighlightType,
    color: VerseHighlightColor,
  ) => {
    if (!currentBookId || !currentChapter) {
      showError('책 정보를 찾을 수 없어요.')
      handleCloseSheet();
      return;
    }
    // TODO: delete highlights 기능 추가
    const highlights = selectedVerses.map((verse) => ({
      id: `${currentBookId}-${currentChapter}-${verse}`,
      identifier: {
        bookId: currentBookId,
        chapter: currentChapter,
        verse,
      },
      color,
      type,
    })) satisfies VerseHighlight[];
    addHighlights(highlights);
    handleCloseSheet();
  };

  const highlight = useMemo(() => {
    return currentHighlights.find((highlight) =>
      selectedVerses.includes(highlight.identifier.verse),
    );
  }, [currentHighlights, selectedVerses]);

  /** iOS만 underline color 적용 가능 (cc. https://reactnative.dev/docs/text-style-props#textdecorationcolor-ios) */
  const HIGHLIGHT_BUTTONS_LIST: { type: VerseHighlightType; color: VerseHighlightColor }[] = isIOS
    ? [
      { type: 'marker', color: 'red' },
      { type: 'marker', color: 'yellow' },
      { type: 'marker', color: 'green' },
      { type: 'underscore', color: 'red' },
      { type: 'underscore', color: 'yellow' },
      { type: 'underscore', color: 'green' },
    ]
    : [
      { type: 'marker', color: 'red' },
      { type: 'marker', color: 'yellow' },
      { type: 'marker', color: 'green' },
    ];


  return (
    <BottomSheetContainer enableBackdrop={false}>
      <BottomSheetListLayout>
        <VStack space="4xl" className="mt-2 mb-6">
          <Text className="text-2xl" weight="semi-bold">
            {currentBook?.name_kr} {currentChapter}장 {selectedVerseText}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack space="md" className="justify-between items-end">
              {HIGHLIGHT_BUTTONS_LIST.map((button) => (
                <VerseHighlightButton
                  key={`${button.type}-${button.color}`}
                  type={button.type}
                  color={button.color}
                  onPress={() =>
                    handlePressHighlightButton(button.type, button.color)
                  }
                  isChecked={
                    highlight?.color === button.color &&
                    highlight?.type === button.type
                  }
                />
              ))}

            </HStack>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack space="sm" className="justify-between items-center">
              <AnimatedPressable onPress={handleAddToNote}>
                <HStack
                  space="sm"
                  className="items-center bg-background-100 rounded-xl px-4 py-3"
                >
                  <Icon as={NotebookPen} />
                  <Text size="lg" weight="medium">
                    설교 노트에 추가
                  </Text>
                </HStack>
              </AnimatedPressable>
              {/* <AnimatedPressable onPress={handleAddToFellowship}>
                <HStack
                  space="sm"
                  className="items-center bg-background-100 rounded-xl px-4 py-3"
                >
                  <Icon as={MessageSquare} />
                  <Text size="lg" weight="medium">
                    설교 나눔에 추가
                  </Text>
                </HStack>
              </AnimatedPressable> */}
              <AnimatedPressable onPress={handleCopyText}>
                <HStack
                  space="sm"
                  className="items-center bg-background-100 rounded-xl px-4 py-3"
                >
                  <Icon as={Copy} />
                  <Text size="lg" weight="medium">
                    복사
                  </Text>
                </HStack>
              </AnimatedPressable>
              <AnimatedPressable onPress={handleShareText}>
                <HStack
                  space="sm"
                  className="items-center bg-background-100 rounded-xl px-4 py-3"
                >
                  <Icon as={Share2} />
                  <Text size="lg" weight="medium">
                    공유
                  </Text>
                </HStack>
              </AnimatedPressable>
            </HStack>
          </ScrollView>
        </VStack>
      </BottomSheetListLayout>
    </BottomSheetContainer>
  );
}

function VerseHighlightButton({
  type,
  color,
  isChecked = false,
  onPress,
}: {
  type: 'marker' | 'underscore';
  color: 'yellow' | 'green' | 'red';
  isChecked?: boolean;
  onPress?: () => void;
}) {

  return (
    <AnimatedPressable scale="lg" withHaptic onPress={onPress}>
      {type === 'marker' ? (
        <Box
          className={cn(
            'w-10 h-10 rounded-full items-center justify-center',
            HIGHLIGHT_COLOR_MAP[color],
          )}
        />
      ) : (
        <VStack className="items-center gap-[2px]">
          <Icon as={Pen} size="xl" className="text-typography-700/80" />
          <Box
            className={cn(
              'w-10 h-[6px] rounded-full items-center justify-center',
              HIGHLIGHT_COLOR_MAP[color],
            )}
          />
        </VStack>
      )}
      {isChecked && (
        <Box className="z-10 absolute bottom-0 -right-1 w-4 h-4 rounded-full bg-primary-500 items-center justify-center">
          <Icon as={Check} size="2xs" className="text-background-0" />
        </Box>
      )}
    </AnimatedPressable>
  );
}
