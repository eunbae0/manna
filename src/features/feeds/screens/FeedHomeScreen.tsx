import { VStack } from '#/components/ui/vstack';
import Heading from '@/shared/components/heading';
import { FlashList } from '@shopify/flash-list';
import { FellowshipFeedItem } from '@/features/feeds/components/FellowshipFeedItem';
import { PostFeedItem } from '@/features/feeds/components/PostFeedItem';
import { PrayerRequestFeedItem } from '@/features/feeds/components/PrayerRequestFeedItem';
import { Text } from '@/shared/components/text';
import { useInfiniteUserFeeds } from '@/features/feeds/hooks/useFeeds';
import type {
  Feed,
  FellowshipFeed,
  PostsFeed,
  PrayerRequestsFeed,
} from '../api/types';
import Divider from '@/shared/components/divider';
import { RefreshControl } from 'react-native';
import { FeedItemListSkeleton } from '../components/FeedItemSkeleton';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { RefreshCcw } from 'lucide-react-native';

export default function FeedHomeScreen() {
  return (
    <VStack space="sm" className="w-full flex-1">
      <Heading size="2xl" className="px-5 pt-4 pb-3">
        최근 피드
      </Heading>
      <FeedItemList />
    </VStack>
  );
}

function renderItem({ item }: { item: Feed }) {
  switch (item.metadata.type) {
    case 'fellowship':
      return <FellowshipFeedItem item={item as FellowshipFeed} />;
    case 'posts':
      return <PostFeedItem item={item as PostsFeed} />;
    case 'prayer-requests':
      return <PrayerRequestFeedItem item={item as PrayerRequestsFeed} />;
    default:
      return null;
  }
}

function FeedItemList() {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteUserFeeds();

  const feeds = data?.pages.flatMap((page) => page.feeds) ?? [];

  if (isLoading) return <FeedItemListSkeleton />;

  if (error)
    return (
      <VStack space="xl" className="py-10 items-center" >
        <Text size="lg" className="text-center">피드를 불러오는데 실패했어요.</Text>
        <Button variant="outline" size="md" onPress={() => refetch()}>
          <ButtonText>다시 시도하기</ButtonText>
          <ButtonIcon as={RefreshCcw} size="lg" />
        </Button>
      </VStack>
    );

  return (
    <FlashList
      data={feeds}
      renderItem={renderItem}
      estimatedItemSize={120}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.5}
      keyExtractor={(item) => item.identifier.id}
      ItemSeparatorComponent={() => <Divider size="lg" className="my-3" />}
      ListFooterComponent={
        isFetchingNextPage ? (
          <Text className="text-center py-4">더 불러오는 중...</Text>
        ) : null
      }
      ListHeaderComponent={<Divider size="lg" />}
      ListEmptyComponent={<Text className="text-center py-10">새 글이 없어요.</Text>}
    />
  );
}
