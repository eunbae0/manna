import { FlatList } from 'react-native-gesture-handler';
import { useBibleStore } from '../store/bible';
import { VStack } from '#/components/ui/vstack';
import AnimatedPressable from '@/components/common/animated-pressable';
import { View } from 'react-native';
import { Text } from '@/shared/components/text';
import { useToastStore } from '@/store/toast';

export function BibleSelectorChapterList({
  selectedBook,
  closeSelector,
}: {
  selectedBook: string | null;
  closeSelector: () => void;
}) {
  const { bookIndex, setCurrentBook, setCurrentChapter } =
    useBibleStore();

  const { showInfo } = useToastStore()

  const data = Array.from(
    {
      length:
        bookIndex.find((book) => book.id === selectedBook)
          ?.chapters_count || 0,
    },
    (_, i) => i + 1,
  );



  const handlePressListItem = (chapter: number) => {
    if (!selectedBook) {
      closeSelector();
      return;
    }
    const bookName = bookIndex.find((book) => book.id === selectedBook)?.name_kr;

    setCurrentBook(selectedBook);
    setCurrentChapter(Number(chapter));
    closeSelector();

    setTimeout(() => {
      showInfo(`${bookName} ${chapter}장으로 이동했어요.`);
    }, 50);
  }

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
            <View className="py-4 rounded-md items-center bg-primary-200/30">
              <Text
                size="lg"
                weight="medium"
                className="text-primary-700"
              >
                {item}
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