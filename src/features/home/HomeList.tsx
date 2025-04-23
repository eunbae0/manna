import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { FlatList, ActivityIndicator } from 'react-native';
import { RefreshControl } from 'react-native';
import { type Href, router } from 'expo-router';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { Heading } from '@/shared/components/heading';
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
import { useQueryClient } from '@tanstack/react-query';
import { GROUP_QUERY_KEY, GROUPS_QUERY_KEY } from './group/hooks/useGroups';
import { trackAmplitudeEvent } from '@/shared/utils/amplitude';

function HomeList() {
	const [refreshing, setRefreshing] = useState(false);
	const [showNotification, setShowNotification] = useState(false);

	const queryClient = useQueryClient();

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
			await Promise.all([
				refetchPrayerRequests(),
				refetchNotifications(),
				queryClient.invalidateQueries({
					queryKey: [GROUPS_QUERY_KEY],
				}),
				queryClient.invalidateQueries({
					queryKey: [GROUP_QUERY_KEY],
				}),
			]);
		} finally {
			setRefreshing(false);
			// tracking amplitude
			trackAmplitudeEvent('Home List Refresh', { screen: 'Tab_Home' });
		}
	}, [refetchPrayerRequests, refetchNotifications, queryClient]);

	const handlePressAddButton = () => {
		trackAmplitudeEvent('Open Create Prayer Request', { screen: 'Tab_Home' });
		router.navigate('/(app)/createPrayerRequestModal');
	};

	// 현재 표시할 알림 상태 관리
	const [recentFellowshipNotification, setRecentFellowshipNotification] =
		useState<{
			id: string;
			screen?: string;
		} | null>(null);

	// 최근 나눔 알림 찾기
	useEffect(() => {
		const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
		const recentFellowshipNotification = notifications?.find(
			(notification) =>
				notification.metadata?.fellowshipId &&
				notification.isRead === false &&
				notification.timestamp > sixHoursAgo,
		);
		if (recentFellowshipNotification) {
			setRecentFellowshipNotification({
				id: recentFellowshipNotification.id,
				screen: recentFellowshipNotification.screen,
			});
		}
	}, [notifications]);

	// 알림 닫기 핸들러
	const handleDismissNotification = useCallback(() => {
		if (!recentFellowshipNotification) return;

		// 현재 표시된 알림을 읽음 처리
		markAsRead(recentFellowshipNotification.id);
		setRecentFellowshipNotification(null);
	}, [markAsRead, recentFellowshipNotification]);

	// 알림 클릭 핸들러
	const handlePressNotification = useCallback(() => {
		if (!recentFellowshipNotification) return;

		// 현재 표시된 알림을 읽음 처리
		setRecentFellowshipNotification(null);
		markAsRead(recentFellowshipNotification.id);

		// 알림에 연결된 화면으로 redirect
		if (recentFellowshipNotification.screen) {
			router.push(recentFellowshipNotification.screen as Href);
		} else {
			router.push('/(app)/(fellowship)/list');
		}
	}, [recentFellowshipNotification, markAsRead]);

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

	return (
		<>
			<FlatList
				ListHeaderComponent={
					<VStack space="2xl" className="pt-2 pb-4">
						<VStack space="lg" className="pt-2">
							{recentFellowshipNotification && (
								<NotificationBox
									title="새 나눔이 등록되었어요"
									description="클릭해서 나눔에 참여해보세요"
									onPress={handlePressNotification}
									onDismiss={handleDismissNotification}
								/>
							)}
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
				ListEmptyComponent={
					<Text className="text-center py-8 text-gray-500">
						기도 제목이 없어요
					</Text>
				}
				keyExtractor={(item) => item.id}
				ItemSeparatorComponent={renderSeparator}
				ListFooterComponent={renderFooter}
				onEndReached={loadMorePrayerRequests}
				onEndReachedThreshold={0.3}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 28 }}
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
