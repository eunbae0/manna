import { useCallback, useState, useEffect } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { Heading } from '#/components/ui/heading';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Text } from '#/components/ui/text';
import { Pen } from 'lucide-react-native';
import { Divider } from '#/components/ui/divider';
import { Box } from '#/components/ui/box';
import type { YYYYMMDD } from '@/shared/types/date';
import { getKSTDate } from '@/shared/utils/date';
import { RefreshControl, ScrollView } from 'react-native';
import { usePrayerRequestsByDate } from '@/features/home/hooks/usePrayerRequestsByDate';
import type { ClientPrayerRequest } from '@/api/prayer-request/types';
import { PrayerRequestCard } from '@/features/prayer-request/components/PrayerRequestCard';
import { useAuthStore } from '@/store/auth';
import NotificationBox from './components/NotificationBox';
import ServiceGroups from './components/ServiceGroups';
import { HomeSkeleton } from './components/HomeSkeleton';
import { useRecentFellowships } from '@/features/fellowship/hooks/useRecentFellowships';
import PreayerRequestList from './components/PreayerRequestList';

function HomeList() {
	const [date, setDate] = useState<YYYYMMDD>(getKSTDate(new Date()));
	const [refreshing, setRefreshing] = useState(false);
	const [showNotification, setShowNotification] = useState(false);

	const { user, currentGroup } = useAuthStore();

	// Query for recent fellowships (created within the last 6 hours)
	const {
		data: recentFellowships,
		isLoading: isLoadingRecentFellowships,
		isError: isErrorRecentFellowships,
		refetch: refetchRecentFellowships,
	} = useRecentFellowships();

	const {
		data: prayerRequests,
		isLoading: isPrayerRequestsLoading,
		isError: isPrayerRequestsError,
		refetch: refetchPrayerRequests,
	} = usePrayerRequestsByDate(currentGroup?.groupId || '', date);

	useFocusEffect(() => {
		const newDate = getKSTDate(new Date());
		if (date !== newDate) {
			setDate(newDate);
		}
		refetchRecentFellowships();
	});

	// Handle pull-to-refresh
	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await Promise.all([refetchPrayerRequests(), refetchRecentFellowships()]);
		} finally {
			setRefreshing(false);
		}
	}, [refetchPrayerRequests, refetchRecentFellowships]);

	const handlePressAddButton = () => {
		router.navigate('/(app)/createPrayerRequestModal');
	};

	const handleDismissNotification = useCallback(() => {
		setShowNotification(false);
	}, []);

	useEffect(() => {
		if (!isLoadingRecentFellowships) {
			setTimeout(() => {
				setShowNotification(recentFellowships !== null);
			}, 500);
		}
	}, [recentFellowships, isLoadingRecentFellowships]);

	return (
		<VStack className="relative h-full">
			{/* <CalendarTab
				date={date}
				onDateChange={handleDateChange}
			/> */}
			<ScrollView
				showsVerticalScrollIndicator={false}
				className="h-full flex-1"
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
						<VStack space="lg">
							<NotificationBox
								title={'새 나눔이 등록되었어요'}
								description={'클릭해서 나눔에 참여해보세요'}
								visible={showNotification}
								onPress={() => router.push('/(app)/(fellowship)/list')}
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
				className="absolute bottom-16 right-4"
				rounded
				onPress={handlePressAddButton}
			>
				<ButtonText>작성하기</ButtonText>
				<ButtonIcon as={Pen} />
			</Button>
		</VStack>
	);
}

export default HomeList;
