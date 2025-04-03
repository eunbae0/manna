import React, { useEffect } from 'react';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Box } from '#/components/ui/box';
import { FlatList, RefreshControl } from 'react-native';
import { useNotifications } from '../hooks/useNotifications';
import { type Href, router, useFocusEffect } from 'expo-router';
import { Button } from '@/components/common/button';
import { useToastStore } from '@/store/toast';
import { EmptyState } from '@/components/common/empty-state';
import { NotificationItem } from './NotificationItem';
import type { ClientNotification } from '../api/types';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
	Easing,
} from 'react-native-reanimated';
import { setBadgeCountAsync } from 'expo-notifications';

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

	return (
		<VStack space="md" className="p-4">
			{/* 알림 아이템 스켈레톤 - 정적 요소 사용 */}
			<VStack space="sm" className="p-4 bg-white rounded-lg">
				<HStack className="justify-between items-center">
					<SkeletonItem className="h-5 w-32 bg-background-200 rounded-md" />
					<SkeletonItem className="h-4 w-20 bg-background-200 rounded-md" />
				</HStack>
				<SkeletonItem className="h-6 w-full bg-background-200 rounded-md" />
			</VStack>

			<VStack space="sm" className="p-4 bg-white rounded-lg">
				<HStack className="justify-between items-center">
					<SkeletonItem className="h-5 w-32 bg-background-200 rounded-md" />
					<SkeletonItem className="h-4 w-20 bg-background-200 rounded-md" />
				</HStack>
				<SkeletonItem className="h-6 w-full bg-background-200 rounded-md" />
			</VStack>

			<VStack space="sm" className="p-4 bg-white rounded-lg">
				<HStack className="justify-between items-center">
					<SkeletonItem className="h-5 w-32 bg-background-200 rounded-md" />
					<SkeletonItem className="h-4 w-20 bg-background-200 rounded-md" />
				</HStack>
				<SkeletonItem className="h-6 w-full bg-background-200 rounded-md" />
			</VStack>

			<VStack space="sm" className="p-4 bg-white rounded-lg">
				<HStack className="justify-between items-center">
					<SkeletonItem className="h-5 w-32 bg-background-200 rounded-md" />
					<SkeletonItem className="h-4 w-20 bg-background-200 rounded-md" />
				</HStack>
				<SkeletonItem className="h-6 w-full bg-background-200 rounded-md" />
			</VStack>

			<VStack space="sm" className="p-4 bg-white rounded-lg">
				<HStack className="justify-between items-center">
					<SkeletonItem className="h-5 w-32 bg-background-200 rounded-md" />
					<SkeletonItem className="h-4 w-20 bg-background-200 rounded-md" />
				</HStack>
				<SkeletonItem className="h-6 w-full bg-background-200 rounded-md" />
			</VStack>
		</VStack>
	);
}

export function NotificationList() {
	const {
		notifications,
		isLoading,
		isError,
		refetch,
		markAsRead,
		deleteNotification,
		unreadCount,
		isDeleting,
	} = useNotifications();

	const { showToast } = useToastStore();

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

	useFocusEffect(() => {
		refetch();
	});

	useEffect(() => {
		if (unreadCount > 0) {
			setBadgeCountAsync(unreadCount);
		}
	}, [unreadCount]);

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
		);
	}

	return (
		<FlatList
			data={notifications}
			keyExtractor={(item: { id: string }) => item.id}
			refreshControl={
				<RefreshControl refreshing={isLoading} onRefresh={refetch} />
			}
			renderItem={({ item }: { item: ClientNotification }) => (
				<NotificationItem
					item={item}
					onPress={handleNotificationPress}
					onDelete={handleDeleteNotification}
					isDeleting={isDeleting}
				/>
			)}
		/>
	);
}
