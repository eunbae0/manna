import React, { useCallback } from 'react';
import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';
import { HStack } from '#/components/ui/hstack';
import { Icon } from '#/components/ui/icon';
import { Bell, HandHeart, MessageCircle, MessageSquareText, NotebookPen, Trash2Icon } from 'lucide-react-native';
import type { ClientNotification } from '../api/types';
import { formatRelativeTime } from '@/shared/utils/formatRelativeTime';
import { Dimensions, StyleSheet, View, Pressable } from 'react-native';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
	runOnJS,
	Easing,
} from 'react-native-reanimated';
import {
	GestureDetector,
	Gesture,
	GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { cn } from '@/shared/utils/cn';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import { trackAmplitudeEvent } from '@/shared/utils/amplitude';
import { Box } from '#/components/ui/box';
import AnimatedPressable from '@/components/common/animated-pressable';

/**
 * 알림 아이템 컴포넌트 Props
 */
export type NotificationItemProps = {
	item: ClientNotification;
	onPress: (notification: {
		id: string;
		isRead: boolean;
		screen?: string;
	}) => void;
	onDelete: (id: string) => void;
	isDeleting: boolean;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DELETE_BUTTON_WIDTH = 80;
const SWIPE_THRESHOLD = DELETE_BUTTON_WIDTH * 0.3;

/**
 * 알림 아이템 컴포넌트
 */
export function NotificationItem({
	item,
	onPress,
	onDelete,
	isDeleting,
}: NotificationItemProps) {
	const translateX = useSharedValue(0);
	const isSwipeOpen = useSharedValue(false);

	const animatedContentStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: translateX.value }],
		};
	});

	const deleteButtonContainerStyle = useAnimatedStyle(() => {
		return {
			width: Math.abs(Math.min(translateX.value, 0)),
			position: 'absolute',
			right: 0,
			height: '100%',
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: '#ef4444', // bg-red-500
		};
	});

	const panGesture = Gesture.Pan()
		// 수직 스크롤과의 충돌 방지를 위한 설정
		.activeOffsetX([-10, 10]) // 수평으로 10px 이상 움직여야 활성화
		.failOffsetY([-20, 20]) // 수직으로 20px 이상 움직이면 제스처 실패 처리
		.onBegin((event) => {
			// 수직 방향 스크롤 중에는 스와이프 비활성화
			if (Math.abs(event.velocityY) > Math.abs(event.velocityX) * 2) {
				return;
			}
		})
		.onUpdate((event) => {
			// 왼쪽으로만 스와이프 가능하도록 제한
			if (event.translationX <= 0) {
				// 최대 DELETE_BUTTON_WIDTH만큼만 스와이프 가능
				const newTranslateX = Math.max(
					event.translationX,
					-DELETE_BUTTON_WIDTH,
				);
				translateX.value = isSwipeOpen.value
					? -DELETE_BUTTON_WIDTH + newTranslateX
					: newTranslateX;
			} else if (isSwipeOpen.value) {
				// 열려있는 상태에서 오른쪽으로 스와이프할 때
				const newTranslateX = Math.min(
					event.translationX - DELETE_BUTTON_WIDTH,
					0,
				);
				translateX.value = newTranslateX;
			}
		})
		.onEnd((event) => {
			// 빠르게 스와이프하거나 충분히 스와이프했을 때 열림/닫힘
			if (isSwipeOpen.value) {
				// 이미 열려있는 경우
				if (event.translationX > SWIPE_THRESHOLD || event.velocityX > 500) {
					// 충분히 오른쪽으로 스와이프했으면 닫기
					translateX.value = withTiming(0, {
						duration: 200,
						easing: Easing.bezier(0.25, 0.1, 0.25, 1),
					});
					isSwipeOpen.value = false;
				} else {
					// 그렇지 않으면 열린 상태 유지
					translateX.value = withTiming(-DELETE_BUTTON_WIDTH, {
						duration: 200,
						easing: Easing.bezier(0.25, 0.1, 0.25, 1),
					});
				}
			} else {
				// 닫혀있는 경우
				if (event.translationX < -SWIPE_THRESHOLD || event.velocityX < -500) {
					// 충분히 왼쪽으로 스와이프했으면 열기
					translateX.value = withTiming(-DELETE_BUTTON_WIDTH, {
						duration: 200,
						easing: Easing.bezier(0.25, 0.1, 0.25, 1),
					});
					isSwipeOpen.value = true;
				} else {
					// 그렇지 않으면 닫힌 상태 유지
					translateX.value = withTiming(0, {
						duration: 200,
						easing: Easing.bezier(0.25, 0.1, 0.25, 1),
					});
				}
			}
		});

	// 아이템 탭 핸들러
	const { currentGroup, updateCurrentGroup } = useAuthStore();
	const { showInfo } = useToastStore();

	const onItemPress = useCallback(() => {
		// 스와이프가 열려있으면 닫기만 하고, 닫혀있으면 onPress 실행
		if (isSwipeOpen.value) {
			translateX.value = withTiming(0, {
				duration: 200,
				easing: Easing.bezier(0.25, 0.1, 0.25, 1),
			});
			isSwipeOpen.value = false;
		} else {
			// 그룹 ID가 있고 현재 선택된 그룹과 다르면 그룹 변경
			const notificationGroupId = item.metadata?.groupId;
			const notificationGroupName = item.metadata?.groupName;

			if (
				notificationGroupId &&
				notificationGroupName &&
				currentGroup?.groupId !== notificationGroupId
			) {
				// 현재 그룹 변경
				updateCurrentGroup({ groupId: notificationGroupId });
				// 토스트 메시지 표시
				showInfo(`${notificationGroupName} 그룹으로 이동했어요`);
			}

			// 기존 onPress 함수 호출
			onPress(item);

			// Amplitude Logging
			// trackAmplitudeEvent('Open Notification', {
			// 	screen: 'Tab_Notification',
			// 	notificationId: item.id,
			// });
		}
	}, [
		item,
		onPress,
		isSwipeOpen,
		translateX,
		currentGroup,
		updateCurrentGroup,
		showInfo,
	]);

	// 삭제 버튼 핸들러
	const handleDelete = useCallback(() => {
		// 애니메이션과 함께 아이템 삭제
		translateX.value = withTiming(
			-SCREEN_WIDTH,
			{
				duration: 300,
				easing: Easing.bezier(0.25, 0.1, 0.25, 1),
			},
			() => {
				// 애니메이션 완료 후 실제 삭제 함수 호출
				runOnJS(onDelete)(item.id);
			},
		);
	}, [item.id, onDelete, translateX]);

	const titleToIcon = useCallback((title: string) => {
		if (title.includes('새 나눔')) {
			return MessageSquareText;
		}
		if (title.includes('댓글')) {
			return MessageCircle;
		}
		if (title.includes('기도제목')) {
			return HandHeart;
		}
		if (title.includes('새 게시글')) {
			return NotebookPen;
		}
		return Bell;
	}, []);

	return (
		<GestureHandlerRootView style={styles.container}>
			<View style={styles.itemContainer}>
				{/* 삭제 버튼 (뒤에 위치) */}
				<Animated.View style={deleteButtonContainerStyle}>
					<Pressable
						onPress={handleDelete}
						disabled={isDeleting}
						style={styles.deleteButton}
					>
						<Icon as={Trash2Icon} size="md" color="white" />
					</Pressable>
				</Animated.View>

				{/* 스와이프 가능한 아이템 컨텐츠 */}
				<GestureDetector gesture={panGesture}>
					<Animated.View
						style={animatedContentStyle}
						className={cn('w-full', item.isRead ? '' : 'bg-primary-100')}
					>
						<AnimatedPressable onPress={onItemPress} className="w-full">
							<HStack space="sm" className="px-5 py-5 justify-start">
								<Box className="w-6 h-6 bg-primary-200/50 rounded-full items-center justify-center">
									<Icon
										as={titleToIcon(item.title)}
										size="xs"
										className="text-primary-500"
									/>
								</Box>
								<VStack space="xs" className="flex-1 ml-1">
									<VStack space="xs">
										<HStack className="justify-between items-center">
											<HStack space="sm" className="mt-[2px] items-center flex-wrap">
												{item.metadata?.groupName && (
													<HStack space="sm" className="items-center">
														<Text
															size="sm"
															className="text-typography-600"
														>
															{item.metadata.groupName}
														</Text>
														<Box className="w-[2px] h-[2px] bg-typography-600 rounded-full" />
													</HStack>
												)}

												<Text size="sm" className="text-typography-600">
													{item.title}
												</Text>
											</HStack>
											<Text size="sm" className="text-typography-500">
												{formatRelativeTime(item.timestamp)}
											</Text>
										</HStack>
									</VStack>
									<Text size="lg" weight="medium" className="text-typography-700">{item.body}</Text>
								</VStack>
							</HStack>
						</AnimatedPressable>
					</Animated.View>
				</GestureDetector>
			</View>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
	},
	itemContainer: {
		position: 'relative',
		overflow: 'hidden',
	},
	deleteButton: {
		height: '100%',
		width: DELETE_BUTTON_WIDTH,
		justifyContent: 'center',
		alignItems: 'center',
	},
	itemContent: {
		width: '100%',
		backgroundColor: 'white',
	},
});
