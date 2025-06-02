import React, { useCallback, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 메인 화면 섹션 타입 정의
interface SectionItem {
	id: string;
	title: string;
	key: "fellowship" | "prayerRequest" | "board";
	enabled: boolean;
}

// AsyncStorage 키
const SECTIONS_ORDER_KEY = "@so-group/main-screen-sections-order";

// 기본 섹션 순서
const DEFAULT_SECTIONS: SectionItem[] = [
	{
		id: "1",
		title: "최근 나눔",
		key: "fellowship",
		enabled: true,
	},
	{
		id: "2",
		title: "기도 제목",
		key: "prayerRequest",
		enabled: true,
	},
	{
		id: "3",
		title: "게시판 최근 글",
		key: "board",
		enabled: true,
	},
];
import { RefreshControl } from 'react-native';
import { type Href, router, useFocusEffect } from 'expo-router';
import { Button, ButtonIcon, ButtonText } from '@/components/common/button';
import { Heading } from '@/shared/components/heading';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Pen, ChevronRight, Plus } from 'lucide-react-native';
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
import { useFellowshipStore } from '@/store/createFellowship';
import { useInfiniteFellowships } from '../fellowship/hooks/useInfiniteFellowships';
import FellowshipCard from '../fellowship/components/home/FellowshipCard';
import FellowshipCardSkeleton from '../fellowship/components/home/FellowshipCardSkeleton';
// 화면 포커스 감지를 위해 useFocusEffect 사용

