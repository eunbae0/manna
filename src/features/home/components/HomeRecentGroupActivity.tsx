import { VStack } from '#/components/ui/vstack';
import { FlashList } from '@shopify/flash-list';
import { View } from 'react-native';
import Heading from '@/shared/components/heading';
import Divider from '@/shared/components/divider';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import type {
  Feed,
  FellowshipFeed,
  PostsFeed,
  PrayerRequestsFeed,
} from '@/features/feeds/api/types';
import { router } from 'expo-router';
import { FellowshipFeedItem } from '@/features/feeds/components/FellowshipFeedItem';
import { PostFeedItem } from '@/features/feeds/components/PostFeedItem';
import { PrayerRequestFeedItem } from '@/features/feeds/components/PrayerRequestFeedItem';
import { useInfiniteUserFeeds } from '@/features/feeds/hooks/useFeeds';
import { Text } from '@/shared/components/text';
import { useCallback } from 'react';
import { ChevronRight } from 'lucide-react-native';

export function HomeRecentGroupActivity() {
  const handlePressMore = useCallback(() => {
    router.push('/(app)/(tabs)/feeds');
  }, []);
  return (
    <VStack space="sm" className="w-full">
      <Heading size="2xl" className="px-5">
        최근 소그룹 활동
      </Heading>
      <View className="w-full px-2">
        <HomeRecentGroupActivityList />
      </View>
      <Divider className="my-1" />
      <Button variant="text" size="lg" fullWidth onPress={handlePressMore}>
        <ButtonText>피드 더보기</ButtonText>
        <ButtonIcon as={ChevronRight} size="lg" />
      </Button>
    </VStack>
  );
}

function HomeRecentGroupActivityList() {
  const { data, isLoading, error } = useInfiniteUserFeeds();
  const feeds = data?.pages.flatMap((page) => page.feeds);
  const slicedFeeds = feeds?.slice(0, 3);

  if (isLoading) {
    // return <HomeRecentGroupActivityListSkeleton />
    return <Text className="text-center py-10">로딩 중...</Text>
  }

  if (error) {
    return <Text className="text-center py-10">최근 소그룹의 활동을 불러오는데 실패했어요.</Text>
  }

  return (
    <FlashList
      data={slicedFeeds}
      renderItem={renderActivityItem}
      keyExtractor={(item) => item.identifier.id}
      estimatedItemSize={150}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <Divider className="my-2" />}
      ListEmptyComponent={<Text className="text-center py-10">최근 소그룹의 활동이 없어요.</Text>}
    />
  )
}

function renderActivityItem({ item }: { item: Feed }) {
  switch (item.metadata.type) {
    case 'prayer-requests':
      return <PrayerRequestFeedItem item={item as PrayerRequestsFeed} />;
    case 'fellowship':
      return <FellowshipFeedItem item={item as FellowshipFeed} />;
    case 'posts':
      return <PostFeedItem item={item as PostsFeed} />;
    default:
      return null;
  }
}
