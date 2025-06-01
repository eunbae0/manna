import { openProfile } from '@/shared/utils/router';
import { HStack } from '#/components/ui/hstack';
import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';
import { Box } from '#/components/ui/box';
import { Avatar } from '@/components/common/avatar';
import AnimatedPressable from '@/components/common/animated-pressable';
import type { GroupMember } from '@/api/group/types';

export function MemberListItem({
  member,
  ...props
}: {
  member: GroupMember;
} & Omit<React.ComponentProps<typeof AnimatedPressable>, 'children'>) {
  return (
    <AnimatedPressable {...props} scale="sm">
      <HStack className="items-center justify-between py-4">
        <HStack space="lg" className="items-center">
          <HStack space="md" className="items-center">
            <Avatar size="md" photoUrl={member.photoUrl ?? undefined} />
            <VStack className="gap-[2px]">
              <HStack space="sm" className="items-center">
                <Text size="md" className="font-pretendard-Medium">
                  {member.displayName ?? '이름없음'}
                </Text>
                <Box
                  className={
                    member.role === 'leader'
                      ? 'px-2 rounded-2xl py-[2px] bg-primary-50 border border-primary-200'
                      : 'px-2 rounded-2xl py-[2px] bg-background-100 border border-background-200'
                  }
                >
                  <Text size="2xs" className="text-typography-800">
                    {member.role === 'leader' ? '리더' : '그룹원'}
                  </Text>
                </Box>
              </HStack>

              <Text size="sm" className="text-typography-600">
                {member?.statusMessage ?? '상태메세지가 없어요.'}
              </Text>
            </VStack>
          </HStack>
        </HStack>
      </HStack>
    </AnimatedPressable>
  );
}
