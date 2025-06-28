import { VStack } from '#/components/ui/vstack';
import AnimatedPressable from '@/components/common/animated-pressable';
import {
  BottomSheetListLayout,
  BottomSheetListHeader,
} from '@/components/common/bottom-sheet';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { cn } from '@/shared/utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useBibleStore } from '../store/bible';
import { Text } from '@/shared/components/text';
import type { useBottomSheet } from '@/hooks/useBottomSheet';

type Props = {
  BibleSelectorBottomSheetContainer: ReturnType<
    typeof useBottomSheet
  >['BottomSheetContainer'];
  closeSelector: () => void;
};

export function BibleSelector({
  BibleSelectorBottomSheetContainer,
  closeSelector,
}: Props) {
  const { bookIndex, currentBookId, setCurrentBook, setCurrentChapter } =
    useBibleStore();

  const richBookIndex = useMemo(() => {
    const OT = bookIndex.filter((book) => book.type === 'OT');
    const NT = bookIndex.filter((book) => book.type === 'NT');
    return {
      OT: [
        {
          label: '모세오경',
          books: OT.filter((book) => book.group_kr === '모세오경'),
        },
        {
          label: '역사서',
          books: OT.filter((book) => book.group_kr === '역사서'),
        },
        {
          label: '시가서',
          books: OT.filter((book) => book.group_kr === '시가서'),
        },
        {
          label: '대선지서',
          books: OT.filter((book) => book.group_kr === '대선지서'),
        },
        {
          label: '소선지서',
          books: OT.filter((book) => book.group_kr === '소선지서'),
        },
      ],
      NT: [
        {
          label: '복음서',
          books: NT.filter((book) => book.group_kr === '복음서'),
        },
        {
          label: '역사서',
          books: NT.filter((book) => book.group_kr === '역사서'),
        },
        {
          label: '바울서신',
          books: NT.filter((book) => book.group_kr === '바울서신'),
        },
        {
          label: '일반서신',
          books: NT.filter((book) => book.group_kr === '일반서신'),
        },
        {
          label: '예언서',
          books: NT.filter((book) => book.group_kr === '예언서'),
        },
      ],
    };
  }, [bookIndex]);

  const currentBookType = useMemo(() => {
    const book = bookIndex.find((book) => book.id === currentBookId);
    return book?.type || 'OT';
  }, [bookIndex, currentBookId]);

  const [currentType, setCurrentType] = useState<'OT' | 'NT'>(currentBookType);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [step, setStep] = useState<'book' | 'chapter'>('book');

  const handleSetCurrentType = (type: 'OT' | 'NT') => {
    setCurrentType(type);
  };

  const label = useMemo(() => {
    if (currentType === 'OT') {
      return '신약 보기';
    }
    return '구약 보기';
  }, [currentType]);

  return (
    <BibleSelectorBottomSheetContainer
      snapPoints={['70%']}
      enableDynamicSizing={false}
    >
      <BottomSheetListLayout>
        <BottomSheetListHeader
          label="성경을 선택해주세요"
          onPress={closeSelector}
        />
        {step === 'book' ? (
          <FlatList
            data={richBookIndex[currentType]}
            renderItem={({ item }) => (
              <VStack space="sm" className="mb-3">
                <Text size="lg" weight="medium" className="text-typography-600">
                  {item.label}
                </Text>
                <FlatList
                  data={item.books}
                  renderItem={({ item: book, index }) => {
                    const shouldAddSpacer =
                      item.books.length === index + 1 &&
                      item.books.length % 3 !== 0;
                    const spacerCount = 3 - (item.books.length % 3);
                    return (
                      <>
                        <AnimatedPressable
                          key={book.id}
                          onPress={() => {
                            setSelectedBook(book.id);
                            setStep('chapter');
                          }}
                          className="flex-1 mb-2"
                        >
                          <View
                            className={cn(
                              'py-4 rounded-md items-center border',
                              book.id === currentBookId
                                ? 'bg-primary-500/80 border-primary-500'
                                : 'bg-primary-200/30 border-primary-200/30',
                            )}
                          >
                            <Text
                              size="lg"
                              weight="medium"
                              className={cn(
                                book.id === currentBookId
                                  ? 'text-primary-50'
                                  : 'text-primary-700',
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
            style={{ height: '80%' }}
          />
        ) : (
          <FlatList
            data={Array.from(
              {
                length:
                  bookIndex.find((book) => book.id === selectedBook)
                    ?.chapters_count || 0,
              },
              (_, i) => i + 1,
            )}
            renderItem={({ item }) => (
              <VStack space="sm" className="mb-1">
                <AnimatedPressable
                  onPress={() => {
                    setCurrentBook(selectedBook);
                    setCurrentChapter(Number(item));
                    closeSelector();
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
            keyExtractor={(item) => `${item.toString()}#${selectedBook}`}
            // numColumns={3}
            // columnWrapperStyle={{ gap: 8 }}
            style={{ height: '80%' }}
          />
        )}
      </BottomSheetListLayout>
      {step === 'book' ? (
        <Button
          size="lg"
          onPress={() =>
            handleSetCurrentType(currentType === 'OT' ? 'NT' : 'OT')
          }
          rounded={false}
          className="mx-4"
        >
          {currentType === 'NT' ? <ButtonIcon as={ChevronLeft} /> : null}
          <ButtonText>{label}</ButtonText>
          {currentType === 'OT' ? <ButtonIcon as={ChevronRight} /> : null}
        </Button>
      ) : (
        <Button
          size="lg"
          onPress={() => setStep('book')}
          rounded={false}
          className="mx-4"
        >
          <ButtonIcon as={ChevronLeft} />
          <ButtonText>다시 성경 선택하기</ButtonText>
        </Button>
      )}
    </BibleSelectorBottomSheetContainer>
  );
}
