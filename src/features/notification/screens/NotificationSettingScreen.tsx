import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Text } from '@/shared/components/text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import Header from '@/components/common/Header';
import { NotificationSettingItem } from '../components/NotificationSettingItem';
import { Pressable, View } from 'react-native';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useGroups } from '@/features/group/hooks/useGroups';
import type { ClientGroup } from '@/api/group/types';
import { cn } from '@/shared/utils/cn';
import type { UserGroup } from '@/shared/types';
import { NotificationPermissionBanner } from '../components/NotificationPermissionBanner';
import { useNotificationPermission } from '../hooks/useNotificationPermission';
import AnimatedPressable from '@/components/common/animated-pressable';
import { Icon } from '#/components/ui/icon';
import { ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';

type TabType = Pick<ClientGroup, 'id' | 'groupName'>;

export default function NotificationSettingScreen() {
	const { user, updateUserGroupProfile } = useAuthStore();
	const hasPermission = useNotificationPermission();

	const { groups, isLoading, error } = useGroups(user?.groups ?? []);

	// 그룹별 탭 생성
	const allTabs = groups.map((g) => ({ id: g.id, groupName: g.groupName }));
	const [selectedTab, setSelectedTab] = useState<TabType>(allTabs[0] || {});

	// 그룹별 알림 설정 상태 관리
	const [notificationSettings, setNotificationSettings] = useState<
		Record<string, UserGroup & { displayName: string }>
	>({});

	// 초기 탭 선택
	useEffect(() => {
		if (groups.length > 0 && !selectedTab) {
			setSelectedTab(groups[0]);
		}
	}, [groups, selectedTab]);

	useEffect(() => {
		if (groups.length === 0 || !user?.groups) return;
		const _notificationSettings = user?.groups?.map((g) => ({
			...g,
			displayName: groups.find((g2) => g2.id === g.groupId)?.groupName || '',
		}));

		setNotificationSettings(
			_notificationSettings.reduce(
				(acc, g) => {
					acc[g.groupId] = g;
					return acc;
				},
				{} as Record<string, UserGroup & { displayName: string }>,
			),
		);
	}, [groups, user]);

	// 알림 설정 변경 함수
	const handleNotificationChange = (
		groupId: string,
		groupName: string,
		type: 'prayerRequest' | 'fellowship',
		value: boolean,
	) => {
		// 상태 업데이트
		setNotificationSettings((prev) => ({
			...prev,
			[groupName]: {
				...prev[groupName],
				[type]: value,
			},
		}));

		// Amplitude Logging
		// trackAmplitudeEvent('Update Notification Setting', {
		// 	screen: 'More_Notification',
		// 	notificationEnabled: value,
		// 	notificationType: type,
		// });

		const userGroup = user?.groups?.find((g) => g.groupId === groupId);
		if (!userGroup) return;
		// 현재 그룹이면 업데이트
		updateUserGroupProfile(user?.id ?? '', {
			...userGroup,
			notificationPreferences: {
				fellowship:
					type === 'fellowship'
						? value
						: (userGroup.notificationPreferences?.fellowship ?? true),
				prayerRequest:
					type === 'prayerRequest'
						? value
						: (userGroup.notificationPreferences?.prayerRequest ?? true),
				board: {
					...userGroup.notificationPreferences?.board,
				},
			},
		});
	};

	const renderSettingItems = () => {
		if (!groups.length) {
			return (
				<VStack space="4xl" className="items-center justify-center py-10">
					<Text className="text-typography-500">
						그룹이 없어요. 메인화면에서 그룹을 생성하거나 참여해보세요.
					</Text>
				</VStack>
			);
		}

		if (isLoading) {
			return (
				<VStack space="4xl" className="items-center justify-center py-10">
					<Text>로딩중...</Text>
				</VStack>
			);
		}

		if (error) {
			return (
				<VStack space="4xl" className="items-center justify-center py-10">
					<Text className="text-red-500">
						오류가 발생했어요. 다시 시도해주세요.
					</Text>
				</VStack>
			);
		}

		// 특정 그룹 탭일 경우 해당 그룹의 설정만 표시
		const selectedGroup = groups.find((g) => g.id === selectedTab.id);
		if (!selectedGroup) return null;
		return (
			<VStack space="4xl" className="px-6">
				<NotificationSettingItem
					title="기도 제목 알림"
					description="기도 제목이 등록된 경우 알림"
					enabled={
						notificationSettings[selectedGroup.id]?.notificationPreferences
							?.prayerRequest ?? true
					}
					onValueChange={(value) =>
						handleNotificationChange(
							selectedGroup.id,
							selectedGroup.groupName,
							'prayerRequest',
							value,
						)
					}
				/>
				<NotificationSettingItem
					title="나눔 알림"
					description="나눔이 등록된 경우 알림"
					enabled={
						notificationSettings[selectedGroup.id]?.notificationPreferences
							?.fellowship ?? true
					}
					onValueChange={(value) =>
						handleNotificationChange(
							selectedGroup.id,
							selectedGroup.groupName,
							'fellowship',
							value,
						)
					}
				/>
				<AnimatedPressable
					onPress={() =>
						router.push({
							pathname: '/(app)/(more)/(notification-setting)/board',
							params: { groupId: selectedGroup.id },
						})
					}
				>
					<HStack className="py-2 justify-between items-center">
						<Text size="xl" className="font-pretendard-bold">
							게시판 알림 설정
						</Text>
						<Icon as={ChevronRight} className="text-typography-600" />
					</HStack>
				</AnimatedPressable>
			</VStack>
		);
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			<VStack space="xl">
				<Header label="알림 설정" />
				{hasPermission === false && <NotificationPermissionBanner />}
			</VStack>
			<VStack className="py-6">
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className="mb-8 border-b border-gray-300"
				>
					<HStack className="px-6">
						{allTabs.map((tab) => (
							<Pressable key={tab.id} onPress={() => setSelectedTab(tab)}>
								<VStack className="items-center">
									<Text
										size="xl"
										className={cn(
											selectedTab.id === tab.id
												? 'font-pretendard-bold text-primary-500'
												: 'text-typography-500',
											'py-2 px-3',
										)}
									>
										{tab.groupName}
									</Text>
									<View
										className={cn(
											'w-full h-0.5',
											selectedTab.id === tab.id
												? 'bg-primary-500'
												: 'bg-transparent',
										)}
									/>
								</VStack>
							</Pressable>
						))}
					</HStack>
				</ScrollView>
				{renderSettingItems()}
			</VStack>
		</SafeAreaView>
	);
}
