import { VStack } from '#/components/ui/vstack';
import {
  BottomSheetListLayout,
  BottomSheetListHeader,
} from '@/components/common/bottom-sheet';
import { Text } from '@/shared/components/text';
import type { useBottomSheet } from '@/hooks/useBottomSheet';
import { Icon } from '#/components/ui/icon';
import { Type } from 'lucide-react-native';
import { HStack } from '#/components/ui/hstack';

type Props = {
  BottomSheetContainer: ReturnType<
    typeof useBottomSheet
  >['BottomSheetContainer'];
  closeSetting: () => void;
};

export function BibleSetting({
  BottomSheetContainer,
  closeSetting,
}: Props) {
  return (
    <BottomSheetContainer>
      <BottomSheetListLayout>
        <VStack className="mt-12 mb-8">
          <HStack className="justify-between items-center">
            <HStack space="sm" className="items-center">
              <Icon as={Type} size="xl" />
              <Text>글꼴 크기 slidebar 영역</Text>
            </HStack>
            <Text size="lg">100%</Text>
          </HStack>
        </VStack>
      </BottomSheetListLayout>
    </BottomSheetContainer>
  );
}
