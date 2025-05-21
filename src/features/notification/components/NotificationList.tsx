import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Box } from '#/components/ui/box';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { useNotifications } from '../hooks/useNotifications';
import { type Href, router } from 'expo-router';
import { Button } from '@/components/common/button';
import { useToastStore } from '@/store/toast';
import { EmptyState } from '@/components/common/empty-state';
import { NotificationItem } from './NotificationItem';
import { useAuthStore } from '@/store/auth';
import { Text } from '@/shared/components/text';
import { useState, useMemo } from 'react';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
	Easing,
} from 'react-native-reanimated';
import { useRefetchOnFocus } from '@/shared/hooks/useRefetchOnFocus';
import { useGroups } from '@/features/home/group/hooks/useGroups';
import type { ClientGroup } from '@/api/group/types';
import AnimatedPressable from '@/components/common/animated-pressable';
import { cn } from '@/shared/utils/cn';
import { Check, LoaderCircle } from 'lucide-react-native';
import { Icon } from '#/components/ui/icon';
import { FlashList } from '@shopify/flash-list';

/**
 * 알림 목록 스켈레톤 UI 컴포넌트
 * 데이터 로딩 중에 표시되는 로딩 플레이스홀더
 */
function NotificationSkeleton() {
	// 애니메이션 설정
	const opacity = useSharedValue(0.5);

	// 컴포넌트 마운트 시 애니메이션 시작
	opacity.value = withRepeat(
		withTiming(1, {
			duration: 1000,
			easing: Easing.bezier(0.25, 0.1, 0.25, 1),
		}),
		-1, // 무한 반복
		true, // 애니메이션 역방향 실행
	);

	// 애니메이션 스타일 생성
	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
	}));

	// 스켈레톤 아이템 컴포넌트
	const SkeletonItem = ({ className }: { className: string }) => (
		<Animated.View style={animatedStyle}>
			<Box className={className} />
		</Animated.View>
	);

	const renderSkeletonItem = () => (
		<VStack space="sm" className="p-4 bg-white rounded-lg mb-3">
			<HStack className="justify-between items-center">
				<SkeletonItem className="h-5 w-32 bg-background-200 rounded-md" />
				<SkeletonItem className="h-4 w-20 bg-background-200 rounded-md" />
			</HStack>
			<SkeletonItem className="h-6 w-full bg-background-200 rounded-md" />
		</VStack>
	);

	const skeletonData = Array(5).fill({ id: null });


	return (
		<View className="flex-1">
			<FlashList
				data={skeletonData}
				renderItem={renderSkeletonItem}
				estimatedItemSize={120} // 각 아이템의 대략적인 높이 (px)
				keyExtractor={(_, index) => `skeleton-${index}`}
				showsVerticalScrollIndicator={false}
				scrollEnabled={false} // 스켈레톤이 스크롤되지 않도록 설정
			/>
		</View>
	);
}

/**
 * 그룹 필터 태그 컴포넌트
 */
function GroupFilterTag({
	label,
	isSelected,
	onPress,
}: {
	label: string;
	isSelected: boolean;
	onPress: () => void;
}) {
	return (
		<AnimatedPressable onPress={onPress}>
			<Box
				className={cn('px-3 py-1.5 rounded-full items-center justify-center mr-2', {
					'bg-primary-500': isSelected,
					'bg-gray-200': !isSelected,
				})}
			>
				<Text
					size="xs"
					className={cn('font-pretendard-Medium', {
						'text-white': isSelected,
						'text-gray-700': !isSelected,
					})}
				>
					{label}
				</Text>
			</Box>
		</AnimatedPressable>
	);
}

/**
 * 그룹 정보를 포함한 필터 아이템 타입
 */
type GroupFilterItem = {
	groupId: string;
	groupName: string;
};

