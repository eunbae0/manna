import React from 'react';
import { VStack } from '#/components/ui/vstack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotificationList } from '../components/NotificationList';
import { NotificationPermissionBanner } from '../components/NotificationPermissionBanner';
import { NotificationScreenHeader } from '../components/NotificationScreenHeader';
import { useNotificationPermission } from '../hooks/useNotificationPermission';

/**
 * 알림 화면 레이아웃 컴포넌트
 */
export function NotificationScreen() {
	const hasPermission = useNotificationPermission();

	return (
		<VStack className="flex-1">
			<NotificationScreenHeader />
			{hasPermission === false && <NotificationPermissionBanner />}
			<NotificationList />
		</VStack>
	);
}
