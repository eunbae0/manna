import { useCallback, useMemo } from 'react';
import { ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useBibleStore } from '../store/bible';
import { Text } from '@/shared/components/text';
import { VStack } from '#/components/ui/vstack';
import { Button, ButtonText } from '@/components/common/button';
import type { UseScrollDownReturnType } from '@/shared/hooks/useScrollDown';
import { useInitializeCurrentVerse } from '../hooks/useInitializeCurrentVerse';
import { VerseItem } from './VerseItem';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import BibleVerseSheet from './BibleVerseSheet';

type Props = {
  onScrollDown: UseScrollDownReturnType['onScrollDown'];
};

export function BibleContent({ onScrollDown }: Props) {
  const {
    verses,
    currentVerse,
    currentChapter,
    currentBookId,
    isLoading,
    error,
    loadVerses,
    clearSelectedVerses,
  } = useBibleStore();

  useInitializeCurrentVerse();

  const handleRefresh = async () => {
    if (currentBookId && currentChapter) {
      await loadVerses(currentBookId, currentChapter);
    }
  };

  const renderVerse = useCallback(({ item, handleOpenSheet, handleCloseSheet }: { item: VerseItem, handleOpenSheet: () => void, handleCloseSheet: () => void }) => (
    <VerseItem item={item} handleOpenSheet={handleOpenSheet} handleCloseSheet={handleCloseSheet} />
  ), []);

  const onCloseBottomSheet = () => {
    clearSelectedVerses();
  };

  const { BottomSheetContainer, handleOpen, handleClose } = useBottomSheet({ onClose: onCloseBottomSheet });


  if (isLoading && verses.length === 0) {
    return (
      <VStack className="flex-1 items-center justify-center p-4 space-y-4">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text>성경을 불러오는 중입니다...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <VStack className="flex-1 items-center justify-center p-4 space-y-4">
        <Text color="error">오류가 발생했습니다: {error}</Text>
        <Button onPress={handleRefresh} variant="outline">
          <ButtonText>다시 시도</ButtonText>
        </Button>
      </VStack>
    );
  }

  if (!verses.length) {
    return (
      <VStack className="flex-1 items-center justify-center p-4 space-y-4">
        <Text>해당 장의 내용을 찾을 수 없습니다.</Text>
        <Button onPress={handleRefresh} variant="outline">
          <ButtonText>새로고침</ButtonText>
        </Button>
      </VStack>
    );
  }

  return (
    <>
      <FlashList
        bounces={false}
        onScroll={onScrollDown}
        data={verses}
        keyExtractor={(item) => item.verse.toString()}
        renderItem={(item) => renderVerse({ item: item.item, handleOpenSheet: handleOpen, handleCloseSheet: handleClose })}
        contentContainerStyle={{ paddingBottom: 72 }}
        removeClippedSubviews={true}
        estimatedItemSize={58}
        extraData={[currentVerse]}
      />
      <BibleVerseSheet BottomSheetContainer={BottomSheetContainer} handleCloseSheet={handleClose} />
    </>
  );
}
