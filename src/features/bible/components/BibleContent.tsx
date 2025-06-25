import { useBibleStore } from '../store/bible';
import AnimatedPressable from '@/components/common/animated-pressable';
import { Text } from '@/shared/components/text';
import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import { Button, ButtonText } from '@/components/common/button';
import { FlashList } from '@shopify/flash-list';
import { ActivityIndicator } from 'react-native';

interface VerseItem {
  verse: number;
  text: string;
}

export function BibleContent() {
  const {
    verses,
    currentVerse,
    currentChapter,
    currentBookId,
    isLoading,
    error,
    setCurrentVerse,
    loadVerses,
  } = useBibleStore();

  const handleRefresh = async () => {
    if (currentBookId && currentChapter) {
      await loadVerses(currentBookId, currentChapter);
    }
  };

  const renderVerse = ({ item }: { item: VerseItem }) => (
    <AnimatedPressable
      onPress={() => setCurrentVerse(item.verse)}
      className={`p-4 ${currentVerse === item.verse ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}
      scale="sm"
    >
      <HStack space="sm">
        <Text className="text-primary-500" weight="semi-bold" size="lg">{item.verse}.</Text>
        <Text className="flex-1 text-typography-800" size="lg" weight="medium" selectable>
          {item.text}
        </Text>
      </HStack>
    </AnimatedPressable>
  );


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
    <FlashList
      data={verses}
      keyExtractor={(item) => item.verse.toString()}
      renderItem={renderVerse}
      contentContainerStyle={{ paddingBottom: 20 }}
      removeClippedSubviews={true}
      showsVerticalScrollIndicator={false}
      estimatedItemSize={58}
    />
  );
}