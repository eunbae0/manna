import React, { useCallback, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RefreshControl } from 'react-native';
import { type Href, router } from 'expo-router';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { Heading } from '@/shared/components/heading';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Pen, ChevronRight } from 'lucide-react-native';
import { Divider } from '#/components/ui/divider';
import NotificationBox from './components/NotificationBox';
import ServiceGroups from './components/ServiceGroups';
import { useNotifications } from '@/features/notification/hooks/useNotifications';
import { PrayerRequestCard } from '@/features/prayer-request/components/PrayerRequestCard';
import { Text } from '@/shared/components/text';
import { PrayerRequestSkeleton } from '@/features/prayer-request/components/PrayerRequestSkeleton';
import { usePrayerRequests } from '@/features/prayer-request/hooks/usePrayerRequests';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { GROUP_QUERY_KEY, GROUPS_QUERY_KEY } from './group/hooks/useGroups';
import { trackAmplitudeEvent } from '@/shared/utils/amplitude';
import { useAuthStore } from '@/store/auth';
import { ScrollView } from 'react-native-gesture-handler';
import { useInfiniteBoardPosts } from '../board/hooks';
import { HomeBoardPostCard } from '../board/components/HomeBoardPostCard';
import { HomeBoardPostSkeleton } from '../board/components/HomeBoardPostSkeleton';
import { CoverImageCarousel } from './components/CoverImageCarousel';
import NoticeBox from './components/NoticeBox';
import { fetchMainScreenNotices } from '@/api/notice';

