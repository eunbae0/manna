import { View } from 'react-native';
import { HStack } from '#/components/ui/hstack';
import { Avatar } from '@/components/common/avatar';
import { formatRelativeTime } from '@/shared/utils/formatRelativeTime';
import { Eye, Heart, MessageCircle, ThumbsUp } from 'lucide-react-native';
import { Text } from '@/shared/components/text';
import { Icon } from '#/components/ui/icon';
import type { PostsFeed } from '../api/types';
import AnimatedPressable from '@/components/common/animated-pressable';
import { useGroup } from '@/features/group/hooks/useGroup';
import { VStack } from '#/components/ui/vstack';
import { useCallback, useMemo } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { getCategoryLabel } from '@/features/board/utils/getCategoryLabel';

export function PostFeedItem({ item }: { item: PostsFeed }) {
  const { group } = useGroup(item.identifier.groupId);
  const { updateCurrentGroup } = useAuthStore()

  const authorMember = useMemo(() => {
    return group?.members.find((member) => member.id === item.data.author.id)
  }, [group, item])

  const handlePress = useCallback(() => {
    updateCurrentGroup({ groupId: item.identifier.groupId });
    router.push(`/(app)/(board)/${item.identifier.id}`);
  }, [item, updateCurrentGroup]);

  return (
    <AnimatedPressable onPress={handlePress}>
      <View className="bg-white rounded-xl p-4">
        <HStack space="sm" className="items-center mb-2">
          <Avatar size="md" photoUrl={authorMember?.photoUrl || undefined} />
          <VStack className="gap-[2px] flex-1">
            <HStack space="sm" className="items-center">
              <Text size="lg" weight="semi-bold" className="text-typography-800">{authorMember?.displayName}</Text>
              <View className="bg-primary-200/50 px-2 py-1 rounded-full items-center">
                <Text size="xs" className='text-primary-600'>{group?.groupName}</Text>
              </View>
            </HStack>
            <HStack className="gap-[2px] items-center">
              <Text size="md" className="text-typography-500">
                {formatRelativeTime(item.metadata.timestamp)}
              </Text>
              <Text size="md" className="text-typography-400">•</Text>
              <Text size="md" className="text-typography-500">
                {getCategoryLabel(item.data.category)}
              </Text>
            </HStack>
          </VStack>
        </HStack>

        <Text size="xl" className="mt-2 text-typography-800">{item.data.content}</Text>

        <HStack className="mt-3 pt-2">
          <HStack space="xl" className="items-center">
            <AnimatedPressable onPress={() => { }}>
              <HStack space="xs" className="items-center">
                <Icon as={ThumbsUp} size="lg" className="text-typography-500" />
                <Text size="lg" className="text-typography-500">
                  {item.data.reactionSummary?.like || 0}
                </Text>
              </HStack>
            </AnimatedPressable>
            <AnimatedPressable onPress={() => { }}>
              <HStack space="xs" className="items-center">
                <Icon as={MessageCircle} size="lg" className="text-typography-500" />
                <Text size="lg" className="text-typography-500">
                  {item.data.commentCount || 0}
                </Text>
              </HStack>
            </AnimatedPressable>
            <HStack space="xs" className="items-center">
              <Icon as={Eye} size="lg" className="text-typography-500" />
              <Text size="lg" className="text-typography-500">
                {item.data.viewCount || 0}
              </Text>
            </HStack>
          </HStack>
        </HStack>
      </View>
    </AnimatedPressable>
  );
}
