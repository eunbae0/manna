import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { VStack } from '#/components/ui/vstack';
import { Text } from '@/shared/components/text';
import { NotificationSettingItem } from '../components/NotificationSettingItem';
import { useToastStore } from '@/store/toast';
import type { ClientGroup } from '@/api/group/types';
import Header from '@/components/common/Header';
import { useLocalSearchParams } from 'expo-router';
import { trackAmplitudeEvent } from '@/shared/utils/amplitude';
import { useAuthStore } from '@/store/auth';
import { useGroups } from '@/features/group/hooks/useGroups';

/**
 * 게시판 알림 설정 화면
 */
export default function BoardNotificationSettingScreen() {
	const { groupId } = useLocalSearchParams<{ groupId: string }>();
	const { showSuccess, showError } = useToastStore();
	const { user, updateUserGroupProfile } = useAuthStore();

	const { groups } = useGroups(user?.groups ?? []);

	// 알림 설정 변경 핸들러
	const handleBoardNotificationChange = (
		type: 'activity' | 'newPost',
		value: boolean,
	) => {
		if (!groupId) return;

		// 현재 그룹의 사용자 정보 찾기
		const userGroup = user?.groups?.find((ug) => ug.groupId === groupId);

		if (!userGroup) {
			showError('사용자 정보를 찾을 수 없어요');
			return;
		}

		// 이벤트 추적
		trackAmplitudeEvent('게시판 알림 설정 변경', {
			groupId,
			type,
			value,
		});

		// 알림 설정 업데이트
		updateUserGroupProfile(user?.id ?? '', {
			...userGroup,
			notificationPreferences: {
				fellowship: userGroup.notificationPreferences.fellowship,
				prayerRequest: userGroup.notificationPreferences.prayerRequest,
				board: {
					...userGroup.notificationPreferences.board,
					[type]: value,
				},
			},
		});
	};

	// 게시판 활동 알림 설정 상태
	const activityEnabled =
		user?.groups?.find((g) => g.groupId === groupId)?.notificationPreferences
			?.board?.activity ?? true;

	// 새 게시글 알림 설정 상태
	const newPostEnabled =
		user?.groups?.find((g) => g.groupId === groupId)?.notificationPreferences
			?.board?.newPost ?? true;

	return (
		<SafeAreaView className="flex-1 bg-white">
			<Header label={groups.find((g) => g.id === groupId)?.groupName ?? ''} />
			<ScrollView className="flex-1">
				<VStack className="mt-8 px-5 gap-10">
					<NotificationSettingItem
						title="활동 알림"
						description="내 게시글에 댓글이나 좋아요가 달렸을 때 알림"
						enabled={activityEnabled}
						onValueChange={(value) =>
							handleBoardNotificationChange('activity', value)
						}
					/>
					<NotificationSettingItem
						title="새 게시글 알림"
						description="새로운 게시글이 작성되었을 때 알림"
						enabled={newPostEnabled}
						onValueChange={(value) =>
							handleBoardNotificationChange('newPost', value)
						}
					/>
				</VStack>
			</ScrollView>
		</SafeAreaView>
	);
}
