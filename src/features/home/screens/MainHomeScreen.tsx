import { ScrollView } from 'react-native';
import { VStack } from '#/components/ui/vstack';

import { HomeHeader } from '../components/HomeHeader';
import { HomeBanner } from '../components/HomeBanner';
import { HomeMyGroupList } from '../components/HomeMyGroupList'
import Divider from '@/shared/components/divider';
import { RecommendServiceList } from '../components/RecommendServiceList';
import { Box } from '#/components/ui/box';
import { HomeRecentGroupActivity } from '../components/HomeRecentGroupActivity';
import { useInfiniteUserFeeds } from '@/features/feeds/hooks/useFeeds';
import { RefreshControl } from 'react-native';

export default function MainHomeScreen() {
  const { refetch, isFetching } = useInfiniteUserFeeds();
  return (
    <VStack>
      <HomeHeader />
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />} style={{ height: '100%' }}>
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
  )
}