import { VStack } from '#/components/ui/vstack';
import { BibleHomeHeader } from '../components/BibleHomeHeader';
import { BibleContent } from '../components/BibleContent';
import { BibleSearch } from './BibleSearchScreen';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useBibleStore } from '../store/bible';
import { useInitializeBible } from '../hooks/useInitializeBible';
import { useScrollDown } from '@/shared/hooks/useScrollDown';
import { BibleFloatingGuide } from '../components/BibleFloatingGuide';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { BibleSelector } from '../components/BibleSelector';

export default function BibleMainScreen() {
  const bibleContentRef = useRef(null);

  useInitializeBible();

  // bibleContentRef.current?.scrollToIndex({
  //   index: 1,
  //   animated: true,
  // });

  const { isScrollDown, onScrollDown } = useScrollDown();

  const { BottomSheetContainer: BibleSelectorBottomSheetContainer, handleOpen: handleOpenBibleSelector, handleClose: handleCloseBibleSelector } = useBottomSheet()

  return (
    <VStack className="flex-1 h-full">
      <BibleHomeHeader
        isScrollDown={isScrollDown}
        handleOpenBibleSelector={handleOpenBibleSelector}
      />
      <BibleContent onScrollDown={onScrollDown} />

      <BibleFloatingGuide isScrollDown={isScrollDown} handleOpenBibleSelector={handleOpenBibleSelector} />

      <BibleSelector
        BibleSelectorBottomSheetContainer={BibleSelectorBottomSheetContainer}
        closeSelector={handleCloseBibleSelector}
      />
    </VStack>
  );
}
