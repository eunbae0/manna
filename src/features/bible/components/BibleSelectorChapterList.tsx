import { FlatList } from 'react-native-gesture-handler';
import { useBibleStore } from '../store/bible';
import { VStack } from '#/components/ui/vstack';
import AnimatedPressable from '@/components/common/animated-pressable';
import { View } from 'react-native';
import { Text } from '@/shared/components/text';

export function BibleSelectorChapterList({
  selectedBook,
  handlePressListItem,
}: {
  selectedBook: string | null;
  handlePressListItem: (chapter: number) => void;
}) {
  const { bookIndex } = useBibleStore();

  const data = Array.from(
    {
      length:
        bookIndex.find((book) => book.id === selectedBook)
          ?.chapters_count || 0,
    },
    (_, i) => i + 1,
  );

  return (
    <FlatList
      className='px-5'
      data={data}
      renderItem={({ item }) => (
        <VStack space="sm" className="mb-1 flex-1">
          <AnimatedPressable
            onPress={() => {
              handlePressListItem(item);
            }}
            className="mb-2"
            withHaptic
          >
            <View className="py-4 rounded-md items-center bg-primary-200/25">
              <Text
                size="lg"
                weight="bold"
                className="text-primary-700/80"
              >
                {item}장
              </Text>
            </View>
          </AnimatedPressable>
        </VStack>
      )}
      keyExtractor={(item) => item.toString()}
      numColumns={3}
      columnWrapperStyle={{ gap: 8 }}
      style={{ height: '70%' }}
    />
  )
}