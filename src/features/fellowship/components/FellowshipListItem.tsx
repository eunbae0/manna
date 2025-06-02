import type { ClientFellowshipParticipantV2, ClientFellowshipV2 } from '@/features/fellowship/api/types';
import AnimatedPressable from '@/components/common/animated-pressable';
import { Box } from '#/components/ui/box';
import { Text } from '@/shared/components/text';
import { shadowStyle } from '@/shared/styles/shadow';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Avatar } from '@/components/common/avatar';
import { Icon } from '#/components/ui/icon';
import { ChevronRight } from 'lucide-react-native';
import { useMemo } from 'react';
import { formatLocalDate } from '@/shared/utils/date';

type Props = {
  item: ClientFellowshipV2;
  showOnlyLeader?: boolean;
  onPress?: (id: string) => void;
  showDate?: boolean;
}

export default function FellowshipListItem({ item, showOnlyLeader, onPress, showDate = true }: Props) {
  const findLeader = useMemo(
    () => (
      members: ClientFellowshipParticipantV2[],
      leaderId: string,
    ) => {
      return members.find((member) => member.id === leaderId);
    },
    [],
  );
  const leader = findLeader(item.info.participants, item.roles.leaderId);

  return (
    <AnimatedPressable
      onPress={() => onPress?.(item.identifiers.id)}
      className="mb-4 mx-4"
    >
      <Box
        style={shadowStyle.shadow}
        className="border bg-gray-100 border-gray-200 rounded-2xl px-4 py-3"
      >
        {/* 상단 영역: 날짜와 나눔장 정보 */}
        <HStack className="justify-between items-center">
          <VStack space="sm">
            <Text size="xl" className="font-pretendard-semi-bold">
              {item.info.title}
            </Text>
            <HStack space="md" className="items-center">
              {showDate && <Text size="md" className="text-typography-400">
                {formatLocalDate(item.info.date)}
              </Text>}
              {showOnlyLeader && leader ? (
                <HStack space="xs" className="items-center">
                  <Avatar size="2xs" photoUrl={leader.photoUrl || ''} />
                  <Text
                    size="sm"
                    className="text-typography-500 font-pretendard-semi-bold"
                  >
                    {leader.displayName}
                  </Text>
                </HStack>
              ) : (
                <HStack className="items-center gap-[1px]">
                  {item.info.participants.map((member) => (
                    <Avatar
                      key={member.id}
                      photoUrl={member.photoUrl || ''}
                      size="2xs"
                    />
                  ))}
                </HStack>
              )}
            </HStack>
          </VStack>
          <Icon as={ChevronRight} className="color-typography-400" />
        </HStack>
      </Box>
    </AnimatedPressable>
  )
}