import { useCallback, useState, useEffect, useMemo } from 'react';
import { type Href, router, useFocusEffect } from 'expo-router';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { Heading } from '#/components/ui/heading';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Pen } from 'lucide-react-native';
import { Divider } from '#/components/ui/divider';
import { Box } from '#/components/ui/box';
import type { YYYYMMDD } from '@/shared/types/date';
import { getKSTDate } from '@/shared/utils/date';
import { RefreshControl, ScrollView } from 'react-native';
import { usePrayerRequestsByDate } from '@/features/home/hooks/usePrayerRequestsByDate';
import { useAuthStore } from '@/store/auth';
import NotificationBox from './components/NotificationBox';
import ServiceGroups from './components/ServiceGroups';
import { HomeSkeleton } from './components/HomeSkeleton';
import PreayerRequestList from './components/PreayerRequestList';
import { useNotifications } from '@/features/notification/hooks/useNotifications';
import { useRefetchOnFocus } from '@/shared/hooks/useRefetchOnFocus';

function HomeList() {
	const [date, setDate] = useState<YYYYMMDD>(getKSTDate(new Date()));
	const [refreshing, setRefreshing] = useState(false);
	const [showNotification, setShowNotification] = useState(false);

	const { user, currentGroup } = useAuthStore();

	const {
		notifications,
		refetch: refetchNotifications,
		markAsRead,
	} = useNotifications();

	const {
		data: prayerRequests,
		isLoading: isPrayerRequestsLoading,
		isError: isPrayerRequestsError,
		refetch: refetchPrayerRequests,
	} = usePrayerRequestsByDate(currentGroup?.groupId || '', date);

	useRefetchOnFocus(() => {
		const newDate = getKSTDate(new Date());
		if (date !== newDate) {
			setDate(newDate);
		}
		// refetchPrayerRequests();
		// refetchNotifications();
	});

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

	return (
		<>
			{/* <CalendarTab
				date={date}
				onDateChange={handleDateChange}
			/> */}
			<ScrollView
				showsVerticalScrollIndicator={false}
				className="h-full"
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor="#362303"
						title="새로고침 중..."
						titleColor="#362303"
					/>
				}
			>
				{isPrayerRequestsLoading ? (
					<HomeSkeleton />
				) : (
					<VStack space="2xl" className="pt-2 pb-4">
						<VStack space="lg" className="pt-2">
							<NotificationBox
								title={'새 나눔이 등록되었어요'}
								description={'클릭해서 나눔에 참여해보세요'}
								visible={showNotification}
								onPress={handlePressRecentFellowshipNotification}
								onDismiss={handleDismissNotification}
							/>
							<ServiceGroups />
						</VStack>

						<Divider className="h-2 bg-background-100" />

						{/* 오늘의 기도 제목 */}
						<VStack className="gap-12 py-1">
							<VStack space="lg">
								<HStack className="justify-between px-4 items-center">
									<Heading className="text-[20px]">오늘의 기도 제목</Heading>
								</HStack>
								<PreayerRequestList
									prayerRequests={prayerRequests}
									member={{
										id: user?.id || '',
										displayName: user?.displayName || '',
										photoUrl: user?.photoUrl || '',
									}}
									date={date}
									isError={isPrayerRequestsError}
								/>
							</VStack>
						</VStack>
					</VStack>
				)}
				<Box className="h-32" />
			</ScrollView>
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
