import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';

/**
 * 알림 권한 상태를 확인하는 훅
 * @returns {boolean | null} 알림 권한 상태 (true: 허용, false: 거부, null: 확인 중)
 */
export function useNotificationPermission() {
	const [hasPermission, setHasPermission] = useState<boolean | null>(null);

	useEffect(() => {
		checkNotificationPermission();
	}, []);

	const checkNotificationPermission = async () => {
		const { status } = await Notifications.getPermissionsAsync();
		setHasPermission(status === 'granted');
	};

	return {
		hasPermission,
		checkNotificationPermission,
	};
}