function HomeList() {
	const { currentGroup } = useAuthStore()

	const [refreshing, setRefreshing] = useState(false);
	// 섹션 순서 상태 관리
	const [sections, setSections] = useState<SectionItem[]>(DEFAULT_SECTIONS);

	const queryClient = useQueryClient();

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



	const handlePressAddButton = useCallback(async () => {
		trackAmplitudeEvent('기도제목 작성하기 클릭', { screen: 'Tab_Home' });
		router.navigate('/(app)/createPrayerRequestModal');
	}, []);

	// 숨긴 공지사항 ID 상태 관리
	const [dismissedNoticeIds, setDismissedNoticeIds] = useState<string[]>([]);

	// AsyncStorage에서 숨긴 공지사항 ID와 섹션 순서 불러오기
	const loadData = useCallback(async () => {
		try {
			// 숨긴 공지사항 ID 로드
			const dismissedNoticesJson = await AsyncStorage.getItem('dismissedNoticeIds');
			if (dismissedNoticesJson) {
				setDismissedNoticeIds(JSON.parse(dismissedNoticesJson));
			}
			// 섹션 순서 로드
			const sectionsOrderJson = await AsyncStorage.getItem(SECTIONS_ORDER_KEY);
			if (sectionsOrderJson) {
				const savedSections = JSON.parse(sectionsOrderJson);
				setSections(savedSections);
			}
		} catch (error) {
			console.error('Failed to load data from AsyncStorage:', error);
		}
	}, []);

	// 화면이 포커스를 받을 때마다 데이터 다시 로드
	useFocusEffect(
		useCallback(() => {
			loadData();
		}, [loadData])
	);

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

	const { setType } = useFellowshipStore()

	const handlePressCreateFellowship = useCallback(() => {
		trackAmplitudeEvent('나눔 만들기 클릭', { screen: 'Tab_Home' });
		setType('CREATE');
		router.push('/(app)/(fellowship)/create');
	}, [setType]);

	const handleViewMoreFellowships = useCallback(() => {
		trackAmplitudeEvent('나눔 더보기 클릭', { screen: 'Tab_Home' });
		router.push('/(app)/(fellowship)/list');
	}, []);

	const handleViewMorePrayerRequests = useCallback(() => {
		trackAmplitudeEvent('기도 제목 더보기 클릭', { screen: 'Tab_Home' });
		router.push('/(app)/(prayerRequest)/list');
	}, []);


	const handleViewMoreBoardPosts = useCallback(() => {
		trackAmplitudeEvent('게시판 더보기 클릭', { screen: 'Tab_Home' });
		router.push('/(app)/(board)/board-index');
	}, []);

	// 최근 나눔
	const {
		data: fellowshipData,
		isLoading: isFellowshipLoading,
		isError: isFellowshipError,
		refetch: refetchFellowships,
	} = useInfiniteFellowships(8);

	const fellowships = React.useMemo(() => {
		if (!fellowshipData || !fellowshipData.pages) return [];
		return fellowshipData.pages.flatMap(page => page.items).slice(0, 3);
	}, [fellowshipData]);

	// 기도 제목
	const {
		prayerRequests,
		isLoading,
		refetch: refetchPrayerRequests,
		isError: isPrayerRequestError,
	} = usePrayerRequests();

	const recentPrayerRequests = useMemo(() => {
		return prayerRequests?.slice(0, 3) || [];
	}, [prayerRequests]);

	// 게시판
	const {
		data: boardPosts,
		isLoading: isBoardLoading,
		isError: isBoardError,
		refetch: refetchBoardPosts,
	} = useInfiniteBoardPosts({
		groupId: currentGroup?.groupId || '',
		limit: 10, // 한 페이지에 표시할 게시글 수
	});

	const allPosts = boardPosts?.pages.flatMap((page) => page.items);
	const recentPosts = useMemo(() => {
		return allPosts?.slice(0, 3) || [];
	}, [allPosts]);

	// 섹션 렌더링 컴포넌트
	const renderFellowshipSection = useCallback(() => {
		return (
			<VStack className="mt-3 py-1 items-center justify-center">
				<HStack className="justify-between pl-4 pr-1 items-center w-full">
					<Heading size="xl">최근 나눔</Heading>
					<Button variant="text" size='sm' onPress={handleViewMoreFellowships}>
						<ButtonText>더보기</ButtonText>
						<ButtonIcon as={ChevronRight} />
					</Button>
				</HStack>
				{isFellowshipLoading ? (
					<ScrollView horizontal scrollEnabled={false}>
						<HStack space="md" className="ml-4 my-4 justify-start">
							<FellowshipCardSkeleton />
							<FellowshipCardSkeleton />
						</HStack>
					</ScrollView>
				) : isFellowshipError ? (
					<VStack space="xs" className="px-4 pt-10 pb-6">
						<Text className="text-center text-error-500">
							나눔을 불러오는 중 오류가 발생했어요.
						</Text>
						<Button
							variant="outline"
							size="sm"
							className="self-center mt-4"
							onPress={() => refetchFellowships()}
						>
							<Text>다시 시도하기</Text>
						</Button>
					</VStack>
				) : fellowships.length === 0 ? (
					<VStack space="xl" className="px-4 pt-10 pb-6 text-typography-500">
						<Text className="text-center">
							그룹의 첫 나눔을 만들어보세요.
						</Text>
						<Button variant="outline" action="secondary" onPress={handlePressCreateFellowship}>
							<ButtonText className="font-pretendard-semi-bold">나눔 만들기</ButtonText>
							<ButtonIcon as={Plus} />
						</Button>
					</VStack>
				) : (
					<ScrollView className="px-4 pt-4 pb-4" horizontal showsHorizontalScrollIndicator={false}>
						<HStack space="md" className="w-full">
							{fellowships.map((item) => (
								<FellowshipCard key={item.identifiers.id} fellowship={item} />
							))}
						</HStack>
					</ScrollView>
				)}
			</VStack>
		);
	}, [fellowships, isFellowshipLoading, isFellowshipError, handleViewMoreFellowships, refetchFellowships, handlePressCreateFellowship]);

	const renderPrayerRequestSection = useCallback(() => {
		return (
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
				) : isPrayerRequestError ? (
					<VStack space="xs" className="px-4 pt-10 pb-6">
						<Text className="text-center text-error-500">
							기도 제목을 불러오는 중 오류가 발생했어요.
						</Text>
						<Button
							variant="outline"
							size="sm"
							className="self-center mt-4"
							onPress={() => refetchPrayerRequests()}
						>
							<Text>다시 시도하기</Text>
						</Button>
					</VStack>
				) : recentPrayerRequests.length === 0 ? (
					<VStack space="xs" className="px-4 pt-10 pb-6 text-typography-500">
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
		);
	}, [recentPrayerRequests, isLoading, isPrayerRequestError, handleViewMorePrayerRequests, refetchPrayerRequests, handlePressAddButton]);

	const renderBoardSection = useCallback(() => {
		return (
			<VStack space="md" className="pt-8">
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
						) : isBoardError ? (
							<VStack space="xs" className="py-10 pl-24 items-center justify-center w-full">
								<Text className="text-center text-error-500">
									게시글을 불러오는 중 오류가 발생했어요.
								</Text>
								<Button
									variant="outline"
									size="sm"
									className="self-center mt-4"
									onPress={() => refetchBoardPosts()}
								>
									<Text>다시 시도하기</Text>
								</Button>
							</VStack>
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
		);
	}, [recentPosts, isBoardLoading, isBoardError, handleViewMoreBoardPosts, refetchBoardPosts]);

	// 섹션 렌더링 맵
	const sectionRenderers = {
		fellowship: renderFellowshipSection,
		prayerRequest: renderPrayerRequestSection,
		board: renderBoardSection,
	};

	// Handle pull-to-refresh
	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await Promise.all([
				refetchFellowships(),
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
	}, [refetchFellowships, refetchPrayerRequests, refetchNotifications, refetchNotices, queryClient]);

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
				<VStack className="pt-1">
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
				</VStack>

				<VStack space="2xl" className="pb-14">
					{sections
						.filter(section => section.enabled)
						.map(section => {
							const renderSection = sectionRenderers[section.key];
							return (
								<React.Fragment key={section.id}>
									{renderSection()}
								</React.Fragment>
							);
						})
					}
				</VStack>
			</ScrollView>
		</>
	);
}

export default HomeList;
