import { VStack } from '#/components/ui/vstack';
import { BibleHomeHeader } from '../components/BibleHomeHeader';
import { BibleContent } from '../components/BibleContent';
import { useScrollDown } from '@/shared/hooks/useScrollDown';
import { BibleFloatingGuide } from '../components/BibleFloatingGuide';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { BibleSelector } from '../components/BibleSelector';
import { BibleSetting } from '../components/BibleSetting';

export default function BibleMainScreen() {
  // const bibleContentRef = useRef(null);

  // bibleContentRef.current?.scrollToIndex({
  //   index: 1,
  //   animated: true,
  // });

  const { isScrollDown, onScrollDown } = useScrollDown();

  const { BottomSheetContainer: BibleSelectorBottomSheetContainer, handleOpen: handleOpenBibleSelector, handleClose: handleCloseBibleSelector } = useBottomSheet()
  const { BottomSheetContainer: BibleSettingBottomSheetContainer, handleOpen: handleOpenBibleSetting, handleClose: handleCloseBibleSetting } = useBottomSheet()

  return (
    <VStack className="flex-1 h-full">
      <BibleHomeHeader
        isScrollDown={isScrollDown}
        handleOpenBibleSelector={handleOpenBibleSelector}
        handleOpenSetting={handleOpenBibleSetting}
      />
      <BibleContent onScrollDown={onScrollDown} />

      <BibleFloatingGuide isScrollDown={isScrollDown} handleOpenBibleSelector={handleOpenBibleSelector} />

      <BibleSelector
        BibleSelectorBottomSheetContainer={BibleSelectorBottomSheetContainer}
        closeSelector={handleCloseBibleSelector}
        mode="main"
      />

      <BibleSetting
        BottomSheetContainer={BibleSettingBottomSheetContainer}
        closeSetting={handleCloseBibleSetting}
      />
    </VStack>
  );
}
