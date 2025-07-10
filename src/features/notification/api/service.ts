import {
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	orderBy,
	query,
	updateDoc,
} from '@react-native-firebase/firestore';
import { database } from '@/firebase/config';
import type {
	ClientNotification,
	Notification,
	NotificationService,
} from './types';
import type { ClientGroup, Group } from '@/api/group/types';

/**
 * Firestore 기반 알림 서비스 구현
 */
export class FirestoreNotificationService implements NotificationService {
	private userId: string;

	constructor(userId: string) {
		this.userId = userId;
	}

	/**
	 * 사용자의 모든 알림을 가져옵니다
	 * @returns 알림 목록
	 */
	async getNotifications(): Promise<ClientNotification[]> {
		try {
			const notificationsRef = collection(
				database,
				'users',
				this.userId,
				'notifications',
			);

			const q = query(notificationsRef, orderBy('timestamp', 'desc'));
			const querySnapshot = await getDocs(q);

			const notifications: ClientNotification[] = [];
			const groupDataMap = new Map<
				ClientGroup['id'],
				ClientGroup['groupName']
			>();

			for (const notificationDoc of querySnapshot.docs) {
				const data = notificationDoc.data() as Notification;
				if (!data.metadata.groupId) {
					notifications.push(
						this.convertToClientNotification(notificationDoc.id, data),
					);
					continue;
				}

				if (!groupDataMap.has(data.metadata.groupId)) {
					const groupRef = doc(database, 'groups', data.metadata.groupId);
					const groupDoc = await getDoc(groupRef);
					if (groupDoc.exists()) {
						const groupData = groupDoc.data() as Group;
						groupDataMap.set(data.metadata.groupId, groupData.groupName);
					}
				}

				const clientNotificationData = {
					...data,
					metadata: {
						...data.metadata,
						groupName: groupDataMap.get(data.metadata.groupId),
					},
				};

				notifications.push(
					this.convertToClientNotification(
						notificationDoc.id,
						clientNotificationData,
					),
				);
			}

			return notifications;
		} catch (error) {
			console.error('Error getting notifications:', error);
			throw new Error('알림을 가져오는 중 오류가 발생했어요.');
		}
	}

	/**
	 * 알림을 읽음 상태로 표시합니다
	 * @param notificationId 알림 ID
	 */
	async markAsRead(notificationId: string): Promise<void> {
		try {
			const notificationRef = doc(
				database,
				'users',
				this.userId,
				'notifications',
				notificationId,
			);

			await updateDoc(notificationRef, {
				isRead: true,
			});
		} catch (error) {
			console.error('Error marking notification as read:', error);
			throw new Error('알림을 읽음 상태로 변경하는 중 오류가 발생했어요.');
		}
	}

	/**
	 * 모든 알림을 읽음 상태로 표시합니다
	 */
	async markAllAsRead(): Promise<void> {
		try {
			const notificationsRef = collection(
				database,
				'users',
				this.userId,
				'notifications',
			);

			const q = query(notificationsRef, orderBy('timestamp', 'desc'));
			const querySnapshot = await getDocs(q);

			// 읽지 않은 알림만 필터링
			const unreadNotifications = querySnapshot.docs.filter(
				(doc) => !doc.data().isRead,
			);

			// 각 알림을 읽음 상태로 업데이트
			const updatePromises = unreadNotifications.map(async (docSnapshot) => {
				const notificationRef = doc(
					database,
					'users',
					this.userId,
					'notifications',
					docSnapshot.id,
				);

				return updateDoc(notificationRef, {
					isRead: true,
				});
			});

			// 모든 업데이트 요청 동시 실행
			await Promise.all(updatePromises);
		} catch (error) {
			console.error('Error marking all notifications as read:', error);
			throw new Error('모든 알림을 읽음 상태로 변경하는 중 오류가 발생했어요.');
		}
	}

	/**
	 * 알림을 삭제합니다
	 * @param notificationId 알림 ID
	 */
	async deleteNotification(
		notificationId: string,
	): Promise<ClientNotification> {
		try {
			const notificationRef = doc(
				database,
				'users',
				this.userId,
				'notifications',
				notificationId,
			);

			const docSnapshot = await getDoc(notificationRef);

			if (!docSnapshot.exists()) {
				throw new Error('알림을 찾을 수 없어요.');
			}

			const notification = docSnapshot.data() as Notification;

			await deleteDoc(notificationRef);
			return this.convertToClientNotification(notificationId, notification);
		} catch (error) {
			console.error('Error deleting notification:', error);
			throw new Error('알림을 삭제하는 중 오류가 발생했어요.');
		}
	}

	/**
	 * Firestore 알림 데이터를 클라이언트 알림 객체로 변환합니다
	 * @param notification Firestore 알림 데이터
	 * @returns 클라이언트 알림 객체
	 */
	private convertToClientNotification(
		id: string,
		notification: Notification,
	): ClientNotification {
		const { timestamp, ...rest } = notification;
		return {
			id,
			timestamp: timestamp.toDate(),
			...rest,
		};
	}
}

/**
 * 현재 로그인한 사용자의 알림 서비스 인스턴스를 가져옵니다
 * @param userId 사용자 ID
 * @returns 알림 서비스 인스턴스
 */
export function getNotificationService(userId: string): NotificationService {
	return new FirestoreNotificationService(userId);
}
