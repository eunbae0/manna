import type { Timestamp } from '@react-native-firebase/firestore';

/**
 * 알림 데이터 인터페이스
 */
export interface Notification {
	body: string;
	isRead: boolean;
	metadata: {
		[f: string]: unknown;
		fellowshipId?: string;
		groupId?: string;
		senderId?: string;
	};
	screen?: string;
	timestamp: Timestamp;
	title: string;
}

/**
 * 클라이언트 측 알림 인터페이스
 */
export interface ClientNotification {
	id: string;
	body: string;
	isRead: boolean;
	metadata: {
		[f: string]: unknown;
		fellowshipId?: string;
		groupId?: string;
		senderId?: string;
	};
	screen?: string;
	timestamp: Date;
	title: string;
}

/**
 * 알림 서비스 인터페이스
 */
export interface NotificationService {
	/**
	 * 사용자의 모든 알림을 가져옵니다
	 */
	getNotifications(): Promise<ClientNotification[]>;

	/**
	 * 알림을 읽음 상태로 표시합니다
	 * @param notificationId 알림 ID
	 */
	markAsRead(notificationId: string): Promise<void>;

	/**
	 * 알림을 삭제합니다
	 * @param notificationId 알림 ID
	 */
	deleteNotification(notificationId: string): Promise<void>;
}
