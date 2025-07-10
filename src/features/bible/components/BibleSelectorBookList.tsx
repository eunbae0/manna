import { VStack } from '#/components/ui/vstack';
import AnimatedPressable from '@/components/common/animated-pressable';
import { cn } from '@/shared/utils/cn';
import { View } from 'react-native';
import { Text } from '@/shared/components/text';
import type { BookIndexData } from '../types';
import { useBibleStore } from '../store/bible';
import { FlatList } from 'react-native-gesture-handler';

export function BibleSelectorBookList({
  data,
  handlePressListItem,
}: {
  data: {
    label: string;
    books: BookIndexData[];
  }[];
  handlePressListItem: (bookId: string) => void;
}) {
  const { currentBookId } = useBibleStore();

  return (
    <FlatList
      className='px-5'
      data={data}
      renderItem={({ item }) => (
        <VStack space="sm" className="mb-3">
          <Text size="lg" weight="medium" className="text-typography-600">
            {item.label}
          </Text>
          <FlatList
            data={item.books}
            renderItem={({ item: book, index }) => {
              const shouldAddSpacer =
                item.books.length === index + 1 && item.books.length % 3 !== 0;
              const spacerCount = 3 - (item.books.length % 3);
              return (
                <>
                  <AnimatedPressable
                    key={book.id}
                    onPress={() => handlePressListItem(book.id)}
                    className="flex-1 mb-2"
                    withHaptic
                  >
                    <View
                      className={cn(
                        'py-4 rounded-md items-center',
                        book.id === currentBookId
                          ? 'bg-primary-500'
                          : 'bg-primary-200/25',
                      )}
                    >
                      <Text
                        size="lg"
                        weight="bold"
                        className={cn(
                          book.id === currentBookId
                            ? 'text-primary-50'
                            : 'text-primary-700/80',
                        )}
                      >
                        {book.name_kr}
                      </Text>
                    </View>
                  </AnimatedPressable>
                  {shouldAddSpacer &&
                    Array(spacerCount)
                      .fill(0)
                      .map((_, i) => (
                        <View
                          key={`spacer-${book.id}-${i}`}
                          className="flex-1"
                        />
                      ))}
                </>
              );
            }}
            keyExtractor={(item) => item.id}
            numColumns={3}
            columnWrapperStyle={{ gap: 8 }}
            showsVerticalScrollIndicator={false}
          />
        </VStack>
      )}
      keyExtractor={(item) => item.label}
      showsVerticalScrollIndicator={false}
    />
  );
}
