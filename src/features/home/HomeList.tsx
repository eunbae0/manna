import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { FlatList, ActivityIndicator } from 'react-native';
import { RefreshControl } from 'react-native';
import { type Href, router } from 'expo-router';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { Heading } from '#/components/ui/heading';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Pen } from 'lucide-react-native';
import { Divider } from '#/components/ui/divider';
import NotificationBox from './components/NotificationBox';
import ServiceGroups from './components/ServiceGroups';
import { useNotifications } from '@/features/notification/hooks/useNotifications';
import type { ClientPrayerRequest } from '@/api/prayer-request/types';
import { PrayerRequestCard } from '@/features/prayer-request/components/PrayerRequestCard';
import { Text } from '#/components/ui/text';
import { PrayerRequestSkeleton } from '@/features/prayer-request/components/PrayerRequestSkeleton';
import { usePrayerRequests } from '@/features/prayer-request/hooks/usePrayerRequests';

function HomeList() {
	const [refreshing, setRefreshing] = useState(false);
	const [showNotification, setShowNotification] = useState(false);

	const {
		prayerRequests,
		isLoading,
		isError,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch: refetchPrayerRequests,
	} = usePrayerRequests();

	const {
		notifications,
		refetch: refetchNotifications,
		markAsRead,
	} = useNotifications();

	// Handle pull-to-refresh
	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await Promise.all([refetchPrayerRequests(), refetchNotifications()]);
		} finally {
			setRefreshing(false);
		}
	}, [refetchPrayerRequests, refetchNotifications]);

	const handlePressAddButton = () => {
		router.navigate('/(app)/createPrayerRequestModal');
	};

	const recentFellowshipNotification = useMemo(() => {
		const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
		return notifications?.find(
			(notification) =>
				notification.metadata?.fellowshipId &&
				notification.isRead === false &&
				notification.timestamp > sixHoursAgo,
		);
	}, [notifications]);

	const handleDismissNotification = useCallback(() => {
		if (!recentFellowshipNotification) return;
		markAsRead(recentFellowshipNotification.id);
		setShowNotification(false);
	}, [markAsRead, recentFellowshipNotification]);

	const handlePressRecentFellowshipNotification = useCallback(() => {
		if (!recentFellowshipNotification) return;
		markAsRead(recentFellowshipNotification.id);
		setShowNotification(false);
		router.push(
			(recentFellowshipNotification.screen as Href) ||
				'/(app)/(fellowship)/list',
		);
	}, [recentFellowshipNotification, markAsRead]);

	useEffect(() => {
		if (!recentFellowshipNotification) return;
		setShowNotification(true);
	}, [recentFellowshipNotification]);

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
			// 초기 로딩 상태
			if (isLoading) {
				return <PrayerRequestSkeleton />;
			}

			return <PrayerRequestCard prayerRequest={item} />;
		},
		[isLoading],
	);

	// 데이터가 없는 상태
	if (!prayerRequests || prayerRequests.length === 0) {
		return (
			<Text className="text-center py-8 text-gray-500">기도 제목이 없어요</Text>
		);
	}

	return (
		<>
			<FlatList
				ListHeaderComponent={
					<VStack space="2xl" className="pt-2 pb-4">
						<VStack space="lg" className="pt-2">
							<NotificationBox
								title="새 나눔이 등록되었어요"
								description="클릭해서 나눔에 참여해보세요"
								visible={showNotification}
								onPress={handlePressRecentFellowshipNotification}
								onDismiss={handleDismissNotification}
							/>
							<ServiceGroups />
						</VStack>

						<Divider className="h-2 bg-background-100" />

						<VStack className="gap-12 py-1">
							<VStack space="lg">
								<HStack className="justify-between px-4 items-center">
									<Heading className="text-[20px]">우리의 기도 제목</Heading>
								</HStack>
							</VStack>
						</VStack>
					</VStack>
				}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor="#362303"
						title="새로고침 중..."
						titleColor="#362303"
					/>
				}
				data={prayerRequests}
				renderItem={renderPrayerRequestItem}
				keyExtractor={(item) => item.id}
				ItemSeparatorComponent={renderSeparator}
				ListFooterComponent={renderFooter}
				onEndReached={loadMorePrayerRequests}
				onEndReachedThreshold={0.3}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 20 }}
			/>
			<Button
				size="lg"
				variant="solid"
				className="absolute bottom-5 right-4"
				rounded
				onPress={handlePressAddButton}
			>
				<ButtonText>작성하기</ButtonText>
				<ButtonIcon as={Pen} />
			</Button>
		</>
	);
}

export default HomeList;
