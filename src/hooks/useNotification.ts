import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { getMessaging } from '@react-native-firebase/messaging';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { type Href, router } from 'expo-router';
import { addBadgeCountAsync } from '@/shared/utils/notification_badge';

/**
 * 알림 설정을 초기화하는 함수
 */
function setupNotificationHandler(): void {
	Notifications.setNotificationHandler({
		handleNotification: async () => ({
			shouldShowAlert: true,
			shouldPlaySound: true,
			shouldSetBadge: false,
		}),
	});
}

/**
 * 알림 클릭 이벤트를 처리하는 함수
 */
function handleNotificationClick(
	response: Notifications.NotificationResponse,
): void {
	const screen = response?.notification?.request?.content?.data?.screen as Href;
	if (screen) {
		navigateToScreen(screen);
	}
}

/**
 * 백그라운드에서 푸시 알림을 통해 앱을 열었을 때 처리하는 함수
 */
function setupBackgroundOpenHandler(): void {
	getMessaging().onNotificationOpenedApp((remoteMessage) => {
		if (remoteMessage?.data?.screen) {
			navigateToScreen(remoteMessage.data.screen as Href);
		}
	});
}

/**
 * 완전히 종료된 상태에서 푸시 알림을 통해 앱을 열었을 때 처리하는 함수
 */
function checkAppOpenedFromNotification(): void {
	getMessaging()
		.getInitialNotification()
		.then((remoteMessage) => {
			if (remoteMessage?.data?.screen) {
				navigateToScreen(remoteMessage.data.screen as Href);
			}
		});
}

/**
 * 원격 메시지로부터 로컬 알림을 생성하는 함수
 * @param remoteMessage Firebase 원격 메시지
 */
async function createLocalNotification(
	remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> {
	if (!remoteMessage.notification) return;

	const notification = {
		title: remoteMessage.notification.title,
		body: remoteMessage.notification.body,
		data: remoteMessage.data, // 선택적 데이터 페이로드
	};

	// 즉시 알림을 표시하기 위해 null 트리거로 예약
	await Notifications.scheduleNotificationAsync({
		content: notification,
		trigger: null,
	});

	await addBadgeCountAsync();
}

/**
 * 백그라운드에서 푸시 알림을 처리하는 함수 설정
 */
function setupBackgroundMessageHandler(): void {
	getMessaging().setBackgroundMessageHandler(async (remoteMessage) => {
		await createLocalNotification(remoteMessage);
	});
}

/**
 * 알림 관련 이벤트 구독을 설정하는 훅
 */
/**
 * 알림에서 전달받은 화면 경로로 이동하는 함수
 * @param screen 이동할 화면 경로
 */
function navigateToScreen(screen: Href): void {
	if ((screen as string).includes('(tabs)')) {
		router.replace(screen);
	} else {
		router.push(screen);
	}
}

/**
 * 알림 관련 이벤트 구독을 설정하는 훅
 */
export const useNotification = (): void => {
	useEffect(() => {
		// 알림 핸들러 설정
		setupNotificationHandler();

		// 알림 클릭 이벤트 리스너 등록
		const notificationClickSubscription =
			Notifications.addNotificationResponseReceivedListener(
				handleNotificationClick,
			);

		// 백그라운드에서 알림을 통해 앱을 열었을 때 핸들러 설정
		setupBackgroundOpenHandler();

		// 종료된 상태에서 알림으로 앱을 열었는지 확인
		checkAppOpenedFromNotification();

		// 백그라운드 메시지 핸들러 설정
		setupBackgroundMessageHandler();

		// 포그라운드에서 푸시 알림을 처리하는 리스너 등록
		const unsubscribe = getMessaging().onMessage(async (remoteMessage) => {
			await createLocalNotification(remoteMessage);
		});

		// 이벤트 리스너 정리
		return () => {
			unsubscribe();
			notificationClickSubscription.remove();
		};
	}, []);
};
