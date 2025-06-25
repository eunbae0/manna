import { VStack } from '#/components/ui/vstack';
import { BibleHomeHeader } from '../components/BibleHomeHeader';
import { BibleContent } from '../components/BibleContent';
import { BibleSearch } from '../components/BibleSearch';
import { useState, useEffect, useRef } from 'react';
import { useBibleStore } from '../store/bible';
import { useInitializeBible } from '../hooks/useInitializeBible';

export default function BibleMainScreen() {
  const [showSearch, setShowSearch] = useState(false);
  const { setCurrentBook, setCurrentChapter } = useBibleStore();

  const bibleContentRef = useRef(null);

  useInitializeBible();

  const handleToggleSearch = () => {
    setShowSearch(!showSearch);
  };

  const handleSearchResultPress = (result: {
    bookId: string;
    chapter: number;
    verse: number;
  }) => {
    setCurrentBook(result.bookId);
    setCurrentChapter(result.chapter);
    // Note: The verse will be highlighted by the BibleContent component
    setShowSearch(false);
  };

  // bibleContentRef.current?.scrollToIndex({
  //   index: 1,
  //   animated: true,
  // });

  return (
    <VStack className="flex-1">
      <BibleHomeHeader
        showSearch={showSearch}
        onToggleSearch={handleToggleSearch}
      />

      {showSearch ? (
        <BibleSearch onResultPress={handleSearchResultPress} />
      ) : (
        <BibleContent />
      )}
    </VStack>
  );
}
