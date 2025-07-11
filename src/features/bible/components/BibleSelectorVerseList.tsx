import { FlatList } from 'react-native-gesture-handler';
import { useBibleStore } from '../store/bible';
import { VStack } from '#/components/ui/vstack';
import AnimatedPressable from '@/components/common/animated-pressable';
import { View } from 'react-native';
import { Text } from '@/shared/components/text';
import { cn } from '@/shared/utils/cn';

export function BibleSelectorVerseList({
  handlePressListItem,
}: {
  handlePressListItem: (verse: number) => void;
}) {
  const { verses, selectedVerses } = useBibleStore();

  const data = Array.from(
    {
      length:
        verses?.length || 0,
    },
    (_, i) => i + 1,
  );


  return (
    <FlatList
      className='px-5'
      data={data}
      renderItem={({ item }) => {
        const isSelected = selectedVerses.includes(item);
        return (
          <VStack space="sm" className="mb-1 flex-1">
            <AnimatedPressable
              onPress={() => {
                handlePressListItem(item);
              }}
              className="mb-2"
              withHaptic
            >
              <View className={cn("py-4 rounded-md items-center bg-primary-200/25", isSelected ? "bg-primary-500" : "")}>
                <Text
                  size="lg"
                  weight="bold"
                  className={cn(isSelected ? "text-primary-50" : "text-primary-700/80")}
                >
                  {item}절
                </Text>
              </View>
            </AnimatedPressable>
          </VStack>
        )
      }}
      keyExtractor={(item) => item.toString()}
      numColumns={3}
      columnWrapperStyle={{ gap: 8 }}
      style={{ height: '70%' }}
    />
  )
}