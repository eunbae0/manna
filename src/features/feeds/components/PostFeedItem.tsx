import { View } from 'react-native';
import { HStack } from '#/components/ui/hstack';
import { Avatar } from '@/components/common/avatar';
import { formatRelativeTime } from '@/shared/utils/formatRelativeTime';
import { Eye, MessageCircle, ThumbsUp } from 'lucide-react-native';
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
import {
  useReactions,
  useReactionToggle,
} from '@/features/board/hooks';
import type {
  PostReactionMetadata,
  ReactionType,
} from '@/features/board/types';
import { useToastStore } from '@/store/toast';
import * as Haptics from 'expo-haptics';
import { useUpdatePostViewCount } from '../hooks/useUpdatePostViewCount';

export function PostFeedItem({ item }: { item: PostsFeed }) {
  const { user } = useAuthStore();
  const { group } = useGroup(item.identifier.groupId);
  const { updateCurrentGroup } = useAuthStore();
  const { showError } = useToastStore();
  const { updatePostViewCount } = useUpdatePostViewCount();

  const postId = item.identifier.id;

  const authorMember = useMemo(() => {
    return group?.members.find((member) => member.id === item.data.author.id);
  }, [group, item]);

  const handlePress = useCallback(() => {
    updateCurrentGroup({ groupId: item.identifier.groupId });
    router.push(`/(app)/(board)/${postId}`);
    updatePostViewCount(postId);
  }, [item, postId, updateCurrentGroup, updatePostViewCount]);

  const reactionMetadata: PostReactionMetadata = useMemo(() => {
    return {
      targetType: 'post',
      groupId: group?.id || '',
      postId: postId || '',
    };
  }, [group?.id, postId]);

  const { data: reactions } = useReactions(reactionMetadata);

  const reactionToggleMutation = useReactionToggle();

  const isLiked = reactions
    ? Object.values(reactions).some((reactions) =>
      reactions.some(
        (reaction) =>
          reaction.userId === user?.id && reaction.type === 'like',
      ),
    )
    : false;

  const handlePressLike = useCallback(() => {
    if (!user || !group?.id) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);

    reactionToggleMutation.mutate(
      {
        metadata: reactionMetadata,
        userId: user.id,
        reactionType: 'like' as ReactionType,
        currentLikeState: isLiked,
      },
      {
        onError: () => {
          showError('반응 남기기에 실패했어요.');
        },
      },
    );
  }, [user, group?.id, reactionMetadata, isLiked]);

  return (
    <AnimatedPressable onPress={handlePress}>
      <View className="bg-white rounded-xl p-4">
        <HStack space="sm" className="items-center mb-2">
          <Avatar size="md" photoUrl={authorMember?.photoUrl || undefined} />
          <VStack className="gap-[2px] flex-1">
            <HStack space="sm" className="items-center">
              <Text
                size="lg"
                weight="semi-bold"
                className="text-typography-800"
              >
                {authorMember?.displayName}
              </Text>
              <View className="bg-primary-200/50 px-2 py-1 rounded-full items-center">
                <Text size="xs" className="text-primary-600">
                  {group?.groupName}
                </Text>
              </View>
            </HStack>
            <HStack className="gap-[2px] items-center">
              <Text size="md" className="text-typography-500">
                {formatRelativeTime(item.metadata.timestamp)}
              </Text>
              <Text size="md" className="text-typography-400">
                •
              </Text>
              <Text size="md" className="text-typography-500">
                {getCategoryLabel(item.data.category)}
              </Text>
            </HStack>
          </VStack>
        </HStack>

        <Text size="xl" className="mt-2 text-typography-800">
          {item.data.content}
        </Text>

        <HStack className="mt-3 pt-2">
          <HStack space="xl" className="items-center">
            <AnimatedPressable onPress={handlePressLike}>
              <HStack space="xs" className="items-center">
                <Icon
                  as={ThumbsUp}
                  size="lg"
                  className={
                    isLiked ? 'text-primary-500' : 'text-typography-500'
                  }
                  fill={isLiked ? '#362303' : ''}
                />
                <Text size="lg" className="text-typography-500">
                  {item.data.reactionSummary?.like || 0}
                </Text>
              </HStack>
            </AnimatedPressable>
            <AnimatedPressable onPress={handlePress}>
              <HStack space="xs" className="items-center">
                <Icon
                  as={MessageCircle}
                  size="lg"
                  className="text-typography-500"
                />
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
