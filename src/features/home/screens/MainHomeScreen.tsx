import { ScrollView, RefreshControl } from 'react-native';
import { VStack } from '#/components/ui/vstack';

import { HomeHeader } from '../components/HomeHeader';
import { HomeBanner } from '../components/HomeBanner';
import { HomeMyGroupList } from '../components/HomeMyGroupList';
import Divider from '@/shared/components/divider';
import { RecommendServiceList } from '../components/RecommendServiceList';
import { Box } from '#/components/ui/box';
import { HomeRecentGroupActivity } from '../components/HomeRecentGroupActivity';
import { useInfiniteUserFeeds } from '@/features/feeds/hooks/useFeeds';
import { useRefreshControl } from '@/shared/hooks/useRefreshControl';
import { useNotifications } from '@/features/notification/hooks/useNotifications';
import { useCallback, useRef } from 'react';
import { useTabPressScrollToTop } from '@/shared/hooks/useTabPressScrollToTop';

export default function MainHomeScreen() {
	const { refetch: refetchFeeds } = useInfiniteUserFeeds();
	const { refetch: refetchNotifications } = useNotifications();

	const handleRefresh = useCallback(() => {
		return Promise.all([refetchFeeds(), refetchNotifications()]);
	}, [refetchFeeds, refetchNotifications]);

	const { isRefreshing, onRefresh } = useRefreshControl(handleRefresh);

	const scrollViewRef = useTabPressScrollToTop<ScrollView>();

	return (
		<VStack>
			<HomeHeader />
			<ScrollView
				ref={scrollViewRef}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
				}
				style={{ height: '100%' }}
			>
				<HomeBanner />
				<Box className="h-2" />
				<HomeMyGroupList />
				<Divider size="lg" className="my-7" />
				<HomeRecentGroupActivity />
				<Divider size="lg" className="my-7" />
				<RecommendServiceList />
				<Box className="h-32" />
			</ScrollView>
		</VStack>
	);
}
