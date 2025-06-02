import { useCallback, useState } from 'react';
import { HStack } from '#/components/ui/hstack';
import AnimatedPressable from '@/components/common/animated-pressable';
import { Box } from '#/components/ui/box';
import { Text } from '@/shared/components/text';
import { Check, ChevronRight } from 'lucide-react-native';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useDelayedValue } from '@/hooks/useDelayedValue';
import { useInfiniteFellowships } from '@/features/fellowship/hooks/useInfiniteFellowships';
import { useToastStore } from '@/store/toast';
import { VStack } from '#/components/ui/vstack';
import { Avatar } from '@/components/common/avatar';
import { Button, ButtonText } from '@/components/common/button';

import type {
  ClientFellowshipParticipantV2,
  ClientFellowshipV2,
} from '@/features/fellowship/api/types';
import { shadowStyle } from '@/shared/styles/shadow';
import { FellowshipListSkeletonGroup } from '@/features/fellowship/components/FellowshipListSkeleton';
import { Icon } from '#/components/ui/icon';
import { useFellowshipStore } from '@/store/createFellowship';
import { router } from 'expo-router';
import FellowshipListItem from '@/features/fellowship/components/FellowshipListItem';

type Props = {
  handlePressFellowship: (fellowshipId: string) => void;
};

export default function FellowshipListView({ handlePressFellowship }: Props) {
  const { showError } = useToastStore();
  const { setType } = useFellowshipStore();

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteFellowships(8);
  const showSkeleton = useDelayedValue(isLoading);
  const [showLeader, setShowLeader] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fellowships = data?.pages.flatMap((page) => page.items) || [];

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing fellowships:', error);
      showError('나눔 기록을 새로고침하는 중 오류가 발생했습니다.');
    } finally {
      setRefreshing(false);
    }
  }, [refetch, showError]);

  // 나눔 아이템 렌더링 함수
  const renderFellowshipItem = ({ item }: { item: ClientFellowshipV2 }) => {
    return (
      <FellowshipListItem item={item} showOnlyLeader={showLeader} onPress={handlePressFellowship} />
      // <FellowshipListSkeletonGroup />
    );
  };

  // 리스트 푸터 렌더링 함수
  const renderFooter = () => {
    if (!isFetchingNextPage) return <Box className="h-24" />;

    return (
      <Box className="py-4 items-center justify-center">
        <ActivityIndicator size="small" color="#6366f1" />
      </Box>
    );
  };

  const handlePressCreateFellowship = () => {
    setType('CREATE');
    router.push('/(app)/(fellowship)/create');
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // 빈 리스트 렌더링 함수
  const renderEmptyList = () => {
    if (showSkeleton && !isFetchingNextPage) return <FellowshipListSkeletonGroup />;

    if (isError) {
      return (
        <HStack className="justify-center py-8">
          <Text className="text-danger-500">
            나눔 기록을 불러오는 중 오류가 발생했어요
          </Text>
        </HStack>
      );
    }

    return (
      <VStack space="xl" className="items-center py-8">
        <Text className="text-typography-500">아직 소그룹의 나눔이 없어요</Text>
        <Button
          size="md"
          variant="outline"
          className="rounded-xl"
          onPress={handlePressCreateFellowship}
        >
          <ButtonText>나눔 작성하기</ButtonText>
        </Button>
      </VStack>
    );
  };

  return (
    <FlatList
      data={fellowships}
      renderItem={renderFellowshipItem}
      keyExtractor={(item) => item.identifiers.id}
      ListHeaderComponent={
        <AnimatedPressable
          onPress={() => setShowLeader(!showLeader)}
          className="self-end"
        >
          <HStack space="sm" className="items-center mr-5 pt-6 pb-4">
            <Text size="md" className="text-typography-600">
              나눔 리더만 보기
            </Text>
            <Box
              className={`w-4 h-4 rounded-sm border items-center justify-center ${showLeader ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}
            >
              {showLeader && (
                <Icon as={Check} size="xs" className="text-white" />
              )}
            </Box>
          </HStack>
        </AnimatedPressable>
      }
      ListEmptyComponent={renderEmptyList}
      ListFooterComponent={renderFooter}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#6366f1"
          title="새로고침 중..."
          titleColor="#4B5563"
        />
      }
      showsVerticalScrollIndicator={false}
      className="flex-1"
    />
  );
}