function HomeList() {
	const { currentGroup } = useAuthStore()

	const [refreshing, setRefreshing] = useState(false);

	const queryClient = useQueryClient();

	const {
		prayerRequests,
		isLoading,
		refetch: refetchPrayerRequests,
	} = usePrayerRequests();

	const {
		notifications,
		refetch: refetchNotifications,
		markAsRead,
	} = useNotifications();

	// 메인화면에 표시할 공지사항 가져오기
	const { data: mainNotices, refetch: refetchNotices } = useQuery({
		queryKey: ['mainScreenNotices'],
		queryFn: fetchMainScreenNotices,
	});

	// Handle pull-to-refresh
	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await Promise.all([
				refetchPrayerRequests(),
				refetchNotifications(),
				refetchNotices(),
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
			trackAmplitudeEvent('홈 새로고침', { screen: 'Tab_Home' });
		}
	}, [refetchPrayerRequests, refetchNotifications, refetchNotices, queryClient]);

	const handlePressAddButton = () => {
		trackAmplitudeEvent('기도제목 작성하기 클릭', { screen: 'Tab_Home' });
		router.navigate('/(app)/createPrayerRequestModal');
	};

	// 숨긴 공지사항 ID 상태 관리
	const [dismissedNoticeIds, setDismissedNoticeIds] = useState<string[]>([]);

	// AsyncStorage에서 숨긴 공지사항 ID 불러오기
	useEffect(() => {
		const loadDismissedNotices = async () => {
			try {
				const dismissedNoticesJson = await AsyncStorage.getItem('dismissedNoticeIds');
				if (dismissedNoticesJson) {
					setDismissedNoticeIds(JSON.parse(dismissedNoticesJson));
				}
			} catch (error) {
				console.error('Failed to load dismissed notices:', error);
			}
		};

		loadDismissedNotices();
	}, []);

	// 가장 최근 공지사항 가져오기 (숨기지 않은 것만)
	const latestMainNotice = useMemo(() => {
		if (!mainNotices || mainNotices.length === 0) return null;

		// 숨기지 않은 공지사항 중 첫 번째 항목 반환
		const visibleNotice = mainNotices.find(notice => !dismissedNoticeIds.includes(notice.id));
		return visibleNotice || null;
	}, [mainNotices, dismissedNoticeIds]);

	const handlePressNoticeBox = () => {
		if (latestMainNotice) {
			router.push({
				pathname: '/(app)/(more)/notice',
				params: { id: latestMainNotice.id }
			});
			trackAmplitudeEvent('공지사항 클릭', { screen: 'Tab_Home', noticeId: latestMainNotice.id });
		}
	};

	// 공지사항 숨기기 처리
	const handleDismissNotice = useCallback(async () => {
		if (!latestMainNotice) return;

		try {
			// 현재 공지사항 ID를 숨김 목록에 추가
			const updatedDismissedIds = [...dismissedNoticeIds, latestMainNotice.id];
			setDismissedNoticeIds(updatedDismissedIds);

			// AsyncStorage에 저장
			await AsyncStorage.setItem('dismissedNoticeIds', JSON.stringify(updatedDismissedIds));

		} catch (error) {
			console.error('Failed to dismiss notice:', error);
		}
	}, [latestMainNotice, dismissedNoticeIds]);

	// 현재 표시할 알림 상태 관리
	const [recentFellowshipNotification, setRecentFellowshipNotification] =
		useState<{
			id: string;
			screen?: string;
		} | null>(null);

	// 최근 나눔 알림 찾기
	useEffect(() => {
		const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
		const recentFellowshipNotification =
			currentGroup && notifications
				.filter(n => n.metadata?.groupId === currentGroup.groupId)
				.find(
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
	}, [notifications, currentGroup]);

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


	// 기도 제목
	const handleViewMorePrayerRequests = useCallback(() => {
		trackAmplitudeEvent('기도 제목 더보기 클릭', { screen: 'Tab_Home' });
		router.push('/(app)/(prayerRequest)/list');
	}, []);

	const handleViewMoreBoardPosts = useCallback(() => {
		trackAmplitudeEvent('게시판 더보기 클릭', { screen: 'Tab_Home' });
		router.push('/(app)/(board)/board-index');
	}, []);

	const recentPrayerRequests = useMemo(() => {
		return prayerRequests?.slice(0, 3) || [];
	}, [prayerRequests]);

	// 게시판
	const {
		data: boardPosts,
		isLoading: isBoardLoading,
		isError: isBoardError,
		error: boardError,
		refetch,
	} = useInfiniteBoardPosts({
		groupId: currentGroup?.groupId || '',
		limit: 10, // 한 페이지에 표시할 게시글 수
	});

	const allPosts = boardPosts?.pages.flatMap((page) => page.items);
	const recentPosts = useMemo(() => {
		return allPosts?.slice(0, 3) || [];
	}, [allPosts]);


	return (
		<>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 28 }}
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
				<VStack className="pt-1 pb-4">
					{latestMainNotice && (
						<NoticeBox
							content={latestMainNotice.mainDisplayText}
							onPress={handlePressNoticeBox}
							onDismiss={handleDismissNotice}
						/>
					)}
					<CoverImageCarousel />
					<VStack className="">
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

					{/* 기도 제목 */}
					<VStack className="mt-3 py-1 items-center justify-center">
						<HStack className="justify-between pl-4 pr-1 items-center w-full">
							<Heading size="xl">최근 기도 제목</Heading>
							<Button variant="text" size='sm' onPress={handleViewMorePrayerRequests}>
								<ButtonText>더보기</ButtonText>
								<ButtonIcon as={ChevronRight} />
							</Button>
						</HStack>
						{isLoading ? (
							<PrayerRequestSkeleton />
						) : recentPrayerRequests.length === 0 ? (
							<VStack space="xs" className="px-4 py-10 text-typography-500">
								<Text className="text-center">
									첫 기도 제목을 작성해보세요.
								</Text>
							</VStack>
						) : (
							<VStack className="w-full">
								{recentPrayerRequests.map((item, index) => (
									<React.Fragment key={item.id}>
										<PrayerRequestCard prayerRequest={item} />
										{index < recentPrayerRequests.length - 1 && (
											<Divider className="bg-background-100 h-[1px]" />
										)}
									</React.Fragment>
								))}
							</VStack>
						)}
						<Button variant="outline" action="secondary" onPress={handlePressAddButton}>
							<ButtonText className="font-pretendard-semi-bold">기도 제목 작성하기</ButtonText>
							<ButtonIcon as={Pen} />
						</Button>
					</VStack>
				</VStack>

				{/* 게시판 최근 글 */}
				<VStack space="md" className="pt-8 pb-14">
					<HStack className="justify-between pl-4 pr-1 items-center">
						<Heading size="xl">게시판 최근 글</Heading>
						<Button variant="text" size='sm' onPress={handleViewMoreBoardPosts}>
							<ButtonText>더보기</ButtonText>
							<ButtonIcon as={ChevronRight} />
						</Button>
					</HStack>
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						<HStack space="md" className="px-4">
							{isBoardLoading ? (
								<HomeBoardPostSkeleton />
							) : recentPosts.length === 0 ? (
								<VStack space="xs" className="py-10 items-center justify-center w-full text-typography-500">
									<Text className="text-center">
										게시글이 없어요.
									</Text>
								</VStack>
							) : (
								recentPosts.map((post) => (
									<HomeBoardPostCard key={post.id} post={post} />
								))
							)}
						</HStack>
					</ScrollView>
				</VStack>
			</ScrollView>
		</>
	);
}

export default HomeList;
