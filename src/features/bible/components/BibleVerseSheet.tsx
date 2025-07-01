import { useMemo } from 'react';
import { BottomSheetListLayout } from '@/components/common/bottom-sheet';
import type { useBottomSheet } from '@/hooks/useBottomSheet';
import { HStack } from '#/components/ui/hstack';
import AnimatedPressable from '@/components/common/animated-pressable';
import { Icon } from '#/components/ui/icon';
import { Copy, Plus } from 'lucide-react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';
import { useBibleStore } from '../store/bible';
import { formatCopyedText, formatSelectedVerses } from '../utils';
import { useCopyText } from '@/shared/hooks/useCopyText';

type Props = {
  BottomSheetContainer: ReturnType<
    typeof useBottomSheet
  >['BottomSheetContainer'];
  handleCloseSheet: () => void;
};

export default function BibleVerseSheet({
  BottomSheetContainer,
  handleCloseSheet
}: Props) {
  const {
    bookIndex,
    currentChapter,
    currentBookId,
    selectedVerses,
    verses
  } = useBibleStore();

  const currentBook = bookIndex.find(book => book.id === currentBookId);

  const selectedVerseText = useMemo(() => formatSelectedVerses(selectedVerses), [selectedVerses]);

  const { copyText } = useCopyText({
    success: `${currentBook?.name_kr} ${currentChapter}장 ${selectedVerseText}이 복사되었어요.`,
    error: '복사에 실패했어요.',
  });

  const handleCopyText = async () => {
    const text = formatCopyedText({ verses, bookName: currentBook?.name_kr || null, chapter: currentChapter, selectedVerses })
    await copyText(text);
    handleCloseSheet();
  }

  const handleAddToNote = () => {
    // TODO: 설교 노트에 추가 기능 추가
  };

  return (
    <BottomSheetContainer enableBackdrop={false}>
      <BottomSheetListLayout>
        <VStack space="4xl" className="mt-4 mb-8">
          <Text className="text-xl" weight="semi-bold">
            {currentBook?.name_kr} {currentChapter}장 {selectedVerseText}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack space="sm" className="justify-between items-center">
              <AnimatedPressable onPress={handleCopyText}>
                <HStack
                  space="sm"
                  className="items-center bg-background-100 rounded-xl px-5 py-3"
                >
                  <Icon as={Copy} />
                  <Text size="lg" weight="medium">
                    복사하기
                  </Text>
                </HStack>
              </AnimatedPressable>
              <AnimatedPressable onPress={handleAddToNote}>
                <HStack
                  space="sm"
                  className="items-center bg-background-100 rounded-xl px-5 py-3"
                >
                  <Icon as={Plus} />
                  <Text size="lg" weight="medium">
                    설교 노트에 추가
                  </Text>
                </HStack>
              </AnimatedPressable>
              <AnimatedPressable>
                <HStack
                  space="sm"
                  className="items-center bg-background-100 rounded-xl px-4 py-3"
                >
                  <Icon as={Copy} />
                  <Text size="lg" weight="medium">
                    공유하기
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
