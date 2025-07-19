import { useCallback } from 'react';
import { VStack } from '#/components/ui/vstack';
import { BottomSheetListLayout } from '@/components/common/bottom-sheet';
import { Text } from '@/shared/components/text';
import type { useBottomSheet } from '@/hooks/useBottomSheet';
import { Icon } from '#/components/ui/icon';
import { Type } from 'lucide-react-native';
import { HStack } from '#/components/ui/hstack';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

import { useBibleStore } from '@/features/bible/store/bible';
import { MAX_BIBLE_FONT_SIZE, MIN_BIBLE_FONT_SIZE } from '../constants';

type Props = {
	BottomSheetContainer: ReturnType<
		typeof useBottomSheet
	>['BottomSheetContainer'];
	closeSetting: () => void;
};

export function BibleSetting({ BottomSheetContainer, closeSetting }: Props) {
	const { fontSize, setFontSize } = useBibleStore();

	const handleSetFontSize = useCallback(
		async (value: number) => {
			await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
			setFontSize(value);
		},
		[setFontSize],
	);

	return (
		<BottomSheetContainer>
			<BottomSheetListLayout>
				<VStack className="mt-12 mb-8">
					<HStack className="justify-between items-center">
						<HStack space="sm" className="items-center">
							<Icon as={Type} size="xl" />
							<Slider
								style={{ width: '80%', height: 32 }}
								lowerLimit={MIN_BIBLE_FONT_SIZE}
								upperLimit={MAX_BIBLE_FONT_SIZE}
								minimumValue={MIN_BIBLE_FONT_SIZE}
								maximumValue={MAX_BIBLE_FONT_SIZE}
								step={10}
								value={fontSize}
								tapToSeek
								thumbTintColor="#362303"
								minimumTrackTintColor="#362303"
								maximumTrackTintColor="#fef8ef"
								onValueChange={handleSetFontSize}
							/>
						</HStack>
						<Text size="lg">{fontSize}%</Text>
					</HStack>
				</VStack>
			</BottomSheetListLayout>
		</BottomSheetContainer>
	);
}
