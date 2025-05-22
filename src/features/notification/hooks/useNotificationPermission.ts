import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useAppFocusState } from '@/shared/hooks/useAppFocusState';

/**
 * 알림 권한 상태를 확인하는 훅
 *
 * 앱이 활성화되거나 백그라운드에서 돌아왔을 때 알림 권한을 다시 확인합니다.
 * 사용자가 앱 설정에서 권한을 변경한 경우를 감지할 수 있습니다.
 */
export function useNotificationPermission() {
	const [hasPermission, setHasPermission] = useState<boolean | null>(null);
	const { isActive, isReturningFromBackground } = useAppFocusState();

	// 앱이 활성화되었을 때 알림 권한 확인
	useEffect(() => {
		if (isActive) {
			checkNotificationPermission();
		}
	}, [isActive]);

	// 앱이 백그라운드에서 돌아왔을 때 알림 권한 다시 확인
	useEffect(() => {
		if (isReturningFromBackground) {
			checkNotificationPermission();
		}
	}, [isReturningFromBackground]);

	const checkNotificationPermission = async () => {
		try {
			const { status } = await Notifications.getPermissionsAsync();
			setHasPermission(status === 'granted');
		} catch (error) {
			console.warn('Failed to check notification permission:', error);
			setHasPermission(false);
		}
	};

	return hasPermission;
}
