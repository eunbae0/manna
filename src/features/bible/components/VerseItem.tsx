import { HStack } from '#/components/ui/hstack';
import AnimatedPressable from '@/components/common/animated-pressable';
import { cn } from '@/shared/utils/cn';
import { memo, useEffect, useMemo } from 'react';
import {
  useSharedValue,
  withTiming,
  withSequence,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { useBibleStore } from '../store/bible';
import { getTextSizeByFontSize } from '../utils';
import { Text } from '@/shared/components/text';
import type { ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

export type VerseItem = {
  verse: number;
  text: string;
};

const CURRENT_VERSE_BACKGROUND_COLOR = 'rgba(250 ,240 ,217, 1)';
const CURRENT_VERSE_BACKGROUND_COLOR_END = 'rgba(250 ,240 ,217, 0)';


export const VerseItem = memo(({ item, handleOpenSheet, handleCloseSheet }: { item: VerseItem, handleOpenSheet: () => void, handleCloseSheet: () => void }) => {
  const { currentVerse, fontSize, selectedVerses, addSelectedVerses, removeSelectedVerses } = useBibleStore();

  const isCurrent = currentVerse === item.verse;

  const scale = useSharedValue(1);
  const backgroundColor = useSharedValue(CURRENT_VERSE_BACKGROUND_COLOR_END);

  // Handle the animation sequence when isCurrent changes
  useEffect(() => {
    const scaleSequence = [
      withTiming(1.01, { duration: 150, easing: Easing.inOut(Easing.ease) }),
      withTiming(1, { duration: 150, easing: Easing.inOut(Easing.ease) }),
      withTiming(1.01, { duration: 150, easing: Easing.inOut(Easing.ease) }),
      withTiming(1, { duration: 150, easing: Easing.inOut(Easing.ease) }),
    ];

    if (isCurrent) {
      // Start scale animation
      scale.value = withSequence(...scaleSequence);

      // Start background color animation
      backgroundColor.value = withSequence(
        withTiming(CURRENT_VERSE_BACKGROUND_COLOR, {
          duration: 300,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(CURRENT_VERSE_BACKGROUND_COLOR, { duration: 1200 }),
        withTiming(CURRENT_VERSE_BACKGROUND_COLOR_END, {
          duration: 500,
          easing: Easing.inOut(Easing.ease),
        }),
      );
    } else {
      scale.value = withTiming(1, { duration: 150 });
      backgroundColor.value = CURRENT_VERSE_BACKGROUND_COLOR_END;
    }
  }, [isCurrent, scale, backgroundColor]);

  const animatedStyle = useAnimatedStyle<ViewStyle>(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: backgroundColor.value,
  }));

  const textSize = useMemo(() => {
    return getTextSizeByFontSize(fontSize);
  }, [fontSize]);

  const isSelected = useMemo(() => selectedVerses.includes(item.verse), [selectedVerses, item.verse]);

  const handlePressVerse = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    if (isSelected) {
      if (selectedVerses.length === 1) {
        handleCloseSheet();
      }
      removeSelectedVerses(item.verse);
      return;
    }
    addSelectedVerses(item.verse);
    if (selectedVerses.length === 0) {
      handleOpenSheet();
    }
  }

  return (
    <AnimatedPressable
      scale="sm"
      pressableClassName={cn("px-4 py-3", isSelected ? "bg-background-200/80" : "")}
      containerStyle={animatedStyle}
      onPress={handlePressVerse}
    >
      <HStack space="md" className="items-start">
        <Text className="text-primary-500" weight="medium" size={textSize}>
          {item.verse}
        </Text>
        <Text
          className={cn(
            isCurrent ? 'text-typography-950' : 'text-typography-800',
            'flex-1',
          )}
          size={textSize}
          selectable
        >
          {item.text}
        </Text>
      </HStack>
    </AnimatedPressable>
  );
});
