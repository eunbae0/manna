import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { HStack } from '#/components/ui/hstack';
import { Avatar } from '@/components/common/avatar';
import { formatRelativeTime } from '@/shared/utils/formatRelativeTime';
import { Heart } from 'lucide-react-native';
import { Text } from '@/shared/components/text';
import { Icon } from '#/components/ui/icon';
import type { PrayerRequestsFeed } from '../api/types';
import AnimatedPressable from '@/components/common/animated-pressable';
import { VStack } from '#/components/ui/vstack';
import { useGroup } from '@/features/group/hooks/useGroup';
import { useAuthStore } from '@/store/auth';
import Animated, { runOnJS, useAnimatedStyle } from 'react-native-reanimated';
import { usePrayerRequestToggleLike } from '@/features/prayer-request/hooks/usePrayerRequests';
import { useLikeAnimation } from '@/shared/hooks/animation/useLikeAnimation';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';


export function PrayerRequestFeedItem({ item }: { item: PrayerRequestsFeed }) {
  const { group } = useGroup(item.identifier.groupId);
  const { user } = useAuthStore()

  const authorMember = useMemo(() => {
    return group?.members.find((member) => member.id === item.data.member.id)
  }, [group, item])

  const hasLiked = item.data.reactions?.some(
    (reaction) => reaction.type === 'LIKE' && reaction.member.id === user?.id,
  );

  const { heartScale, heartTranslateY, performLikeAnimation } = useLikeAnimation(hasLiked);

  const { toggleLike } = usePrayerRequestToggleLike({
    userId: user?.id || '',
    prayerRequestId: item.identifier.id,
    groupId: item.identifier.groupId,
    performLikeAnimation,
  })

  const doubleTap = Gesture.Tap()
    .maxDuration(250)
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(toggleLike)();
    });

  return (
    <GestureDetector gesture={doubleTap}>
      <AnimatedPressable scale="sm">
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
                  기도 제목
                </Text>
              </HStack>
            </VStack>
          </HStack>

          <Text size="xl" className="mt-2 text-typography-800">{item.data.value}</Text>

          <HStack className="mt-3 pt-2">
            <HStack space="xl" className="items-center">
              <AnimatedPressable onPress={() => toggleLike()}>
                <HStack space="xs" className="items-center">
                  <Animated.View
                    style={useAnimatedStyle(() => ({
                      transform: [
                        { scale: heartScale.value },
                        { translateY: heartTranslateY.value },
                      ],
                    }))}
                  >
                    <Icon
                      size="lg"
                      as={Heart}
                      fill={hasLiked ? '#362303' : undefined}
                      className={
                        hasLiked
                          ? 'text-primary-500'
                          : 'text-typography-500'
                      }
                    />
                  </Animated.View>
                  <Text size="lg" className="text-typography-500">
                    {item.data.reactions?.length || 0}
                  </Text>
                </HStack>
              </AnimatedPressable>
            </HStack>
          </HStack>
        </View>
      </AnimatedPressable>
    </GestureDetector>
  );
}
