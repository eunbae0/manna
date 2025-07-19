import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VStack } from '#/components/ui/vstack';
import { Divider } from '#/components/ui/divider';
import { Text } from '@/shared/components/text';
import { PrayerRequestCard } from '@/features/prayer-request/components/PrayerRequestCard';
import { PrayerRequestSkeleton } from '@/features/prayer-request/components/PrayerRequestSkeleton';
import { usePrayerRequests } from '@/features/prayer-request/hooks/usePrayerRequests';
import Header from '@/components/common/Header';
import type { ClientPrayerRequest } from '@/api/prayer-request/types';

export default function PrayerRequestList() {
	const [refreshing, setRefreshing] = useState(false);

	// 기도 제목 데이터 가져오기
	const {
		prayerRequests,
		isLoading,
		isError,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch: refetchPrayerRequests,
	} = usePrayerRequests();

	// 새로고침 핸들러
	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await refetchPrayerRequests();
		} catch (error) {
			console.warn('기도 제목 새로고침 중 오류 발생:', error);
		} finally {
			setRefreshing(false);
		}
	}, [refetchPrayerRequests]);

	// 다음 페이지 로드 함수
	const loadMorePrayerRequests = useCallback(() => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	// 하단 로딩 인디케이터 렌더링 함수
	const renderFooter = useCallback(() => {
		if (!isFetchingNextPage) return null;

		// 오류 상태
		if (isError) {
			return (
				<Text className="text-center py-8 text-danger-500">
					기도 제목을 불러오는 중 오류가 발생했어요
				</Text>
			);
		}
		return (
			<VStack className="py-4 items-center">
				<ActivityIndicator size="small" color="#362303" />
				<Text className="text-gray-500 text-sm mt-1">더 불러오는 중...</Text>
			</VStack>
		);
	}, [isFetchingNextPage, isError]);

	// 구분선 렌더링 함수
	const renderSeparator = useCallback(() => {
		return <Divider className="bg-background-100 h-[1px]" />;
	}, []);

	// 기도제목 카드 렌더링 함수
	const renderPrayerRequestItem = useCallback(
		({ item }: { item: ClientPrayerRequest }) => {
			if (isLoading) {
				return <PrayerRequestSkeleton />;
			}

			return <PrayerRequestCard prayerRequest={item} />;
		},
		[isLoading],
	);

	// 빈 상태 렌더링 함수
	const renderEmptyComponent = useCallback(() => {
		if (isLoading) {
			return (
				<VStack space="md" className="py-8">
					<PrayerRequestSkeleton />
				</VStack>
			);
		}

		return (
			<Text className="text-center py-8 text-gray-500">기도 제목이 없어요</Text>
		);
	}, [isLoading]);

	return (
		<SafeAreaView className="flex-1 bg-white">
			<VStack className="flex-1">
				<Header label="우리의 기도 제목" />
				{/* 기도 제목 목록 */}
				<FlatList
					data={prayerRequests}
					renderItem={renderPrayerRequestItem}
					ListEmptyComponent={renderEmptyComponent}
					keyExtractor={(item) => item.id}
					ItemSeparatorComponent={renderSeparator}
					ListFooterComponent={renderFooter}
					onEndReached={loadMorePrayerRequests}
					onEndReachedThreshold={0.3}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
							tintColor="#362303"
							title="새로고침 중..."
							titleColor="#362303"
						/>
					}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 28 }}
				/>
			</VStack>
		</SafeAreaView>
	);
}
