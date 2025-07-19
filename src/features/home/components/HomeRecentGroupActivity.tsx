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
import { ChevronRight, RefreshCcw } from 'lucide-react-native';
import { HomeFeedItemListSkeleton } from '@/features/feeds/components/FeedItemSkeleton';

export function HomeRecentGroupActivity() {
	return (
		<VStack space="sm" className="w-full">
			<Heading size="2xl" className="px-5">
				최근 소그룹 활동
			</Heading>
			<View className="w-full px-2">
				<HomeRecentGroupActivityList />
			</View>
		</VStack>
	);
}

function HomeRecentGroupActivityList() {
	const { data, isLoading, error, refetch } = useInfiniteUserFeeds();
	const feeds = data?.pages.flatMap((page) => page.feeds);
	const slicedFeeds = feeds?.slice(0, 3);

	const handlePressMore = useCallback(() => {
		router.push('/(app)/(tabs)/feed');
	}, []);

	if (isLoading) {
		return <HomeFeedItemListSkeleton />;
	}

	if (error) {
		return (
			<VStack space="xl" className="pt-10 pb-2 items-center">
				<Text size="lg" className="text-center">
					최근 소그룹의 활동을 불러오는데 실패했어요.
				</Text>
				<Button variant="outline" size="md" onPress={() => refetch()}>
					<ButtonText>다시 시도하기</ButtonText>
					<ButtonIcon as={RefreshCcw} size="lg" />
				</Button>
			</VStack>
		);
	}

	return (
		<FlashList
			data={slicedFeeds}
			renderItem={renderActivityItem}
			keyExtractor={(item) => item.identifier.id}
			estimatedItemSize={150}
			showsVerticalScrollIndicator={false}
			ItemSeparatorComponent={() => <Divider className="my-2" />}
			ListEmptyComponent={
				<Text
					weight="medium"
					className="text-typography-500 text-center pt-16 pb-14"
				>
					최근 소그룹의 활동이 없어요.
				</Text>
			}
			ListFooterComponent={
				slicedFeeds && slicedFeeds.length > 0 ? (
					<View className="w-full px-2">
						<Divider className="my-1" />
						<Button
							variant="text"
							size="lg"
							fullWidth
							onPress={handlePressMore}
						>
							<ButtonText>피드 더보기</ButtonText>
							<ButtonIcon as={ChevronRight} size="lg" />
						</Button>
					</View>
				) : null
			}
		/>
	);
}

function renderActivityItem({ item }: { item: Feed }) {
	switch (item.metadata.type) {
		case 'prayer-requests':
			return <PrayerRequestFeedItem item={item as PrayerRequestsFeed} />;
		case 'fellowship':
			return <FellowshipFeedItem item={item as FellowshipFeed} />;
		case 'posts':
			return <PostFeedItem item={item as PostsFeed} isCommentVisible={false} />;
		default:
			return null;
	}
}
