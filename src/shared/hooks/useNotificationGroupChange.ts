import { useGlobalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';

/**
 * 알림을 통해 전달된 그룹 ID와 이름으로 현재 그룹을 변경하는 훅
 * 알림에서 앱을 열 때 그룹 컨텍스트를 자동으로 변경하는 데 사용
 */
export function useNotificationGroupChange(): void {
	const { showInfo } = useToastStore();
	const { currentGroup, updateCurrentGroup } = useAuthStore();
	const params = useGlobalSearchParams<{
		notificationGroupId?: string;
		notificationGroupName?: string;
	}>();

	useEffect(() => {
		const notificationGroupId = params.notificationGroupId;
		const notificationGroupName = params.notificationGroupName;

		if (notificationGroupId && notificationGroupName && currentGroup) {
			// 현재 선택된 그룹과 다른 경우에만 그룹 변경
			if (currentGroup.groupId !== notificationGroupId) {
				updateCurrentGroup({ groupId: notificationGroupId });
				showInfo(`${notificationGroupName} 그룹으로 이동했어요`);
			}
		}
	}, [params, currentGroup, updateCurrentGroup, showInfo]);
}
