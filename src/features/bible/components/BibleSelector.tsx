import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/shared/components/text';
import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import { BottomSheetListHeader } from '@/components/common/bottom-sheet';
import { Button, ButtonIcon } from '@/components/common/button';
import { CaseUpper, ChevronLeft, ListCollapse } from 'lucide-react-native';
import { useBibleStore } from '../store/bible';
import type { useBottomSheet } from '@/hooks/useBottomSheet';
import type { BookIndex } from '../types';
import { SegmentedControl, SegmentedControlTrigger } from '@/shared/components/segmented-control';
import { BibleSelectorBookList } from './BibleSelectorBookList';
import { BibleSelectorChapterList } from './BibleSelectorChapterList';
import { getChoseong } from 'es-hangul';

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
  const { bookIndex, currentBookId } = useBibleStore();

  const [listType, setListType] = useState<'Group' | 'Alphabet'>('Group');

  const handlePressListType = (type: 'Group' | 'Alphabet') => {
    setListType(type);
  };

  const bookList = useMemo(() => getBookList(bookIndex, listType), [bookIndex, listType]);

  const currentBookType = useMemo(() => {
    const book = bookIndex.find((book) => book.id === currentBookId);
    return book?.type || 'OT';
  }, [bookIndex, currentBookId]);

  const [currentType, setCurrentType] = useState<'OT' | 'NT'>(currentBookType);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [step, setStep] = useState<'book' | 'chapter'>('book');


  const handlePressListItem = (bookId: string) => {
    setSelectedBook(bookId);
    setStep('chapter');
  };

  const selectedBookName = useMemo(() => {
    const book = bookIndex.find((book) => book.id === selectedBook);
    return book?.name_kr || '';
  }, [bookIndex, selectedBook]);

  return (
    <BibleSelectorBottomSheetContainer
      snapPoints={['80%']}
      enableDynamicSizing={false}
    >
      <VStack space="md" className="flex-1 justify-between pt-1 pb-2">
        <VStack space="xl" className="flex-1">
          <VStack space="sm">
            <View className='px-5'>
              <BottomSheetListHeader
                label={step === 'book' ? "성경을 선택해주세요" : "장을 선택해주세요"}
                onPress={closeSelector}
              />
            </View>

            {step === 'book' && <HStack space="xs" className='pl-5 pr-3'>
              <SegmentedControl
                defaultValue="OT"
                onValueChange={(value) => setCurrentType(value as 'OT' | 'NT')}
                className='flex-1'
              >
                <SegmentedControlTrigger value="OT" label="구약" withHaptic />
                <SegmentedControlTrigger value="NT" label="신약" withHaptic />
              </SegmentedControl>

              {listType === 'Group' && <Button
                size="md"
                variant='icon'
                onPress={() => handlePressListType('Alphabet')}
                withHaptic
              >
                <ButtonIcon as={CaseUpper} />
              </Button>}
              {listType === 'Alphabet' && <Button
                size="md"
                variant='icon'
                onPress={() => handlePressListType('Group')}
                withHaptic
              >
                <ButtonIcon as={ListCollapse} />
              </Button>}
            </HStack>
            }
            {step === 'chapter' && (
              <HStack className='items-center pl-2'>
                <Button size="lg" variant='icon' onPress={() => setStep('book')}>
                  <ButtonIcon as={ChevronLeft} className='text-primary-800' />
                </Button>
                <Text size="xl" weight="semi-bold" className="text-typography-800">{selectedBookName}</Text>
              </HStack>
            )}
          </VStack>

          {step === 'book' && (
            <BibleSelectorBookList
              data={bookList[currentType]}
              handlePressListItem={handlePressListItem}
            />
          )}
          {step === 'chapter' && (
            <BibleSelectorChapterList
              selectedBook={selectedBook}
              closeSelector={() => {
                setStep('book');
                setSelectedBook(null);
                closeSelector();
              }}
            />
          )}
        </VStack>
      </VStack>
    </BibleSelectorBottomSheetContainer>
  );
}


const 가나다 = ['가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하']

function getBookList(bookIndex: BookIndex, listType: 'Group' | 'Alphabet') {
  const OT = bookIndex.filter((book) => book.type === 'OT');
  const NT = bookIndex.filter((book) => book.type === 'NT');

  if (listType === 'Alphabet') {
    return {
      OT: 가나다.map((alphabet) => ({
        label: alphabet,
        books: OT.filter((book) => getChoseong(book.name_kr).startsWith(getChoseong(alphabet))),
      })).filter((item) => item.books.length > 0),
      NT: 가나다.map((alphabet) => ({
        label: alphabet,
        books: NT.filter((book) => getChoseong(book.name_kr).startsWith(getChoseong(alphabet))),
      })).filter((item) => item.books.length > 0),
    }
  }

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
}
