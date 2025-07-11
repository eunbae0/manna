import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/shared/components/text';
import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import { BottomSheetListHeader } from '@/components/common/bottom-sheet';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { CaseUpper, ChevronLeft, ListCollapse, Plus, RotateCcw } from 'lucide-react-native';
import { useBibleStore } from '../store/bible';
import type { useBottomSheet } from '@/hooks/useBottomSheet';
import type { BookIndex, BookIndexData } from '../types';
import { SegmentedControl, SegmentedControlTrigger } from '@/shared/components/segmented-control';
import { BibleSelectorBookList } from './BibleSelectorBookList';
import { BibleSelectorChapterList } from './BibleSelectorChapterList';
import { getChoseong } from 'es-hangul';
import { useToastStore } from '@/store/toast';
import { BibleSelectorVerseList } from './BibleSelectorVerseList';
import { formatSelectedVerses } from '../utils';
import { formatToSelectedBible } from '../utils/selectedBible';
import type { SelectedBible } from '../types/selectedBible';

type Props = {
  BibleSelectorBottomSheetContainer: ReturnType<
    typeof useBottomSheet
  >['BottomSheetContainer'];
  closeSelector: () => void;
  mode: 'main' | 'select'
  setSelectedBible?: (selectedBible: SelectedBible) => void;
};

export function BibleSelector({
  BibleSelectorBottomSheetContainer,
  closeSelector,
  mode,
  setSelectedBible,
}: Props) {
  const { bookIndex, currentBookId, setCurrentBook, setCurrentChapter, currentChapter, selectedVerses, verses, addSelectedVerses, removeSelectedVerses, clearSelectedVerses } = useBibleStore();
  const { showInfo } = useToastStore()

  const isSelectMode = mode === 'select';

  useEffect(() => {
    if (isSelectMode) {
      clearSelectedVerses();
    }
  }, [isSelectMode, clearSelectedVerses])

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
  const [step, setStep] = useState<'book' | 'chapter' | 'verse'>('book');

  const handlePressBookListItem = useCallback((bookId: string) => {
    setSelectedBook(bookId);
    setStep('chapter');
  }, []);

  const selectedBookName = useMemo(() => {
    const book = bookIndex.find((book) => book.id === selectedBook);
    return book?.name_kr || '';
  }, [bookIndex, selectedBook]);

  const headerLabel = useMemo(() => {
    switch (step) {
      case 'book':
        return '성경을 선택해주세요';
      case 'chapter':
        return '장을 선택해주세요';
      case 'verse':
        return '절을 선택해주세요';
    }
  }, [step]);

  const clearSelectorState = useCallback(() => {
    clearSelectedVerses();
    setSelectedBook(null);
    setCurrentChapter(1);
    setCurrentType('OT');
    setStep('book');
    setListType('Group');
    closeSelector();
  }, [closeSelector, clearSelectedVerses, setCurrentChapter]);

  const handlePressChapterListItem = useCallback((chapter: number) => {
    if (!selectedBook) {
      closeSelector();
      return;
    }

    if (isSelectMode) {
      setCurrentChapter(Number(chapter));
      setStep('verse');
      return;
    }

    setCurrentBook(selectedBook);
    setCurrentChapter(Number(chapter));
    closeSelector();

    const bookName = bookIndex.find((book) => book.id === selectedBook)?.name_kr;

    setTimeout(() => {
      showInfo(`${bookName} ${chapter}장으로 이동했어요.`);
    }, 50);
  }, [bookIndex, isSelectMode, selectedBook, closeSelector, setCurrentBook, setCurrentChapter, showInfo]);


  const handlePressVerseListItem = useCallback((verse: number) => {
    if (!selectedBook || !currentChapter) {
      closeSelector();
      return;
    }
    if (selectedVerses.includes(verse)) {
      removeSelectedVerses(Number(verse));
      return;
    }
    addSelectedVerses(Number(verse));
  }, [selectedBook, currentChapter, closeSelector, selectedVerses, addSelectedVerses, removeSelectedVerses]);

  const handlePressAddVerses = useCallback(() => {
    if (!selectedVerses.length) {
      showInfo('절을 선택해주세요');
      return;
    }

    if (!selectedBook || !currentChapter) {
      closeSelector();
      return;
    }
    const bookName = bookIndex.find((book) => book.id === selectedBook)?.name_kr || '';

    const formattedBible = formatToSelectedBible({
      bookName,
      bookId: selectedBook,
      chapter: currentChapter,
      verses,
      selectedVerses,
    });

    setSelectedBible?.(formattedBible)

    clearSelectorState();

    setTimeout(() => {
      showInfo(`${formattedBible.title}을 추가했어요.`);
    }, 50);
  }, [bookIndex, selectedBook, currentChapter, closeSelector, selectedVerses, verses, showInfo, clearSelectorState, setSelectedBible]);

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
                label={headerLabel}
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
            {step === 'verse' && (
              <HStack className='items-center pl-2 pr-4 justify-between'>
                <HStack className='items-center'>
                  <Button size="lg" variant='icon' onPress={() => setStep('chapter')}>
                    <ButtonIcon as={ChevronLeft} className='text-primary-800' />
                  </Button>
                  <Text size="xl" weight="semi-bold" className="text-typography-800">{selectedBookName} {currentChapter}장 {formatSelectedVerses(selectedVerses)}</Text>
                </HStack>
                {selectedVerses.length > 0 && <Button size="md" variant='icon' onPress={clearSelectedVerses} withHaptic>
                  <ButtonIcon as={RotateCcw} className='text-primary-800' />
                </Button>}
              </HStack>
            )}
          </VStack>

          {step === 'book' && (
            <BibleSelectorBookList
              data={bookList[currentType]}
              isSelectMode={isSelectMode}
              handlePressListItem={handlePressBookListItem}
            />
          )}
          {step === 'chapter' && (
            <BibleSelectorChapterList
              selectedBook={selectedBook}
              handlePressListItem={handlePressChapterListItem}
            />
          )}
          {step === 'verse' && (
            <BibleSelectorVerseList
              handlePressListItem={handlePressVerseListItem}
            />
          )}
        </VStack>

        {step === 'verse' && (
          <Button
            size="lg"
            onPress={handlePressAddVerses}
            withHaptic
            rounded={false}
            className='mb-2 mx-5'
          >
            <ButtonText>추가하기</ButtonText>
            <ButtonIcon as={Plus} />
          </Button>
        )}
      </VStack>
    </BibleSelectorBottomSheetContainer>
  );
}


const 가나다 = ['가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하']

function getBookList(bookIndex: BookIndex, listType: 'Group' | 'Alphabet') {
  const OT = bookIndex.filter((book) => book.type === 'OT');
  const NT = bookIndex.filter((book) => book.type === 'NT');

  const filterByAlphabet = (book: BookIndexData[], alphabet: string) => {
    return book
      .filter((book) => getChoseong(book.name_kr).startsWith(getChoseong(alphabet)))
      .sort((a, b) => a.name_kr.localeCompare(b.name_kr, 'ko-KR'))
  }

  if (listType === 'Alphabet') {
    return {
      OT: 가나다.map((alphabet) => ({
        label: alphabet,
        books: filterByAlphabet(OT, alphabet)
      })).filter((item) => item.books.length > 0),
      NT: 가나다.map((alphabet) => ({
        label: alphabet,
        books: filterByAlphabet(NT, alphabet)
      })).filter((item) => item.books.length > 0)
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