export function NotificationList() {
	const {
		notifications,
		isLoading,
		isError,
		refetch,
		markAsRead,
		markAllAsRead,
		deleteNotification,
		unreadCount,
		isDeleting,
		isMarkingAllAsRead,
	} = useNotifications();

	const { user } = useAuthStore();
	const { showToast } = useToastStore();

	// 선택된 그룹 필터 (null이면 '전체')
	const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

	// 사용자의 그룹 목록
	const userGroups = useMemo(() => {
		return user?.groups || [];
	}, [user?.groups]);

	// useGroups 훅을 사용하여 그룹 정보 가져오기
	const { groups: groupsData, isLoading: isGroupsLoading } =
		useGroups(userGroups);

	// 필터링을 위한 그룹 정보 처리
	const groupFilterItems: GroupFilterItem[] = useMemo(() => {
		if (!groupsData || groupsData.length === 0) return [];

		return groupsData.map((group: ClientGroup) => ({
			groupId: group.id,
			groupName: group.groupName,
		}));
	}, [groupsData]);

	// 필터링된 알림 목록
	const filteredNotifications = useMemo(() => {
		if (!selectedGroupId) {
			return notifications; // '전체' 선택 시 모든 알림 표시
		}

		return notifications.filter(
			(notification) => notification.metadata.groupId === selectedGroupId,
		);
	}, [notifications, selectedGroupId]);

	const handleNotificationPress = (notification: {
		id: string;
		isRead: boolean;
		screen?: string;
	}) => {
		if (!notification.isRead) {
			markAsRead(notification.id);
		}

		if (notification.screen) {
			try {
				router.push(notification.screen as Href);
			} catch (error) {
				console.error('Navigation error:', error);
			}
		}
	};

	const handleDeleteNotification = (id: string) => {
		deleteNotification(id);
		showToast({
			message: '알림이 삭제되었어요.',
			type: 'success',
		});
	};

	useRefetchOnFocus(refetch);

	// 모든 알림 읽음 처리 핸들러
	const handleMarkAllAsRead = () => {
		markAllAsRead();
		showToast({
			message: "모든 알림을 읽음으로 표시했어요.",
			type: "success",
		});
	};

	// 그룹 필터 태그 렌더링 함수
	const renderGroupFilterTags = () => {
		return (
			<Box className="py-2 px-5 h-12 overflow-hidden">
				<HStack className="justify-between">
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						className="h-full flex-1"
					>
						<HStack className="items-center h-full">
							{/* '전체' 필터 태그 */}
							<GroupFilterTag
								label="전체"
								isSelected={selectedGroupId === null}
								onPress={() => setSelectedGroupId(null)}
							/>

							{/* 사용자의 소그룹 필터 태그 */}
							{isGroupsLoading ? (
								<>
									{/* 로딩 스켈레톤 태그 */}
									{[1, 2].map((i) => (
										<Box
											key={`skeleton-${i}`}
											className="px-3 py-1.5 rounded-full mr-2 bg-gray-200 animate-pulse"
										>
											<Box className="w-16 h-4" />
										</Box>
									))}
								</>
							) : (
								groupFilterItems.map((group) => (
									<GroupFilterTag
										key={group.groupId}
										label={group.groupName}
										isSelected={selectedGroupId === group.groupId}
										onPress={() => setSelectedGroupId(group.groupId)}
									/>
								))
							)}
						</HStack>
					</ScrollView>

					{/* 모두 읽음 버튼 (읽지 않은 알림이 있을 때만 표시) */}
					{unreadCount > 0 && (
						<AnimatedPressable onPress={handleMarkAllAsRead}>
							<HStack space="xs" className="items-center border border-primary-500 rounded-full px-3 py-1">
								<Text size="sm">모두 읽음</Text>
								<Icon size="xs" as={isMarkingAllAsRead ? LoaderCircle : Check} />
							</HStack>
						</AnimatedPressable>
					)}
				</HStack>
			</Box>
		);
	};

	if (isLoading) {
		return <NotificationSkeleton />;
	}

	if (isError) {
		return (
			<VStack className="flex-1 items-center justify-center">
				<EmptyState
					title="알림을 불러올 수 없어요"
					description="잠시 후 다시 시도해주세요"
				/>
				<Button className="mt-4" onPress={() => refetch()}>
					다시 시도하기
				</Button>
			</VStack>
		);
	}

	if (notifications.length === 0) {
		return (
			<VStack className="flex-1">
				{renderGroupFilterTags()}
				<FlatList
					data={[]}
					keyExtractor={() => 'empty'}
					renderItem={() => null}
					refreshControl={
						<RefreshControl refreshing={isLoading} onRefresh={refetch} />
					}
					ListEmptyComponent={
						<VStack className="flex-1 items-center justify-center py-20">
							<EmptyState
								title="알림이 없어요"
								description="새로운 알림이 오면 여기에 표시됩니다"
							/>
						</VStack>
					}
				/>
			</VStack>
		);
	}

	// 필터링된 알림이 없는 경우
	const isFilteredEmpty =
		selectedGroupId !== null && filteredNotifications.length === 0;

	return (
		<VStack className="flex-1">
			{renderGroupFilterTags()}
			<FlashList
				data={filteredNotifications}
				keyExtractor={(item) => item.id}
				refreshControl={
					<RefreshControl refreshing={isLoading} onRefresh={refetch} />
				}
				renderItem={({ item }) => (
					<NotificationItem
						item={item}
						onPress={handleNotificationPress}
						onDelete={handleDeleteNotification}
						isDeleting={isDeleting}
					/>
				)}
				estimatedItemSize={85}
				ListEmptyComponent={
					isFilteredEmpty ? (
						<VStack className="flex-1 items-center justify-center py-20">
							<EmptyState
								title="해당 그룹의 알림이 없어요"
								description="다른 그룹을 선택하거나 전체 알림을 확인해보세요"
							/>
						</VStack>
					) : null
				}
			/>
		</VStack>
	);
}
