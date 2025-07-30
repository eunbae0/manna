import { RefreshControl } from 'react-native';
import { VStack } from '#/components/ui/vstack';
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
import { FeedItemListSkeleton } from '../components/FeedItemSkeleton';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { ChevronRight, RefreshCcw } from 'lucide-react-native';
import { FeedHomeHeader } from './FeedHomeHeader';
import { useTabPressScrollToTop } from '@/shared/hooks/useTabPressScrollToTop';
import { useMemo } from 'react';
import { useAuthStore } from '@/store/auth';
import { router } from 'expo-router';

export default function FeedHomeScreen() {
	const feedListRef = useTabPressScrollToTop<FlashList<Feed>>();

	return (
		<VStack space="sm" className="w-full flex-1">
			<FeedHomeHeader />
			<FeedItemList ref={feedListRef} />
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

function FeedItemList({ ref }: { ref: React.Ref<FlashList<Feed>> }) {
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
	const { user } = useAuthStore();

	const feeds = data?.pages.flatMap((page) => page.feeds) ?? [];

	const hasGroup = user?.groups ? user.groups.length > 0 : false;

	const emptyLabel = useMemo(() => {
		return hasGroup
			? {
					title: '새 글이 없어요',
					desc: '끌어당겨 새로고침하거나,\n우측 상단의 글쓰기 버튼을 눌러 새 글을 작성해보세요.',
				}
			: {
					title: '참여 중인 그룹이 없어요',
					desc: '그룹을 만들거나 기존 그룹에 참여해보세요.',
				};
	}, [hasGroup]);

	if (isLoading) return <FeedItemListSkeleton />;

	if (error)
		return (
			<VStack space="xl" className="py-10 items-center">
				<Text size="lg" className="text-center">
					피드를 불러오는데 실패했어요.
				</Text>
				<Button variant="outline" size="md" onPress={() => refetch()}>
					<ButtonText>다시 시도하기</ButtonText>
					<ButtonIcon as={RefreshCcw} size="lg" />
				</Button>
			</VStack>
		);

	return (
		<FlashList
			ref={ref}
			data={feeds}
			renderItem={renderItem}
			estimatedItemSize={120}
			refreshControl={
				<RefreshControl refreshing={isRefetching} onRefresh={refetch} />
			}
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
			ListEmptyComponent={
				<VStack
					space="4xl"
					className="text-center pt-14 pb-12 items-center px-12"
				>
					<VStack space="md" className="text-center items-center">
						<Text size="xl" weight="semi-bold" className="text-typography-600">
							{emptyLabel.title}
						</Text>
						<Text
							weight="medium"
							className="text-typography-500 text-center leading-6"
						>
							{emptyLabel.desc}
						</Text>
					</VStack>
					{!hasGroup && (
						<Button
							size="md"
							onPress={() => router.push('/(app)/(group)/group-selection')}
						>
							<ButtonText>그룹에 참여하기</ButtonText>
							<ButtonIcon as={ChevronRight} />
						</Button>
					)}
				</VStack>
			}
			extraData={[feeds]}
		/>
	);
}
