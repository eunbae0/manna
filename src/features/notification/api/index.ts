import { auth } from '@/firebase/config';
import { handleApiError } from '../../../api/errors';
import { withApiLogging } from '../../../api/utils/logger';
import { getNotificationService } from './service';
import type { ClientNotification } from './types';

/**
 * 사용자의 모든 알림을 가져옵니다
 */
export const getNotifications = withApiLogging(
	async (): Promise<ClientNotification[]> => {
		try {
			const user = auth.currentUser;
			if (!user) {
				throw new Error('로그인이 필요해요.');
			}

			const notificationService = getNotificationService(user.uid);
			return await notificationService.getNotifications();
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'getNotifications',
	'notification',
);

/**
 * 알림을 읽음 상태로 표시합니다
 * @param notificationId 알림 ID
 */
export const markNotificationAsRead = withApiLogging(
	async (notificationId: string): Promise<void> => {
		try {
			const user = auth.currentUser;
			if (!user) {
				throw new Error('로그인이 필요해요.');
			}

			const notificationService = getNotificationService(user.uid);
			await notificationService.markAsRead(notificationId);
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'markNotificationAsRead',
	'notification',
);

/**
 * 알림을 삭제합니다
 * @param notificationId 알림 ID
 */
export const deleteNotification = withApiLogging(
	async (notificationId: string): Promise<ClientNotification> => {
		try {
			const user = auth.currentUser;
			if (!user) {
				throw new Error('로그인이 필요해요.');
			}

			const notificationService = getNotificationService(user.uid);
			return await notificationService.deleteNotification(notificationId);
		} catch (error) {
			throw handleApiError(error);
		}
	},
	'deleteNotification',
	'notification',
);
